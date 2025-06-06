import {useContext} from "react";
import {ThemeContext} from "./context.js";
import PropTypes from "prop-types";
import {themeColor} from "./theme.js";

IconButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  style: PropTypes.object,
  className: PropTypes.string,
}

export default function IconButton({onClick, children, style = {}, className = ''}) {
  const darkTheme = useContext(ThemeContext)

  return (
    <button
      onClick={onClick}
      className={`ptt-border-none ${className} ${themeColor(darkTheme).iconButton}`}
      style={style}
      data-testid="icon-button">
      {children}
    </button>
  )
}
