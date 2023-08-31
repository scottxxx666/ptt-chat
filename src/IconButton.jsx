import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import PropTypes from "prop-types";
import {themeColor} from "./theme.js";

IconButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
}

export default function IconButton({onClick, children, style = {}, className = ''}) {
  const darkTheme = useContext(ThemeContext)

  return (
    <button onClick={onClick} className={`${className} ${themeColor(darkTheme).iconButton}`} style={style}>
      {children}
    </button>
  )
}
