import Maximize from "./icons/Maximize.jsx";
import {useContext, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {ThemeContext} from "./App.jsx";
import {themeColor} from "./theme.js";
import storage from "./storage.js";
import iframe from "./iframe.js";

ResizeLayer.propTypes = {
  windowRef: PropTypes.object,
  bounding: PropTypes.object,
  setBounding: PropTypes.func,
}

export default function ResizeLayer({windowRef, bounding, setBounding}) {
  const theme = useContext(ThemeContext);

  const [isWidth, setIsWidth] = useState(false)
  const [isHeight, setIsHeight] = useState(false)

  const rightRef = useRef()
  const topRef = useRef()
  const boundingRef = useRef()
  boundingRef.current = bounding

  function startWidth() {
    rightRef.current = windowRef.current.offsetLeft + windowRef.current.offsetWidth
    setIsWidth(true)
  }

  function startHeight() {
    topRef.current = windowRef.current.offsetTop
    setIsHeight(true)
  }

  useEffect(() => {
    function handleWidth(e) {
      setBounding(prevState => ({
        ...prevState,
        width: +((rightRef.current - e.clientX) / window.innerWidth * 100).toFixed(2)
      }))
    }

    if (isWidth) {
      iframe.clearPointerEvent();
      document.addEventListener('mousemove', handleWidth)
      document.addEventListener('mouseup', stop);
      return () => {
        document.removeEventListener('mousemove', handleWidth)
        document.removeEventListener('mouseup', stop);
        iframe.autoPointerEvent()
      }
    }
    storage.saveBounding(boundingRef.current)
  }, [isWidth, setBounding])

  useEffect(() => {
    function handleHeight(e) {
      setBounding(prevState => ({
        ...prevState,
        // add more height prevent triggering mouseup event outside
        height: +((e.clientY - topRef.current) / window.innerHeight * 100).toFixed(2) + 0.5
      }))
    }

    if (isHeight) {
      iframe.clearPointerEvent()
      document.addEventListener('mousemove', handleHeight)
      document.addEventListener('mouseup', stop);
      return () => {
        document.removeEventListener('mousemove', handleHeight)
        document.removeEventListener('mouseup', stop);
        iframe.autoPointerEvent()
      }
    }
    storage.saveBounding(boundingRef.current)
  }, [isHeight, setBounding])

  function stop() {
    setIsWidth(false)
    setIsHeight(false)
  }

  return <section className="ptt-size-layer ptt-m-0">
    <button
      className={`ptt-border-none ptt-width ptt-w-fit ptt-h-fit ptt-absolute ptt-top-0 ptt-left-0 ptt-bottom-0 ptt-m-auto ${themeColor(theme).resize}`}
      onMouseDown={startWidth}>
      <Maximize/>
    </button>
    <button
      className={`ptt-border-none ptt-height ptt-w-fit ptt-h-fit ptt-absolute ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-m-auto ${themeColor(theme).resize}`}
      onMouseDown={startHeight}>
      <Maximize/>
    </button>
  </section>
}