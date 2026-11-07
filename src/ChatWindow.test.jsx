import {fireEvent, render, screen} from "@testing-library/react";
import ChatWindow from "./ChatWindow.jsx";
import {ThemeContext} from "./context.js";
import {defaultTheme} from "./configs.js";
import {STATE} from "./consts.js";
import storage from "./storage.js";
import {deepCopy} from "./utils.js";
import {PREFLIGHT_ROOT_CLASS} from "./preflightScope.js";

vi.mock('./wasm_exec', () => ({}))
vi.mock('./storage.js', () => ({default: {saveBounding: vi.fn(), saveTheme: vi.fn()}}))
vi.mock('./Chat.jsx', () => ({default: () => <div data-testid="chat-content"/>}))

const bounding = {top: 10, right: 5, width: 20, height: 60}

function renderWindow() {
  const theme = deepCopy(defaultTheme)
  const setBounding = vi.fn()
  const close = vi.fn()
  const {container} = render(
    <ThemeContext.Provider value={theme}>
      <ChatWindow username="" theme={theme} bounding={bounding} setBounding={setBounding} setTheme={vi.fn()}
                  showThemeSettings={false} messages={[]} state={STATE.STREAMING} start={vi.fn()} close={close}
                  setShowThemeSettings={vi.fn()} setPrevTheme={vi.fn()} blacklist={[]} blacklistSet={new Set()}/>
    </ThemeContext.Provider>
  )
  const header = () => container.querySelector('#ptt-chat-header')
  // header buttons in order: minimize, light/dark, resize, settings, close
  const headerButton = (i) => header().querySelectorAll('button')[i]
  const miniWindow = () => container.querySelector('.ptt-chat-window')
  const minimize = () => fireEvent.click(headerButton(0))
  return {header, headerButton, miniWindow, minimize, setBounding, close}
}

// press at `from`, move through `points`, release, then click like a real browser does
function drag(el, from, ...points) {
  fireEvent.mouseDown(el, {clientX: from.x, clientY: from.y})
  points.forEach(p => fireEvent.mouseMove(document, {clientX: p.x, clientY: p.y}))
  fireEvent.mouseUp(document)
  fireEvent.click(el)
}

const center = () => ({x: window.innerWidth / 2, y: window.innerHeight / 2})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preflight scope', () => {
  test('full and minimized windows are Preflight roots, since either may be portaled out of #crx-root', () => {
    const {header, miniWindow, minimize} = renderWindow()
    expect(header().closest('section')).toHaveClass(PREFLIGHT_ROOT_CLASS)

    minimize()
    expect(miniWindow()).toHaveClass(PREFLIGHT_ROOT_CLASS)
  })
})

describe('full window header', () => {
  test('dragging a header button moves and saves without pressing it', () => {
    const {headerButton, setBounding, close} = renderWindow()
    // jsdom rects and offsetWidth are 0, so the grab offset is the pointer itself
    drag(headerButton(4), {x: 0, y: 0}, center())

    expect(close).not.toHaveBeenCalled()
    expect(setBounding.mock.calls.at(-1)[0](bounding)).toEqual({...bounding, top: 50, right: 50})
    expect(storage.saveBounding).toHaveBeenCalledTimes(1)
  })

  test('dragging the empty header area still moves', () => {
    const {header, setBounding} = renderWindow()
    drag(header(), {x: 0, y: 0}, center())

    expect(setBounding).toHaveBeenCalled()
    expect(storage.saveBounding).toHaveBeenCalledTimes(1)
  })

  test('clicking a header button presses it without moving or saving', () => {
    const {headerButton, setBounding, close} = renderWindow()
    drag(headerButton(4), {x: 50, y: 50})

    expect(close).toHaveBeenCalledTimes(1)
    expect(setBounding).not.toHaveBeenCalled()
    expect(storage.saveBounding).not.toHaveBeenCalled()
  })

  test('jitter within the threshold still counts as a click', () => {
    const {headerButton, setBounding, close} = renderWindow()
    drag(headerButton(4), {x: 50, y: 50}, {x: 52, y: 52})

    expect(close).toHaveBeenCalledTimes(1)
    expect(setBounding).not.toHaveBeenCalled()
  })

  test('a click after a previous drag presses the button again', () => {
    const {headerButton, close} = renderWindow()
    drag(headerButton(4), {x: 0, y: 0}, {x: 100, y: 100})
    drag(headerButton(4), {x: 100, y: 100})

    expect(close).toHaveBeenCalledTimes(1)
  })

  test('right-button press does not start a drag', () => {
    const {header, setBounding} = renderWindow()
    fireEvent.mouseDown(header(), {button: 2, clientX: 0, clientY: 0})
    fireEvent.mouseMove(document, {clientX: 100, clientY: 100})

    expect(setBounding).not.toHaveBeenCalled()
  })

  test('mousedown in the chat content does not start a drag', () => {
    const {setBounding} = renderWindow()
    fireEvent.mouseDown(screen.getByTestId('chat-content'), {clientX: 0, clientY: 0})
    fireEvent.mouseMove(document, {clientX: 100, clientY: 100})

    expect(setBounding).not.toHaveBeenCalled()
  })
})

describe('minimized window', () => {
  test('shows only the restore button at the saved position', () => {
    const {miniWindow, minimize} = renderWindow()
    minimize()

    expect(screen.queryByTestId('chat-content')).not.toBeInTheDocument()
    expect(miniWindow().querySelectorAll('button')).toHaveLength(1)
    expect(miniWindow().style.top).toBe('10%')
    expect(miniWindow().style.right).toBe('5%')
  })

  test('clicking the button restores without moving or saving', () => {
    const {miniWindow, minimize, setBounding} = renderWindow()
    minimize()
    drag(miniWindow().querySelector('button'), {x: 50, y: 50})

    expect(screen.getByTestId('chat-content')).toBeInTheDocument()
    expect(setBounding).not.toHaveBeenCalled()
    expect(storage.saveBounding).not.toHaveBeenCalled()
  })

  test('dragging the button moves and saves without restoring', () => {
    const {miniWindow, minimize, setBounding} = renderWindow()
    minimize()
    drag(miniWindow().querySelector('button'), {x: 0, y: 0}, center())

    expect(screen.queryByTestId('chat-content')).not.toBeInTheDocument()
    expect(setBounding.mock.calls.at(-1)[0](bounding)).toEqual({...bounding, top: 50, right: 50})
    expect(storage.saveBounding).toHaveBeenCalledTimes(1)
  })

  test('dragging from the padding around the button also moves', () => {
    const {miniWindow, minimize, setBounding} = renderWindow()
    minimize()
    drag(miniWindow(), {x: 0, y: 0}, {x: 100, y: 100})

    expect(setBounding).toHaveBeenCalled()
    expect(screen.queryByTestId('chat-content')).not.toBeInTheDocument()
  })

  test('a click after a previous drag restores', () => {
    const {miniWindow, minimize} = renderWindow()
    minimize()
    drag(miniWindow().querySelector('button'), {x: 0, y: 0}, {x: 100, y: 100})
    drag(miniWindow().querySelector('button'), {x: 100, y: 100})

    expect(screen.getByTestId('chat-content')).toBeInTheDocument()
  })
})
