import {createContext, useEffect, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"
import LightDarkIcon from "./LightDarkIcon.jsx";
import {defaultSettings, MAX_MESSAGE_COUNT} from "./configs.js";
import Loading from "./Loading.jsx";
import {STATE} from "./consts.js";
import Settings from "./Settings.jsx";
import {bgTextColorClass} from "./theme.js";

export const DarkThemeContext = createContext(null);

function App() {
  console.log('App')
  const [state, setState] = useState(STATE.LOGIN)
  const [messages, setMessages] = useState([])
  const [isMini, setIsMini] = useState(false)
  const [transparent, setTransparent] = useState(false)
  const [dark, setDark] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
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
  })

  async function start(data) {
    const res = await chrome.runtime.sendMessage({type: "START", data});
    console.log({res})
    setState(STATE.LOADING)
  }

  function close() {
    chrome.runtime.sendMessage({type: 'STOP'});
    setState(STATE.LOGIN)
  }

  function toggleChat() {
    setIsMini(prevState => !prevState)
  }

  if (isMini) {
    return (<div
      id="ptt-chat-window"
      className={`ptt-h-fit ptt-rounded-md ptt-w-fit ptt-py-1 ptt-px-2 ${dark ? 'ptt-bg-slate-950 ptt-text-neutral-100 ' : 'ptt-bg-stone-50 ptt-text-slate-900'}`}
      style={{top: settings.top + '%', right: settings.right + '%'}}
    >
      <button className={'ptt-text-lg'} onClick={toggleChat}>⇤</button>
    </div>)
  }

  return (<DarkThemeContext.Provider value={dark}>
    <div id="ptt-chat-window"
         className={`ptt-rounded-md ptt-flex ptt-flex-col ptt-py-2 ptt-px-2 ptt-overflow-auto ${bgTextColorClass(dark)} ptt-text-base ${transparent ? '[&:not(:hover)]:ptt-bg-transparent' : ''}`}
         style={{
           top: `${settings.top}%`,
           right: `${settings.right}%`,
           width: `${settings.width}%`,
           height: `${settings.height}%`
         }}
    >
      <div id="ptt-chat-header" className={'ptt-flex ptt-mb-2 ptt-px-1 ptt-justify-between'}>
        <div className={'ptt-flex'}>
          <button onClick={toggleChat}>⇥</button>
          <button className={'ptt-ml-2'} onClick={() => setTransparent(prev => !prev)}>
            {transparent ? '取消透明' : '背景透明'}
          </button>
          <button className={`ptt-ml-2`} onClick={() => setDark(prev => !prev)}>
            <LightDarkIcon/>
          </button>
        </div>
        <div className={'ptt-flex'}>
          <button onClick={() => setShowSettings(true)}>Settings</button>
          <button onClick={close}>x</button>
        </div>
      </div>
      {state === STATE.LOGIN ? <Login start={start}/> :
        state === STATE.LOADING ? <Loading/> : <Chat messages={messages}/>}
      {showSettings && <Settings settings={settings} setSettings={setSettings} close={() => setShowSettings(false)}/>}
    </div>
  </DarkThemeContext.Provider>)
}

export default App
