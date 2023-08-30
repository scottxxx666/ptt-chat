import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import PropTypes from "prop-types";
import {THEME_MODE} from "./consts.js";

IconButton.propTypes = {
  click: PropTypes.func,
  children: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
}

export default function IconButton({click, children, style = {}, className = ''}) {
  const darkTheme = useContext(ThemeContext)

  return (
    <button onClick={click} className={`${className} ${darkTheme.mode === THEME_MODE.DARK ? 'ptt-fill-stone-50' : ''}`} style={style}>
      {children}
    </button>
  )
}
