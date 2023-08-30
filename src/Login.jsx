import PropTypes from "prop-types";
import {useContext, useState} from "react";
import {ThemeContext} from "./App.jsx";
import {inputClass, themeColor} from "./theme.js";

Login.propTypes = {
  start: PropTypes.func,
}

export default function Login({start}) {
  const theme = useContext(ThemeContext)

  const [loginArgs, setLoginArgs] = useState({
    username: '',
    password: '',
    deleteDuplicate: '',
    board: '',
    article: '',
  })

  function handleChange(e) {
    setLoginArgs(p => ({...p, [e.target.name]: e.target.value}));
  }

  function submit() {
    const {username, password, deleteDuplicate, board, article} = loginArgs
    start({username, password, deleteDuplicate: deleteDuplicate === 'on', board, article});
  }

  function handleEnter(e) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      submit()
    }
  }

  return (
    <div className={'ptt-px-1'}>
      <div className={'ptt-pb-4'}>
        <label>帳號：</label>
        <input className={inputClass(theme)} name="username" onChange={handleChange} value={loginArgs.username}
               maxLength={13} minLength={1}/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>密碼：</label>
        <input type="password" name="password" className={inputClass(theme)} onChange={handleChange}
               value={loginArgs.password} maxLength={13}/>
      </div>
      <div className={'ptt-pb-4'}>
        <input type="checkbox" name="deleteDuplicate" onChange={handleChange}
               value={loginArgs.deleteDuplicate}/>
        <label> 是否刪除重覆連線</label>
      </div>
      <div className={'ptt-pb-4'}>
        <label>看板：</label>
        <input name="board" className={inputClass(theme)} onChange={handleChange} value={loginArgs.board}
               placeholder="範例：c_chat" maxLength={32}/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>文章代碼：</label>
        <input name="article" className={inputClass(theme)} onChange={handleChange} onKeyDown={handleEnter}
               value={loginArgs.article} placeholder="格式：#1ab2CDEF" maxLength={9}/>
      </div>
      <div className={'ptt-flex ptt-flex-col ptt-items-center ptt-mt-2'}>
        <button className={`ptt-py-1 ptt-px-3 ${themeColor(theme).button}`} onClick={submit}>開始
        </button>
      </div>
    </div>
  )
}
