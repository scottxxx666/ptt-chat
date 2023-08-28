import PropTypes from "prop-types";
import {useContext, useEffect, useRef, useState} from "react";
import {DarkThemeContext} from "./App.jsx";

Chat.propTypes = {
  messages: PropTypes.array,
}

export default function Chat({messages}) {
  const darkTheme = useContext(DarkThemeContext)
  const msgs = messages.map((e) => {
    return (<div key={e.id} className={'ptt-py-1 ptt-break-all'}>
      <span className={darkTheme ? 'ptt-text-green-400' : 'ptt-text-green-600'}>{e.user}</span>
      <span className={darkTheme ? 'ptt-text-white' : 'ptt-text-black'}>: {e.message}</span>
    </div>)
  })
  const chatRef = useRef();
  const [input, setInput] = useState('');
  const [scrolling, setScrolling] = useState(false);

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
    if (!scrolling) {
      chatRef.current?.lastElementChild?.scrollIntoView()
    }
  }, [msgs])

  function handleScroll() {
    const lastMsg = chatRef.current?.lastElementChild;
    if (lastMsg) {
      const {top, height} = lastMsg.getBoundingClientRect()
      const parent = chatRef.current.parentNode.getBoundingClientRect()
      const parentHeight = parent.top + parent.height
      if (top + (height / 2) <= parentHeight) {
        setScrolling(false)
      } else {
        setScrolling(true)
      }
    }
  }

  function scrollToEnd() {
    setScrolling(false)
    chatRef.current?.lastElementChild?.scrollIntoView()
  }

  return (
    <>
      <div id='ptt-chat-container'
           className={`ptt-overflow-y-scroll ptt-overflow-x-hidden ptt-h-full ${darkTheme ? '' : 'ptt-scroll-light'}`}
           onScroll={handleScroll}
      >
        <div id={"ptt-chat"} ref={chatRef} className={'ptt-mr-1 ptt-text-sm ptt-h-full'}>
          {msgs}
        </div>
        {scrolling && <button id='ptt-page-end' onClick={scrollToEnd}
                              className={`ptt-w-7 ptt-h-6 ptt-rounded ptt-text-white ${darkTheme ? 'ptt-bg-sky-600' : 'ptt-bg-sky-400'}`}>↓</button>}
      </div>
      <div id='ptt-chat-footer' className={'ptt-flex ptt-pt-2 ptt-pb-1'}>
        <input name='message' type='text' onChange={handleInput} onKeyDown={handleEnter} value={input}
               className={`ptt-outline ptt-bg-transparent ptt-px-1 ptt-flex-auto ptt-rounded
                ${darkTheme ? 'ptt-outline-slate-600' : 'ptt-outline-slate-400'}`}
               maxLength={24}
        />
        <button id='submit' onClick={sendMessage} className={'ptt-ml-2 ptt-w-7'}>⏎</button>
      </div>
    </>
  )
}