import {useEffect, useState} from 'react'
import './App.css'
import Login from "./Login.jsx"
import './wasm_exec'
import Chat from "./Chat.jsx"

function messageListener(request, sender, sendResponse) {
  console.log(request)
  // const {type, data} = request;
}

function App() {
  const [isStart, setIsStart] = useState(false)

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageListener)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  })

  async function start(data) {
    const res = await chrome.runtime.sendMessage({type: "OPEN", data});
    console.log({res})
    setIsStart(true)
  }

  function close() {
    setIsStart(false)
  }

  return (
    <>
      <div>
        <button>Hide</button>
      </div>
      <div>
        {isStart ? <Chat close={close}/> : <Login start={start}/>}
      </div>
    </>
  )
}

export default App
