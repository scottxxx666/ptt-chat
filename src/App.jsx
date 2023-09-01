import {createContext, useEffect, useRef, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"
import {defaultBounding, defaultTheme, MAX_MESSAGE_COUNT} from "./configs.js";
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
import chromeHelper from "./chromeHelper.js";

export const ThemeContext = createContext(null);

function App() {
  console.log('App')
  const [state, setState] = useState(STATE.LOGIN)
  const [messages, setMessages] = useState([])
  const [isMini, setIsMini] = useState(false)
  const [bounding, setBounding] = useState(defaultBounding())

  const [theme, setTheme] = useState(deepCopy(defaultTheme))
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const prevThemeRef = useRef();

  function toggleTheme() {
    if (showThemeSettings) cancelTheme()
    else openTheme()
  }

  function openTheme() {
    prevThemeRef.current = deepCopy(theme);
    setShowThemeSettings(true)
  }

  function cancelTheme() {
    setTheme(prevThemeRef.current)
    setShowThemeSettings(false)
  }

  function saveTheme() {
    setShowThemeSettings(false)
    chromeHelper.saveTheme(theme)
  }

  async function initTheme() {
    const themeData = await chromeHelper.loadTheme()
    if (themeData) {
      return setTheme(deepCopy(themeData))
    }
    return setTheme(deepCopy(defaultTheme))
  }

  async function initBounding() {
    const boundingData = await chromeHelper.loadBounding()
    if (boundingData) {
      return setBounding(deepCopy(boundingData))
    }
    return setBounding(deepCopy(defaultBounding()))
  }

  useEffect(() => {
    initTheme()
    initBounding()
  }, [])

  useEffect(() => {
    prevThemeRef.current = deepCopy(theme)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        cancelTheme()
      }
    }

    if (showThemeSettings) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showThemeSettings])

  function messageListener(request, sender, sendResponse) {
    console.log(request)
    const {type, data} = request
    if (type === 'MSG') {
      setState(STATE.STREAMING)
      const messages = JSON.parse(data)
      if (messages.length === 0) return
      setMessages(prev => [...prev, ...messages].slice(-MAX_MESSAGE_COUNT))
    } else if (type === 'DEFAULT') {
      initTheme()
      initBounding().then(() => chromeHelper.saveBounding(bounding))
      setShowThemeSettings(false)
    } else if (type === 'STOP') {
      reset()
    } else if (type === 'ERR') {
      if (request.data === 'MSG_ENCODE_ERR') {
        alert('推文中含有未支援的字元')
        return;
      }
      alert(request.data)
      close()
    }
  }

  function reset() {
    setState(STATE.LOGIN)
    setMessages([])
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageListener)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  async function start(data) {
    chrome.runtime.sendMessage({type: "START", data});
    setState(STATE.LOADING)
  }

  function close() {
    chrome.runtime.sendMessage({type: 'STOP'});
    setState(STATE.LOGIN)
  }

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

  function startMoving(e) {
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    mouseDownRef.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }
    setIsMoving(true)
  }

  function stopMoving() {
    setIsMoving(false)
  }

  const windowRef = useRef();

  function handleMoving(e) {
    const w = windowRef.current.offsetWidth - mouseDownRef.current.x
    const h = mouseDownRef.current.y
    setBounding(prevState => ({
      ...prevState,
      top: +((e.clientY - h) / window.innerHeight * 100).toFixed(2),
      right: +(100 - (e.clientX + w) / window.innerWidth * 100).toFixed(2)
    }))
  }


  const mountRef = useRef(false);
  useEffect(() => {
    if (isMoving) {
      document.addEventListener('mousemove', handleMoving)
      document.addEventListener('mouseup', stopMoving);
      return () => {
        document.removeEventListener('mousemove', handleMoving)
        document.removeEventListener('mouseup', stopMoving);
      }
    }
    if (mountRef.current) {
      chromeHelper.saveBounding(deepCopy(bounding))
    }
    if (!mountRef.current) mountRef.current = true
  }, [isMoving])

  if (isMini) {
    return (<ThemeContext.Provider value={theme}>
      <div
        id="ptt-chat-window"
        className={`ptt-flex ptt-h-fit ptt-rounded-md ptt-w-fit ptt-py-1 ptt-px-2 ${themeColor(theme).background} ${themeColor(theme).text}`}
        style={{top: bounding.top + '%', right: bounding.right + '%'}}
      >
        <IconButton onClick={toggleChat} style={{transform: 'scaleX(-1)'}}><MinimizeIcon/></IconButton>
      </div>
    </ThemeContext.Provider>)
  }

  return (<ThemeContext.Provider value={theme}>
      <section className={'ptt-text-base'}>
        <div id="ptt-chat-window"
             ref={windowRef}
             className={`ptt-rounded-md ptt-flex ptt-flex-col ptt-py-2 ptt-px-2 ptt-overflow-auto ${bgColor(theme)} ${textColor(theme)} ${theme.transparent ? '[&:not(:hover)]:ptt-bg-transparent' : ''}`}
             style={{
               top: `${bounding.top}%`,
               right: `${bounding.right}%`,
               width: `${bounding.width}%`,
               height: `${bounding.height}%`,
             }}
        >
          {isResizing && <ResizeLayer windowRef={windowRef} bounding={bounding} setBounding={setBounding}/>}
          <div id="ptt-chat-header" className={'ptt-flex ptt-mb-2 ptt-px-1 ptt-justify-between'}
               onMouseDown={startMoving}>
            <div className={'ptt-flex'}>
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
            state === STATE.LOADING ? <Loading/> : <Chat messages={messages}/>}
        </div>
        {showThemeSettings && <ThemeSettings cancel={cancelTheme} save={saveTheme} setTheme={setTheme}/>}
      </section>
    </ThemeContext.Provider>
  )
}

export default App
