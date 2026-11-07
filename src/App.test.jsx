import {act, render, screen} from "@testing-library/react";
import App from "./App.jsx";
import {MESSAGE_TYPE} from "./consts.js";
import storage from "./storage.js";
import {defaultTheme} from "./configs.js";

const chatWindow = vi.hoisted(() => ({props: null}))

vi.mock('./wasm_exec', () => ({}))
vi.mock('./storage.js', () => ({
  default: {
    loadTheme: vi.fn(async () => undefined),
    loadBounding: vi.fn(async () => undefined),
  },
}))
vi.mock('./ChatWindow.jsx', () => ({
  default: (props) => {
    chatWindow.props = props
    return <div data-testid="chat">{props.messages.length}</div>
  },
}))

vi.mock('./DanmakuLayer.jsx', () => ({
  default: (props) => <div data-testid="danmaku">{props.messages.length}</div>,
}))

const loginData = {username: 'user', password: 'pass', board: 'Test', article: '#ABC'}

function messageListener() {
  return chrome.runtime.onMessage.addListener.mock.calls[0][0]
}

function emit(request) {
  act(() => messageListener()(request))
}

beforeEach(() => {
  chatWindow.props = null
  global.chrome = {
    runtime: {
      sendMessage: vi.fn(),
      onMessage: {addListener: vi.fn(), removeListener: vi.fn()},
    },
  }
  global.alert = vi.fn()
})

test('subscribes to runtime messages once across re-renders', async () => {
  render(<App/>)
  await act(async () => {})

  emit({type: MESSAGE_TYPE.MSG, data: JSON.stringify([{id: 1}])})
  emit({type: MESSAGE_TYPE.MSG, data: JSON.stringify([{id: 2}])})

  expect(screen.getByTestId('chat')).toHaveTextContent('2')
  expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1)
  expect(chrome.runtime.onMessage.removeListener).not.toHaveBeenCalled()
})

test('removes the listener on unmount', async () => {
  const {unmount} = render(<App/>)
  await act(async () => {})
  const listener = messageListener()

  unmount()

  expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(listener)
})

test('DEADLINE_EXCEEDED restarts with the last login data', async () => {
  render(<App/>)
  await act(async () => {})
  act(() => chatWindow.props.start(loginData))

  emit({type: MESSAGE_TYPE.ERROR, data: 'DEADLINE_EXCEEDED'})

  const starts = chrome.runtime.sendMessage.mock.calls.filter(([m]) => m.type === MESSAGE_TYPE.START)
  expect(starts).toEqual([
    [{type: MESSAGE_TYPE.START, data: loginData}],
    [{type: MESSAGE_TYPE.START, data: loginData}],
  ])
  expect(chatWindow.props.username).toBe('user')
  expect(alert).not.toHaveBeenCalled()
})

test('unknown error alerts and turns the chat off', async () => {
  render(<App/>)
  await act(async () => {})

  emit({type: MESSAGE_TYPE.ERROR, data: 'boom'})

  expect(alert).toHaveBeenCalledWith('boom')
  expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({type: MESSAGE_TYPE.OFF})
  expect(screen.queryByTestId('chat')).not.toBeInTheDocument()
})

test('danmaku layer is hidden by default', async () => {
  render(<App/>)
  await act(async () => {})

  emit({type: MESSAGE_TYPE.MSG, data: JSON.stringify([{id: 1}])})

  expect(screen.queryByTestId('danmaku')).not.toBeInTheDocument()
})

test('danmaku layer shows while streaming when enabled', async () => {
  storage.loadTheme.mockResolvedValueOnce({danmaku: {...defaultTheme.danmaku, enabled: true}})
  render(<App/>)
  await act(async () => {})

  expect(screen.queryByTestId('danmaku')).not.toBeInTheDocument()

  emit({type: MESSAGE_TYPE.MSG, data: JSON.stringify([{id: 1}])})

  expect(screen.getByTestId('danmaku')).toHaveTextContent('1')
})

test('saved danmaku settings missing new fields fall back to defaults', async () => {
  storage.loadTheme.mockResolvedValueOnce({danmaku: {enabled: true, opacity: 0.3}})
  render(<App/>)
  await act(async () => {})

  expect(chatWindow.props.theme.danmaku).toEqual({...defaultTheme.danmaku, enabled: true, opacity: 0.3})
})
