import {act, fireEvent, render} from "@testing-library/react";
import DanmakuLayer from "./DanmakuLayer.jsx";
import {ThemeContext} from "./context.js";
import {defaultTheme} from "./configs.js";
import {deepCopy} from "./utils.js";
import {DANMAKU_DENSITY} from "./consts.js";

const msg = (id, user = 'u' + id) => ({id, user, message: 'msg' + id})

function makeTheme(danmaku = {}) {
  const theme = deepCopy(defaultTheme)
  theme.danmaku = {...theme.danmaku, enabled: true, ...danmaku}
  return theme
}

function renderLayer({messages = [], blacklistSet = new Set(), theme = makeTheme()} = {}) {
  const ui = (props) => (
    <ThemeContext.Provider value={props.theme}>
      <DanmakuLayer messages={props.messages} blacklistSet={props.blacklistSet}/>
    </ThemeContext.Provider>
  )
  const result = render(ui({messages, blacklistSet, theme}))
  return {
    ...result,
    update: (next) => result.rerender(ui({messages, blacklistSet, theme, ...next})),
  }
}

const moving = (container) => [...container.querySelectorAll('.ptt-danmaku-move')]

let video

beforeEach(() => {
  vi.useFakeTimers()
  video = document.createElement('video')
  video.getBoundingClientRect = () => ({top: 10, left: 20, width: 1000, height: 400})
  document.body.append(video)
})

afterEach(() => {
  video.remove()
  vi.useRealTimers()
})

test('renders nothing without a video', () => {
  video.remove()
  const {queryByTestId} = renderLayer()
  expect(queryByTestId('ptt-danmaku-layer')).not.toBeInTheDocument()
})

test('overlays the video rect with the configured opacity', () => {
  const {getByTestId} = renderLayer({theme: makeTheme({opacity: 0.5})})
  const layer = getByTestId('ptt-danmaku-layer')
  expect(layer).toHaveStyle({top: '10px', left: '20px', width: '1000px', height: '400px', opacity: '0.5'})
})

test('does not replay messages that existed before mount', () => {
  const {container} = renderLayer({messages: [msg(1), msg(2)]})
  act(() => vi.advanceTimersByTime(2000))
  expect(moving(container)).toHaveLength(0)
})

test('spreads a new batch over time', () => {
  const {container, update} = renderLayer({messages: [msg(1)]})

  update({messages: [msg(1), msg(2), msg(3)]})
  act(() => vi.advanceTimersByTime(0))
  expect(moving(container).map(e => e.textContent)).toEqual(['msg2'])

  act(() => vi.advanceTimersByTime(500))
  expect(moving(container).map(e => e.textContent)).toEqual(['msg2', 'msg3'])
})

test('sets animation duration and travel distance from settings', () => {
  const {container, update} = renderLayer({theme: makeTheme({duration: 5000})})
  update({messages: [msg(1)]})
  act(() => vi.advanceTimersByTime(0))

  const [item] = moving(container)
  expect(item.style.animationDuration).toBe('5000ms')
  // jsdom has no layout, so text width is 0 and distance equals the video width
  expect(item.style.getPropertyValue('--ptt-danmaku-distance')).toBe('-1000px')
})

test('skips blacklisted users', () => {
  const {container, update} = renderLayer({blacklistSet: new Set(['bad'])})
  update({messages: [msg(1, 'bad'), msg(2)]})
  act(() => vi.advanceTimersByTime(1000))
  expect(moving(container).map(e => e.textContent)).toEqual(['msg2'])
})

test('uses a new lane when the previous one is still busy', () => {
  const {container, update} = renderLayer()
  update({messages: [msg(1)]})
  update({messages: [msg(1), msg(2)]})
  act(() => vi.advanceTimersByTime(0))

  // default 25px font: lane ceil(25 * 1.25) = 32px
  expect(moving(container).map(e => e.style.top)).toEqual(['0px', '32px'])
})

// 400px * 0.25 / 32px lane = 3 lanes; 6 messages at the same instant
function fillLanes(density) {
  const {container, update} = renderLayer({theme: makeTheme({area: 0.25, density})})
  const messages = []
  for (let i = 1; i <= 6; i++) {
    messages.push(msg(i))
    update({messages: [...messages]})
  }
  act(() => vi.advanceTimersByTime(0))
  return moving(container)
}

test('normal density drops danmaku when every lane is busy', () => {
  expect(fillLanes(DANMAKU_DENSITY.NORMAL)).toHaveLength(3)
})

test('overlap density stacks extra danmaku onto random lanes', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.99)
  const items = fillLanes(DANMAKU_DENSITY.OVERLAP)
  vi.restoreAllMocks()

  expect(items).toHaveLength(6)
  // random 0.99 picks the last lane (index 2 → 64px)
  expect(items.map(e => e.style.top)).toEqual(['0px', '32px', '64px', '64px', '64px', '64px'])
})

test('removes a danmaku when its animation ends', () => {
  const {container, update} = renderLayer()
  update({messages: [msg(1)]})
  act(() => vi.advanceTimersByTime(0))

  fireEvent.animationEnd(moving(container)[0])
  expect(moving(container)).toHaveLength(0)
})

test('clears pending timers on unmount', () => {
  const {update, unmount} = renderLayer()
  update({messages: [msg(1), msg(2), msg(3)]})
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

test('font size stays fixed when the video grows (e.g. fullscreen)', () => {
  const {container, update} = renderLayer({theme: makeTheme({fontSize: 35})})
  update({messages: [msg(1)]})
  act(() => vi.advanceTimersByTime(0))

  video.getBoundingClientRect = () => ({top: 0, left: 0, width: 1920, height: 1080})
  act(() => window.dispatchEvent(new Event('resize')))
  update({messages: [msg(1), msg(2)]})
  act(() => vi.advanceTimersByTime(0))

  expect(moving(container).map(e => e.style.fontSize)).toEqual(['35px', '35px'])
})

test('ignores the chat font size class', () => {
  const theme = makeTheme()
  theme.font.size = 'ptt-text-sm'
  const {container, update} = renderLayer({theme})
  update({messages: [msg(1)]})
  act(() => vi.advanceTimersByTime(0))
  expect(moving(container)[0]).not.toHaveClass('ptt-text-sm')
})
