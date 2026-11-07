import {useCallback, useEffect, useRef, useState} from 'react'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"
import Loading from "./Loading.jsx";
import {STATE, THEME_MODE} from "./consts.js";
import ThemeSettings from "./ThemeSettings.jsx";
import {bgColor, textColor, themeColor} from "./theme.js";
import SettingsIcon from "./icons/SettingsIcon.jsx";
import CloseIcon from "./icons/CloseIcon.jsx";
import IconButton from "./IconButton.jsx";
import MinimizeIcon from "./icons/MinimizeIcon.jsx";
import LightDarkIcon from "./icons/LightDarkIcon.jsx";
import {deepCopy} from "./utils.js";
import ResizeIcon from "./icons/ResizeIcon.jsx";
import ResizeLayer from "./ResizeLayer.jsx";
import storage from "./storage.js";
import iframe from "./iframe.js";
import PropTypes from "prop-types";
import {PREFLIGHT_ROOT_CLASS} from "./preflightScope.js";

ChatWindow.propTypes = {
  username: PropTypes.string.isRequired,
  theme: PropTypes.object,
  bounding: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  setTheme: PropTypes.func,
  setBounding: PropTypes.func,
  showThemeSettings: PropTypes.bool,
  messages: PropTypes.array,
  state: PropTypes.number,
  start: PropTypes.func,
  setShowThemeSettings: PropTypes.func,
  close: PropTypes.func,
  prevTheme: PropTypes.object,
  setPrevTheme: PropTypes.func,
  blacklist: PropTypes.array,
  addBlacklist: PropTypes.func,
  deleteBlacklist: PropTypes.func,
  blacklistSet: PropTypes.object,
}

