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
      <div key={e.id} className={'py-1 break-all'}>
        <span className={'text-green-400'}>{e.user}</span>
        <span className={'text-white'}>: {e.message}</span>
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
      <div id='ptt-chat-container' className={'overflow-y-scroll h-full'}>
        <div id={"ptt-chat"} ref={chatRef} className={'mr-1 text-sm h-full'}>
          {msgs}
        </div>
      </div>
      <div id='ptt-chat-footer' className={'flex pt-2 pb-1'}>
        <input name='message' type='text' onChange={handleInput} onKeyDown={handleEnter} value={input}
               className={'outline outline-slate-600 bg-transparent px-1 flex-auto'}/>
        <button id='submit' onClick={sendMessage} className={'ml-2 w-7'}>⏎</button>
      </div>
    </>
  )
}