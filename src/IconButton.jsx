import {useContext} from "react";
import {DarkThemeContext} from "./App.jsx";
import PropTypes from "prop-types";

IconButton.propTypes = {
  click: PropTypes.func,
  children: PropTypes.object,
  style: PropTypes.object,
  className: PropTypes.string,
}

export default function IconButton({click, children, style = {}, className = ''}) {
  const darkTheme = useContext(DarkThemeContext)

  return (
    <button onClick={click} className={`${className} ${darkTheme ? 'ptt-fill-stone-50' : ''}`} style={style}>
      {children}
    </button>
  )
}
