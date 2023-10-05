import PropTypes from "prop-types";
import {useContext, useEffect, useRef, useState} from "react";
import {ThemeContext} from "./App.jsx";
import {themeColor} from "./theme.js";

Chat.propTypes = {
  messages: PropTypes.array,
}

export default function Chat({messages}) {
  const theme = useContext(ThemeContext)
  const msgs = messages.map((e) => {
    return (<div key={e.id} className={'ptt-py-1 ptt-break-all'}>
      <span className={themeColor(theme).account}>{e.user}</span>
      <span>: {e.message}</span>
    </div>)
  })
  const chatRef = useRef();
  const [input, setInput] = useState('');
  const [scrolling, setScrolling] = useState(false);

  function handleInput(e) {
    e.preventDefault()
    setInput(e.target.value)
  }

  function handleEnter(e) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      sendMessage()
    }
  }

  async function sendMessage() {
    chrome.runtime.sendMessage({type: "SEND", data: input});
    setInput('')
  }

  useEffect(() => {
    if (!scrolling) {
      chatRef.current?.lastElementChild?.scrollIntoView()
    }
  }, [msgs, scrolling])

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

  return (
    <>
      <div
        className={`ptt-chat-container ptt-overflow-y-scroll ptt-overflow-x-hidden ptt-h-full ptt-px-1 ptt-flex ptt-justify-center ${themeColor(theme).scrollBar} ${theme.font.stroke ? 'font-stroke' : ''}`}
        onScroll={handleScroll}
      >
        <div
          id={"ptt-chat"} ref={chatRef}
          className={`ptt-mr-1 ptt-h-full ptt-w-full ${theme.font.size} ${theme.font.weight}`}
        >
          {msgs}
        </div>
        {scrolling &&
          <button
            onClick={() => setScrolling(false)}
            className={`ptt-page-end ptt-w-7 ptt-h-6 ptt-rounded ptt-text-stone-50 ptt-text-center ${themeColor(theme).pageEnd}`}>↓</button>}
      </div>
      <div id='ptt-chat-footer' className={'ptt-flex ptt-pt-2 ptt-pb-1 ptt-px-1'}>
        <input name='message' type='text' onChange={handleInput} onKeyDown={handleEnter} value={input}
               className={`ptt-outline ptt-bg-transparent ptt-px-1 ptt-flex-auto ptt-rounded
                ${themeColor(theme).inputOutline}`}
               maxLength={24}
        />
        <button id='submit' onClick={sendMessage} className={'ptt-ml-2 ptt-w-7'}>⏎</button>
      </div>
    </>
  )
}