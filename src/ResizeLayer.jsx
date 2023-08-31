import Maximize from "./icons/Maximize.jsx";
import {useContext, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {ThemeContext} from "./App.jsx";
import {themeColor} from "./theme.js";

ResizeLayer.propTypes = {
  windowRef: PropTypes.object,
  setSettings: PropTypes.func,
}

export default function ResizeLayer({windowRef, setSettings}) {
  const theme = useContext(ThemeContext);

  const [isWidth, setIsWidth] = useState(false)
  const [isHeight, setIsHeight] = useState(false)

  const rightRef = useRef()
  const topRef = useRef()

  function startWidth() {
    rightRef.current = windowRef.current.offsetLeft + windowRef.current.offsetWidth
    setIsWidth(true)
  }

  function startHeight() {
    topRef.current = windowRef.current.offsetTop
    setIsHeight(true)
  }

  function handleWidth(e) {
    setSettings(prevState => ({
      ...prevState,
      width: +((rightRef.current - e.clientX) / window.innerWidth * 100).toFixed(2)
    }))
  }

  function handleHeight(e) {
    setSettings(prevState => ({
      ...prevState,
      height: +((e.clientY - topRef.current) / window.innerHeight * 100).toFixed(2)
    }))
  }

  useEffect(() => {
    if (isWidth) {
      document.addEventListener('mousemove', handleWidth)
      document.addEventListener('mouseup', stop, {once: true});
      return () => {
        document.removeEventListener('mousemove', handleWidth)
        document.removeEventListener('mouseup', stop);
      }
    }
    document.removeEventListener('mousemove', handleWidth)
  }, [isWidth])

  useEffect(() => {
    if (isHeight) {
      document.addEventListener('mousemove', handleHeight)
      document.addEventListener('mouseup', stop, {once: true});
      return () => {
        document.removeEventListener('mousemove', handleHeight)
        document.removeEventListener('mouseup', stop);
      }
    }
    document.removeEventListener('mousemove', handleHeight)
  }, [isHeight])

  function stop() {
    setIsWidth(false)
    setIsHeight(false)
  }

  return <section id="ptt-size-layer">
    <button
      id="ptt-width"
      className={`ptt-w-fit ptt-h-fit ptt-absolute ptt-top-0 ptt-left-0 ptt-bottom-0 ptt-m-auto ${themeColor(theme).resize}`}
      onMouseDown={startWidth}>
      <Maximize/>
    </button>
    <button
      id="ptt-height"
      className={`ptt-w-fit ptt-h-fit ptt-absolute ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-m-auto ${themeColor(theme).resize}`}
      onMouseDown={startHeight}>
      <Maximize/>
    </button>
  </section>
}