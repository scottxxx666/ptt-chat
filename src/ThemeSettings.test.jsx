import {fireEvent, render, screen} from "@testing-library/react";
import ThemeSettings from "./ThemeSettings.jsx";
import {ThemeContext} from "./context.js";
import {defaultTheme} from "./configs.js";
import {deepCopy} from "./utils.js";

function renderSettings(danmaku = {}) {
  const theme = deepCopy(defaultTheme)
  theme.danmaku = {...theme.danmaku, ...danmaku}
  const setTheme = vi.fn()
  const {container} = render(
    <ThemeContext.Provider value={theme}>
      <ThemeSettings username="" setTheme={setTheme} cancel={vi.fn()} save={vi.fn()} blacklist={[]}
                     addBlacklist={vi.fn()} deleteBlacklist={vi.fn()}/>
    </ThemeContext.Provider>
  )
  // setTheme receives an updater; apply it to see the resulting theme
  const applied = () => setTheme.mock.calls.at(-1)[0](theme)
  return {container, applied}
}

test('danmaku options are hidden while disabled', () => {
  renderSettings()
  expect(screen.queryByText('彈幕速度：')).not.toBeInTheDocument()
})

test('toggles danmaku on', () => {
  const {container, applied} = renderSettings()
  fireEvent.click(container.querySelector('input[name="danmaku-enabled"]'))
  expect(applied().danmaku.enabled).toBe(true)
})

test('changes speed, area and opacity', () => {
  const {container, applied} = renderSettings({enabled: true})

  fireEvent.click(screen.getByLabelText('快'))
  expect(applied().danmaku.duration).toBe(5000)

  fireEvent.click(screen.getByLabelText('1/4'))
  expect(applied().danmaku.area).toBe(0.25)

  fireEvent.change(container.querySelector('input[name="danmaku-opacity"]'), {target: {value: '0.5'}})
  expect(applied().danmaku.opacity).toBe(0.5)
})

test('keeps other danmaku settings when one changes', () => {
  const {applied} = renderSettings({enabled: true, opacity: 0.3})
  fireEvent.click(screen.getByLabelText('全螢幕'))
  expect(applied().danmaku).toEqual({...defaultTheme.danmaku, enabled: true, opacity: 0.3, area: 1})
})

test('danmaku size is separate from chat font size', () => {
  const {container, applied} = renderSettings({enabled: true})
  fireEvent.click(container.querySelector('input[name="danmaku-fontSize"][value="35"]'))
  expect(applied().danmaku.fontSize).toBe(35)
  expect(applied().font.size).toBe(defaultTheme.font.size)
})

test('changes danmaku density', () => {
  const {container, applied} = renderSettings({enabled: true})
  fireEvent.click(container.querySelector('input[name="danmaku-density"][value="OVERLAP"]'))
  expect(applied().danmaku.density).toBe('OVERLAP')
})
