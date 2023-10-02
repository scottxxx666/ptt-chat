import {createContext, useEffect, useRef, useState} from 'react'
import './wasm_exec'
import ChatWindow from "./ChatWindow.jsx";
import storage from "./storage.js";
import {deepCopy} from "./utils.js";
import {calculateDefaultBounding, defaultTheme, MAX_MESSAGE_COUNT} from "./configs.js";
import {MESSAGE_TYPE, STATE} from "./consts.js";
import {createPortal} from "react-dom";

export const ThemeContext = createContext(null);

function App() {
  const [bounding, setBounding] = useState({})
  const [theme, setTheme] = useState(deepCopy(defaultTheme))
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [messages, setMessages] = useState([])
  const [state, setState] = useState(STATE.LOGIN)
  const [showFullscreen, setShowFullsreen] = useState(false)

  const loginDataRef = useRef();
  const videoContainerRef = useRef();

  function reset() {
    setState(STATE.LOGIN)
    setMessages([])
  }

  function start(data) {
    chrome.runtime.sendMessage({type: MESSAGE_TYPE.START, data})
    loginDataRef.current = {...data}
    setState(STATE.LOADING)
  }

  useEffect(() => {
    async function initTheme() {
      const themeData = await storage.loadTheme()
      if (themeData) {
        return setTheme(deepCopy(themeData))
      }
      return setTheme(deepCopy(defaultTheme))
    }

    async function initBounding() {
      const boundingData = await storage.loadBounding()
      if (boundingData) {
        return setBounding(deepCopy(boundingData))
      }
      return setBounding(calculateDefaultBounding())
    }

    function messageListener(request) {
      const {type, data} = request
      if (type === MESSAGE_TYPE.MSG) {
        setState(STATE.STREAMING)
        const messages = JSON.parse(data)
        if (messages.length === 0) return
        setMessages(prev => [...prev, ...messages].slice(-MAX_MESSAGE_COUNT))
      } else if (type === MESSAGE_TYPE.DEFAULT) {
        initTheme()
        initBounding()
        setShowThemeSettings(false)
      } else if (type === MESSAGE_TYPE.OFF) {
        reset()
      } else if (type === MESSAGE_TYPE.ERROR) {
        if (request.data === 'DEADLINE_EXCEEDED') {
          reset()
          start(loginDataRef.current)
          return;
        } else if (request.data === 'MSG_ENCODE_ERR') {
          alert('推文中含有未支援的字元')
          return;
        }
        alert(request.data)
        close()
      }
    }

    function fullscreenListener() {
      const isFullscreen = document.fullscreenElement !== null;
      setShowFullsreen(isFullscreen)
    }

    initTheme()
    initBounding()

    // holodex only iframe not video
    videoContainerRef.current = document.querySelector('video').parentElement || document;
    document.addEventListener('fullscreenchange', fullscreenListener)

    chrome.runtime.onMessage.addListener(messageListener)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
      document.removeEventListener('fullscreenchange', fullscreenListener)
    }
  }, [])

  function close() {
    setState(STATE.LOGIN)
    chrome.runtime.sendMessage({type: MESSAGE_TYPE.OFF})
    setMessages([])
  }

  const chatWindow = <ChatWindow
    theme={theme} setTheme={setTheme}
    showThemeSettings={showThemeSettings} setShowThemeSettings={setShowThemeSettings}
    bounding={bounding} setBounding={setBounding}
    messages={messages} state={state}
    start={start} close={close}
  />

  return (
    <ThemeContext.Provider value={theme}>
      {showFullscreen ? createPortal(chatWindow, videoContainerRef.current) : chatWindow}
    </ThemeContext.Provider>
  )
}

export default App
