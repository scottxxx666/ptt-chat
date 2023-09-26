import {render, screen} from "@testing-library/react";
import IconButton from "./IconButton.jsx";
import {themeColor} from "./theme.js";

vi.mock('./theme.js')

test('class should have theme color', () => {
  themeColor.mockImplementation(() => ({iconButton: 'fakeColor'}))
  render(<IconButton/>)
  expect(screen.getByTestId('icon-button')).toHaveClass('fakeColor')
})