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
      <div key={e.id} className={'ptt-py-1 ptt-break-all'}>
        <span className={'ptt-text-green-400'}>{e.user}</span>
        <span className={'ptt-text-white'}>: {e.message}</span>
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
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
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
      <div id='ptt-chat-container' className={'ptt-overflow-y-scroll ptt-h-full'}>
        <div id={"ptt-chat"} ref={chatRef} className={'ptt-mr-1 ptt-text-sm ptt-h-full'}>
          {msgs}
        </div>
      </div>
      <div id='ptt-chat-footer' className={'ptt-flex ptt-pt-2 ptt-pb-1'}>
        <input name='message' type='text' onChange={handleInput} onKeyDown={handleEnter} value={input}
               className={'ptt-outline ptt-outline-slate-600 ptt-bg-transparent ptt-px-1 ptt-flex-auto'}/>
        <button id='submit' onClick={sendMessage} className={'ptt-ml-2 ptt-w-7'}>⏎</button>
      </div>
    </>
  )
}