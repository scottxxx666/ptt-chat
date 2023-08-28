import {createContext, useEffect, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"
import LightDarkIcon from "./LightDarkIcon.jsx";
import {MAX_MESSAGE_COUNT} from "./configs.js";
import Loading from "./Loading.jsx";
import {STATE} from "./consts.js";

export const DarkThemeContext = createContext(null);

function App() {
  console.log('App')
  const [state, setState] = useState(STATE.LOGIN)
  const [messages, setMessages] = useState([])
  const [isMini, setIsMini] = useState(false)

  const [transparent, setTransparent] = useState(false)
  const [dark, setDark] = useState(true)

  function messageListener(request, sender, sendResponse) {
    console.log(request)
    const {type, data} = request
    if (type === 'MSG') {
      setState('STREAMING')
      const messages = JSON.parse(data)
      if (messages.length === 0) return
      setMessages(prev => [...prev, ...messages].slice(-MAX_MESSAGE_COUNT))
    } else if (type === 'STOP') {
      reset()
    } else if (type === 'ERR') {
      alert(request.data)
      reset()
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

  useEffect(() => {
    const root = document.querySelector('#crx-root');
    if (isMini) {
      root.classList.add('mini')
    } else {
      root.classList.remove('mini')
    }
  }, [isMini])

  if (isMini) {
    return (<div
      className={`ptt-rounded-md ptt-h-full ptt-py-1 ptt-px-2 ${dark ? 'ptt-bg-slate-950 ptt-text-white ' : 'ptt-bg-white ptt-text-black'}`}>
      <button className={'ptt-text-lg'} onClick={toggleChat}>⇤</button>
    </div>)
  }

  return (<DarkThemeContext.Provider value={dark}>
    <div id="ptt-chat-window"
         className={`ptt-rounded-md ptt-h-full ptt-flex ptt-flex-col ptt-py-2 ptt-pr-2 ptt-pl-3 ${dark ? 'ptt-bg-slate-950 ptt-text-white' : 'ptt-bg-white ptt-text-black'} ptt-text-base ${transparent ? '[&:not(:hover)]:ptt-bg-transparent' : ''}`}>
      <div id="ptt-chat-header" className={'ptt-flex ptt-mb-2 ptt-justify-between'}>
        <div className={'ptt-flex'}>
          <button onClick={toggleChat}>⇥</button>
          <button className={'ptt-ml-2'} onClick={() => setTransparent(prev => !prev)}>
            {transparent ? '取消透明' : '背景透明'}
          </button>
          <button className={`ptt-ml-2`} onClick={() => setDark(prev => !prev)}>
            <LightDarkIcon/>
          </button>
        </div>
        <button onClick={close}>x</button>
      </div>
      {state === STATE.LOGIN ? <Login start={start}/> :
        state === STATE.LOADING ? <Loading/> : <Chat messages={messages}/>}
    </div>
  </DarkThemeContext.Provider>)
}

export default App
