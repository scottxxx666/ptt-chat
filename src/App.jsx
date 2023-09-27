import {createContext, useEffect, useRef, useState} from 'react'
import './wasm_exec'
import ChatWindow from "./ChatWindow.jsx";
import storage from "./storage.js";
import {deepCopy} from "./utils.js";
import {calculateDefaultBounding, defaultTheme, MAX_MESSAGE_COUNT} from "./configs.js";
import {STATE} from "./consts.js";

export const ThemeContext = createContext(null);

function App() {
  const [bounding, setBounding] = useState({})
  const [theme, setTheme] = useState(deepCopy(defaultTheme))
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [messages, setMessages] = useState([])
  const [state, setState] = useState(STATE.LOGIN)

  const loginDataRef = useRef();

  function reset() {
    setState(STATE.LOGIN)
    setMessages([])
  }

  function start(data) {
    chrome.runtime.sendMessage({type: "START", data})
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
      if (type === 'MSG') {
        setState(STATE.STREAMING)
        const messages = JSON.parse(data)
        if (messages.length === 0) return
        setMessages(prev => [...prev, ...messages].slice(-MAX_MESSAGE_COUNT))
      } else if (type === 'DEFAULT') {
        initTheme()
        initBounding()
        setShowThemeSettings(false)
      } else if (type === 'STOP') {
        reset()
      } else if (type === 'ERR') {
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

    initTheme()
    initBounding()

    chrome.runtime.onMessage.addListener(messageListener)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  function close() {
    chrome.runtime.sendMessage({type: 'STOP'})
    setState(STATE.LOGIN)
    setMessages([])
  }

  return (
    <ThemeContext.Provider value={theme}>
      <ChatWindow
        theme={theme} setTheme={setTheme}
        showThemeSettings={showThemeSettings} setShowThemeSettings={setShowThemeSettings}
        bounding={bounding} setBounding={setBounding}
        messages={messages} state={state}
        start={start} close={close}
      />
    </ThemeContext.Provider>
  )
}

export default App
