import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import PropTypes from "prop-types";
import {themeColor} from "./theme.js";

IconButton.propTypes = {
  click: PropTypes.func,
  children: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
}

export default function IconButton({click, children, style = {}, className = ''}) {
  const darkTheme = useContext(ThemeContext)

  return (
    <button onClick={click} className={`${className} ${themeColor(darkTheme).iconButton}`} style={style}>
      {children}
    </button>
  )
}
