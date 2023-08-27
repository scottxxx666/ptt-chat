import {createContext, useContext, useEffect, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"

const TransparentContext = createContext(null);

function App() {
  console.log('App')
  const [isStart, setIsStart] = useState(false)
  const [messages, setMessages] = useState([])
  const [isMini, setIsMini] = useState(false)

  const theme = useContext(TransparentContext)
  const [transparent, setTransparent] = useState(false)

  function messageListener(request, sender, sendResponse) {
    console.log(request)
    const {type, data} = request
    if (type === 'MSG') {
      const messages = JSON.parse(data)
      if (messages.length === 0) return
      setMessages(prev => [...prev, ...messages])
    } else if (type === 'STOP') {
      reset()
    } else if (type === 'ERR') {
      alert(request.data)
      reset()
    }
  }

  function reset() {
    setIsStart(false)
    // setMessages([])
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
    setIsStart(true)
  }

  function close() {
    chrome.runtime.sendMessage({type: 'STOP'});
    setIsStart(false)
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
    return (
      <div className={'ptt-h-full ptt-py-1 ptt-bg-slate-950 ptt-text-white ptt-px-2'}>
        <button className={'text-lg'} onClick={toggleChat}>⇤</button>
      </div>
    )
  }

  return (
    <TransparentContext.Provider value={transparent}>
      <div id="ptt-chat-window"
           className={`ptt-h-full ptt-flex ptt-flex-col ptt-bg-slate-950 ptt-py-2 ptt-pr-2 ptt-pl-3 ptt-text-white ptt-text-base ${transparent ? '[&:not(:hover)]:ptt-bg-transparent' : ''}`}>
        <div id="ptt-chat-header" className={'ptt-flex ptt-mb-2 ptt-justify-between'}>
          <div>
            <button onClick={toggleChat}>⇥</button>
            <button className={'ptt-ml-2'} onClick={() => setTransparent(prev => !prev)}>
              {transparent ? '取消透明' : '背景透明'}
            </button>
          </div>
          <button onClick={close}>x</button>
        </div>
        {isStart ? <Chat messages={messages}/> : <Login start={start}/>}
      </div>
    </TransparentContext.Provider>
  )
}

export default App