function ChatWindow({
                      username,
                      theme,
                      bounding,
                      setTheme,
                      setBounding,
                      showThemeSettings,
                      messages,
                      state,
                      start,
                      setShowThemeSettings,
                      close,
                      prevTheme,
                      setPrevTheme,
                      blacklist,
                      addBlacklist,
                      deleteBlacklist,
                      blacklistSet,
                    }) {
  const [isMini, setIsMini] = useState(false)

  function toggleTheme() {
    if (showThemeSettings) cancelTheme()
    else openTheme()
  }

  function openTheme() {
    setPrevTheme(theme);
    setShowThemeSettings(true)
  }

  function cancelTheme() {
    setTheme(deepCopy(prevTheme))
    setShowThemeSettings(false)
  }

  function saveTheme() {
    setShowThemeSettings(false)
    storage.saveTheme(theme)
  }

  const cancelThemeCallBack = useCallback(cancelTheme, [setTheme, setShowThemeSettings, prevTheme])
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        cancelThemeCallBack()
      }
    }

    if (showThemeSettings) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showThemeSettings, cancelThemeCallBack])

  function toggleChat() {
    setIsMini(prevState => !prevState)
  }

  function toggleThemeMode() {
    setTheme(prev => ({...deepCopy(prev), mode: prev.mode === THEME_MODE.DARK ? THEME_MODE.LIGHT : THEME_MODE.DARK}))
  }

  const [isResizing, setIsResizing] = useState(false)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsResizing(false)
      }
    }

    if (isResizing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isResizing])

  const [isMoving, setIsMoving] = useState(false)

  const mouseDownRef = useRef(null)
  // the drag area contains buttons: moving less than this many px is still a click on them
  const DRAG_THRESHOLD = 3
  const dragStartRef = useRef(null)
  const dragMovedRef = useRef(false)

  function startMoving(e) {
    if (e.button !== 0) return
    e.preventDefault()
    const rect = windowRef.current.getBoundingClientRect()
    mouseDownRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    dragStartRef.current = {x: e.clientX, y: e.clientY}
    dragMovedRef.current = false
    setIsMoving(true)
  }

  const windowRef = useRef();
  const boundingRef = useRef()
  boundingRef.current = bounding

  useEffect(() => {
    function handleMoving(e) {
      const start = dragStartRef.current
      if (!dragMovedRef.current) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) <= DRAG_THRESHOLD) return
        dragMovedRef.current = true
      }
      const w = windowRef.current.offsetWidth - mouseDownRef.current.x
      const h = mouseDownRef.current.y
      setBounding(prevState => ({
        ...prevState,
        top: +((e.clientY - h) / window.innerHeight * 100).toFixed(2),
        right: +(100 - (e.clientX + w) / window.innerWidth * 100).toFixed(2)
      }))
    }

    function stopMoving() {
      setIsMoving(false)
      if (dragMovedRef.current) storage.saveBounding(boundingRef.current)
    }

    if (isMoving) {
      iframe.clearPointerEvent()
      document.addEventListener('mousemove', handleMoving)
      document.addEventListener('mouseup', stopMoving);
      return () => {
        document.removeEventListener('mousemove', handleMoving)
        document.removeEventListener('mouseup', stopMoving);
        iframe.autoPointerEvent()
      }
    }
  }, [isMoving, setBounding])

  // the click that ends a drag must not reach the button under the pointer
  function suppressClickAfterDrag(e) {
    if (!dragMovedRef.current) return
    dragMovedRef.current = false
    e.stopPropagation()
    e.preventDefault()
  }

  if (isMini) {
    return (
      <div
        ref={windowRef}
        onMouseDown={startMoving}
        onClickCapture={suppressClickAfterDrag}
        className={`${PREFLIGHT_ROOT_CLASS} ptt-chat-window ptt-flex ptt-h-fit ptt-rounded-md ptt-w-fit ptt-py-1 ptt-px-2 ${themeColor(theme).background} ${themeColor(theme).text}`}
        style={{top: bounding.top + '%', right: bounding.right + '%'}}
      >
        <IconButton onClick={toggleChat} style={{transform: 'scaleX(-1)'}}><MinimizeIcon/></IconButton>
      </div>
    )
  }

  return (
    <section className={`${PREFLIGHT_ROOT_CLASS} ptt-chat ptt-text-base`}>
      <div
        ref={windowRef}
        className={`ptt-chat-window ptt-rounded-md ptt-flex ptt-flex-col ptt-py-2 ptt-px-2 ptt-overflow-auto ptt-text-left ${bgColor(theme)} ${textColor(theme)} ${theme.transparent ? '[&:not(:hover)]:ptt-bg-transparent' : ''}`}
        style={{
          top: `${bounding.top}%`,
          right: `${bounding.right}%`,
          width: `${bounding.width}%`,
          height: `${bounding.height}%`,
        }}
      >
        {isResizing && <ResizeLayer windowRef={windowRef} bounding={bounding} setBounding={setBounding}/>}
        <div id="ptt-chat-header" className={'ptt-flex ptt-mb-2 ptt-px-1 ptt-justify-between'}
             onMouseDown={startMoving} onClickCapture={suppressClickAfterDrag}>
          <div className={'ptt-flex ptt-mr-6'}>
            <IconButton onClick={toggleChat}><MinimizeIcon/></IconButton>
            <IconButton className={`ptt-ml-2`} onClick={toggleThemeMode}>
              <LightDarkIcon/>
            </IconButton>
            <IconButton className={`ptt-ml-2`} onClick={() => setIsResizing(prev => !prev)}><ResizeIcon/></IconButton>
          </div>
          <div className={'ptt-flex'}>
            <IconButton onClick={toggleTheme}><SettingsIcon/></IconButton>
            <IconButton onClick={close} className={'ptt-ml-2'}><CloseIcon/></IconButton>
          </div>
        </div>
        {state === STATE.LOGIN ? <Login start={start}/> :
          state === STATE.LOADING ? <Loading/> : <Chat blacklistSet={blacklistSet} messages={messages}/>}
      </div>
      {
        showThemeSettings &&
        <ThemeSettings
          username={username}
          cancel={cancelTheme}
          save={saveTheme}
          setTheme={setTheme}
          blacklist={blacklist}
          addBlacklist={addBlacklist}
          deleteBlacklist={deleteBlacklist}
        />
      }
    </section>
  )
}

export default ChatWindow
