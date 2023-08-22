import PropTypes from "prop-types";
import {useState} from "react";

const labelClass = 'text-yellow-300'
const textClass = 'text-black pl-1';

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

  function handleSubmit(e) {
    e.preventDefault();
    const {username, password, deleteDuplicate, board, article} = loginArgs
    start({username, password, deleteDuplicate: deleteDuplicate === 'on', board, article});
  }

  return (
    <form className={`flex min-h-screen flex-col items-left justify-between p-24`} style={{right: 0}}
          onSubmit={handleSubmit}>
      <div>
        <label className={labelClass}>帳號：</label>
        <input className={textClass} name="username" onChange={handleChange}/>
      </div>
      <div>
        <label className={labelClass}>密碼：</label>
        <input type="password" name="password" className={textClass} onChange={handleChange}/>
      </div>
      <div>
        <input type="checkbox" name="deleteDuplicate" onChange={handleChange}/>
        <label className={labelClass}>是否刪除重覆連線</label>
      </div>
      <div>
        <label className={labelClass}>看板：</label>
        <input name="board" className={textClass} onChange={handleChange}/>
      </div>
      <div>
        <label className={labelClass}>文章代碼：</label>
        <input name="article" className={textClass} onChange={handleChange}/>
      </div>
      <div className={'flex flex-col items-center'}>
        <button className={`bg-stone-500 py-2 px-3`}>送出</button>
      </div>
    </form>
  )
}