import PropTypes from "prop-types";
import {useState} from "react";

const textClass = 'text-black pl-1 bg-stone-300 placeholder:text-slate-600';

Login.propTypes = {
  start: PropTypes.func,
}

export default function Login({start}) {
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
    <div>
      <div className={'pb-4'}>
        <label>帳號：</label>
        <input className={textClass} name="username" onChange={handleChange} value={loginArgs.username}/>
      </div>
      <div className={'pb-4'}>
        <label>密碼：</label>
        <input type="password" name="password" className={textClass} onChange={handleChange}
               value={loginArgs.password}/>
      </div>
      <div className={'pb-4'}>
        <input type="checkbox" name="deleteDuplicate" onChange={handleChange} value={loginArgs.deleteDuplicate}/>
        <label> 是否刪除重覆連線</label>
      </div>
      <div className={'pb-4'}>
        <label>看板：</label>
        <input name="board" className={textClass} onChange={handleChange} value={loginArgs.board} placeholder="c_chat"/>
      </div>
      <div className={'pb-4'}>
        <label>文章代碼：</label>
        <input name="article" className={textClass} onChange={handleChange} onKeyDown={handleEnter}
               value={loginArgs.article} placeholder="#1ab2CDEF"/>
      </div>
      <div className={'flex flex-col items-center mt-2'}>
        <button className={`bg-stone-500 py-1 px-3`} onClick={submit}>開始</button>
      </div>
    </div>
  )
}
