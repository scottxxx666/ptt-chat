import PropTypes from "prop-types";
import {useEffect, useRef} from "react";

Chat.propTypes = {
  messages: PropTypes.array,
  close: PropTypes.func,
}

export default function Chat({messages, close}) {
  console.log('CHat')
  const msgs = messages.map(e => {
    return (
      <div key={Math.random() * 99999}>
        <span className={'account'}>{e.user}</span>
        <span className={'message'}>: {e.message}</span>
      </div>
    )
  })
  const ref = useRef();

  useEffect(() => {
    console.log('useEffect')
    ref.current?.lastElementChild?.scrollIntoView()
  }, [msgs])

  return (
    <div id='ptt-chat-container'>
      <div id={"ptt-chat"} ref={ref}>
        {msgs}
      </div>
    </div>
  )
}