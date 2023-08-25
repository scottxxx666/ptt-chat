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
      setMessages(prev => [...prev, ...messages.toReversed()])
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
      <div>
        <button onClick={toggleChat}>⇤</button>
      </div>
    )
  }

  return (
    <TransparentContext.Provider value={transparent}>
      <div id="ptt-chat-window" className={transparent ? 'transparent' : ''}>
        <div id="ptt-chat-header">
          <button onClick={toggleChat}>⇥</button>
          <button onClick={() => setTransparent(prev => !prev)}>透明</button>
        </div>
        {isStart ? <Chat messages={messages} close={close}/> : <Login start={start}/>}
      </div>
    </TransparentContext.Provider>
  )
}

export default App
