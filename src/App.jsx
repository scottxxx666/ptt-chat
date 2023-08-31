import {createContext, useEffect, useRef, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"
import {defaultSettings, defaultTheme, MAX_MESSAGE_COUNT} from "./configs.js";
import Loading from "./Loading.jsx";
import {STATE, THEME_MODE} from "./consts.js";
import ThemeSettings from "./ThemeSettings.jsx";
import {bgColor, textColor} from "./theme.js";
import SettingsIcon from "./icons/SettingsIcon.jsx";
import CloseIcon from "./icons/CloseIcon.jsx";
import IconButton from "./IconButton.jsx";
import MinimizeIcon from "./icons/MinimizeIcon.jsx";
import LightDarkIcon from "./icons/LightDarkIcon.jsx";
import {deepCopy} from "./utils.js";
import ResizeIcon from "./icons/ResizeIcon.jsx";
import ResizeLayer from "./ResizeLayer.jsx";

export const ThemeContext = createContext(null);

function App() {
  console.log('App')
  const [state, setState] = useState(STATE.LOGIN)
  const [messages, setMessages] = useState([])
  const [isMini, setIsMini] = useState(false)
  const [theme, setTheme] = useState(deepCopy(defaultTheme))
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [settings, setSettings] = useState(defaultSettings())

  function messageListener(request, sender, sendResponse) {
    console.log(request)
    const {type, data} = request
    if (type === 'MSG') {
      setState(STATE.STREAMING)
      const messages = JSON.parse(data)
      if (messages.length === 0) return
      setMessages(prev => [...prev, ...messages].slice(-MAX_MESSAGE_COUNT))
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
    setSettings(prevState => ({
      ...prevState,
      top: +((e.clientY - h) / window.innerHeight * 100).toFixed(2),
      right: +(100 - (e.clientX + w) / window.innerWidth * 100).toFixed(2)
    }))
  }

  useEffect(() => {
    if (isMoving) {
      document.addEventListener('mousemove', handleMoving)
      document.addEventListener('mouseup', stopMoving, {once: true});
      return () => {
        document.removeEventListener('mousemove', handleMoving)
        document.removeEventListener('mouseup', stopMoving);
      }
    }
    document.removeEventListener('mousemove', handleMoving)
  }, [isMoving])

  if (isMini) {
    return (<ThemeContext.Provider value={theme}>
      <div
        id="ptt-chat-window"
        className={`ptt-flex ptt-h-fit ptt-rounded-md ptt-w-fit ptt-py-1 ptt-px-2 ${theme.mode === THEME_MODE.DARK ? 'ptt-bg-slate-950 ptt-text-neutral-100 ' : 'ptt-bg-stone-50 ptt-text-slate-900'}`}
        style={{top: settings.top + '%', right: settings.right + '%'}}
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
               top: `${settings.top}%`,
               right: `${settings.right}%`,
               width: `${settings.width}%`,
               height: `${settings.height}%`,
             }}
        >
          {isResizing && <ResizeLayer windowRef={windowRef} setSettings={setSettings}/>}
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
              <IconButton onClick={() => setShowThemeSettings(true)}><SettingsIcon/></IconButton>
              <IconButton onClick={close} className={'ptt-ml-2'}><CloseIcon/></IconButton>
            </div>
          </div>
          {state === STATE.LOGIN ? <Login start={start}/> :
            state === STATE.LOADING ? <Loading/> : <Chat messages={messages}/>}
        </div>
        {showThemeSettings && <ThemeSettings close={() => setShowThemeSettings(false)} setTheme={setTheme}/>}
      </section>
    </ThemeContext.Provider>
  )
}

export default App
