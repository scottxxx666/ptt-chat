import {useContext, useEffect, useRef, useState} from 'react'
import './wasm_exec'
import ChatWindow from "./ChatWindow.jsx";
import storage from "./storage.js";
import {deepCopy} from "./utils.js";
import {calculateDefaultBounding, defaultTheme, MAX_MESSAGE_COUNT} from "./configs.js";
import {MESSAGE_TYPE, STATE} from "./consts.js";
import {createPortal} from "react-dom";
import {ThemeContext} from "./context.js";

function supportFullscreen(videoContainer) {
  // youtube already support fullscreen without handling
  // holodex only iframe not video
  return window.location.host !== 'www.youtube.com' && videoContainer
}

function getVideoContainer() {
  if (window.location.host === 'hamivideo.hinet.net') {
    return document.querySelector('.plyr__video-wrapper')?.parentElement
  }
  if (window.location.host === 'eltaott.tv') {
    return document.querySelector('#playerVideo')
  }
  return document.querySelector('video')?.parentElement
}

function App() {
  const [bounding, setBounding] = useState({})
  const [theme, setTheme] = useState(deepCopy(defaultTheme))
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [messages, setMessages] = useState([])
  const [state, setState] = useState(STATE.LOGIN)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [blacklist, setBlacklist] = useState([])

  const loginDataRef = useRef();
  const videoContainerRef = useRef();
  const prevThemeRef = useRef();

  function setPrevTheme(data) {
    prevThemeRef.current = deepCopy(data)
  }

  function reset() {
    setState(STATE.LOGIN)
    setMessages([])
    setBlacklist([])
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
        return setTheme(prev => ({...prev, ...deepCopy(themeData)}))
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
      if (type === MESSAGE_TYPE.ON) {
        setState(STATE.LOGIN)
      } else if (type === MESSAGE_TYPE.MSG) {
        setState(STATE.STREAMING)
        const messages = JSON.parse(data)
        if (messages.length === 0) return
        setMessages(prev => [...prev, ...messages].slice(-MAX_MESSAGE_COUNT))
      } else if (type === MESSAGE_TYPE.DEFAULT) {
        initTheme()
        initBounding()
        setShowThemeSettings(false)
      } else if (type === MESSAGE_TYPE.OFF) {
        setState(STATE.OFF)
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
      } else if (type === MESSAGE_TYPE.BLACKLIST) {
        const {blacklist} = data
        setBlacklist(blacklist)
      }
    }

    function fullscreenListener() {
      const isFullscreen = document.fullscreenElement !== null;
      setShowFullscreen(isFullscreen)
    }

    initTheme()
    initBounding()

    videoContainerRef.current = getVideoContainer();
    document.addEventListener('fullscreenchange', fullscreenListener)

    chrome.runtime.onMessage.addListener(messageListener)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
      document.removeEventListener('fullscreenchange', fullscreenListener)
    }
  }, [])

  function close() {
    chrome.runtime.sendMessage({type: MESSAGE_TYPE.OFF})
    setState(STATE.OFF)
    setMessages([])
  }

  if (state === STATE.OFF) {
    return;
  }
  const addBlacklist = (data) => {
     return chrome.runtime.sendMessage({type: MESSAGE_TYPE.BLACKLIST_ADD, data})
  }
  const deleteBlacklist = (id) => {
    return chrome.runtime.sendMessage({type: MESSAGE_TYPE.BLACKLIST_DELETE, data: {id}})
  }

  const chatWindow = <ChatWindow
    theme={theme} setTheme={setTheme}
    prevTheme={prevThemeRef.current} setPrevTheme={setPrevTheme}
    showThemeSettings={showThemeSettings} setShowThemeSettings={setShowThemeSettings}
    bounding={bounding} setBounding={setBounding}
    messages={messages} state={state}
    start={start} close={close}
    blacklist={blacklist}
    addBlacklist={addBlacklist}
    deleteBlacklist={deleteBlacklist}
  />

  return (
    <ThemeContext.Provider value={theme}>
      {showFullscreen && supportFullscreen(videoContainerRef.current) ?
        createPortal(chatWindow, videoContainerRef.current) : chatWindow}
    </ThemeContext.Provider>
  )
}

export default App
