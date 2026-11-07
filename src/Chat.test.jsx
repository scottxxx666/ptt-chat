import {render, screen} from "@testing-library/react";
import Chat from "./Chat.jsx";
import {ThemeContext} from "./context.js";
import {defaultTheme} from "./configs.js";
import {deepCopy} from "./utils.js";
import {THEME_MODE} from "./consts.js";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

function renderChat(messages, mode = THEME_MODE.DARK) {
  const theme = {...deepCopy(defaultTheme), mode}
  return render(
    <ThemeContext.Provider value={theme}>
      <Chat messages={messages} blacklistSet={new Set()}/>
    </ThemeContext.Provider>
  )
}

describe('Chat links', () => {
  it('renders a URL in a message as a link opening in a new tab', () => {
    renderChat([{id: 1, user: 'alice', message: '看 https://youtu.be/abc 這個'}])
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute('href', 'https://youtu.be/abc')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    expect(a).toHaveTextContent('https://youtu.be/abc')
    expect(a.parentElement).toHaveTextContent(': 看 https://youtu.be/abc 這個')
  })

  it('renders a message without URLs as plain text', () => {
    renderChat([{id: 1, user: 'alice', message: '推 javascript:alert(1)'}])
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText(': 推 javascript:alert(1)')).toBeInTheDocument()
  })

  it('renders every URL in a message', () => {
    renderChat([{id: 1, user: 'alice', message: 'https://a.com https://b.com'}])
    expect(screen.getAllByRole('link').map(a => a.getAttribute('href')))
      .toEqual(['https://a.com', 'https://b.com'])
  })

  it('colors links by theme mode', () => {
    const {unmount} = renderChat([{id: 1, user: 'a', message: 'https://a.com'}], THEME_MODE.DARK)
    expect(screen.getByRole('link')).toHaveClass('ptt-text-sky-400')
    unmount()
    renderChat([{id: 1, user: 'a', message: 'https://a.com'}], THEME_MODE.LIGHT)
    expect(screen.getByRole('link')).toHaveClass('ptt-text-sky-700')
  })
})
