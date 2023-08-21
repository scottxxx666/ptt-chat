import PropTypes from "prop-types";

Chat.propTypes = {
  close: PropTypes.func,
}

export default function Chat({close}) {
  return (
    <>
      <h1>Chat</h1>
      <div>
        <button onClick={close}>Close</button>
      </div>
    </>
  )
}