import {useEffect, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"

function App() {
  console.log('App')
  const [isStart, setIsStart] = useState(false)
  const [messages, setMessages] = useState([])

  function messageListener(request, sender, sendResponse) {
    console.log(request)
    const {type, data} = request
    if (type === 'MSG') {
      const messages = JSON.parse(data)
      if (messages.length === 0) return
      console.log(messages)
      setMessages(prev => [...prev, ...messages])
    } else if (type === 'STOP') {
      setIsStart(false)
      setMessages([])
    }
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

  return (
    <>
      <div id='ptt-chat-header'>
        <button>Hide</button>
      </div>
      {isStart ? <Chat messages={messages} close={close}/> : <Login start={start}/>}
    </>
  )
}

export default App
