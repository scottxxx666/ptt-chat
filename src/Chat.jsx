import PropTypes from "prop-types";
import {useEffect, useRef, useState} from "react";

Chat.propTypes = {
  messages: PropTypes.array,
  close: PropTypes.func,
}

export default function Chat({messages, close}) {
  console.log('CHat')
  const msgs = messages.map((e) => {
    return (
      <div key={e.id} className={'ptt-chat-row'}>
        <span className={'account'}>{e.user}</span>
        <span className={'message'}>: {e.message}</span>
      </div>
    )
  })
  const chatRef = useRef();
  const [input, setInput] = useState('');

  function handleInput(e) {
    console.log('change')
    e.preventDefault()
    setInput(e.target.value)
  }

  function handleEnter(e) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing){
      sendMessage()
    }
  }

  async function sendMessage() {
    const res = await chrome.runtime.sendMessage({type: "SEND", data: input});
    console.log(res);
    setInput('')
  }

  useEffect(() => {
    console.log('useEffect')
    chatRef.current?.lastElementChild?.scrollIntoView()
  }, [msgs])

  return (
    <>
      <div id='ptt-chat-container'>
        <div id={"ptt-chat"} ref={chatRef}>
          {msgs}
        </div>
      </div>
      <div id='ptt-chat-footer'>
        <input name='message' type='text' onChange={handleInput} onKeyDown={handleEnter} value={input}/>
        <button id='submit' onClick={sendMessage}>⏎</button>
      </div>
    </>
  )
}