import {useContext, useEffect, useRef} from "react";
import {DarkThemeContext} from "./App.jsx";
import {bgTextColorClass, inputClass} from "./theme.js";
import PropTypes from "prop-types";
import {defaultSettings} from "./configs.js";

Settings.propTypes = {
  settings: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    transparent: PropTypes.bool,
  }),
  setSettings: PropTypes.func,
  close: PropTypes.func,
}

export default function Settings({settings, setSettings, close}) {
  const darkTheme = useContext(DarkThemeContext)
  const prevSettingsRef = useRef();
  useEffect(() => {
    prevSettingsRef.current = {...settings}
  }, [])

  function handleChange(e) {
    setSettings(p => ({...p, [e.target.name]: +(+e.target.value).toFixed(2)}));
  }

  function handleTransparent() {
    setSettings(p => ({...p, transparent: !p.transparent}))
  }

  function cancel() {
    setSettings(prevSettingsRef.current)
    close()
  }

  function save() {
    close()
  }

  return (
    <div id="ptt-chat-settings"
         className={`ptt-overflow-auto ptt-fixed ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-w-fit ptt-h-fit ptt-m-auto ptt-px-3 ptt-py-3 ptt-rounded ${bgTextColorClass(darkTheme)}`}>
      <div className={'ptt-pb-4 ptt-flex ptt-justify-end'}>
        <button className={`ptt-py-1 ptt-px-3 ${darkTheme ? 'ptt-bg-stone-600' : 'ptt-bg-stone-200'}`}
                onClick={() => setSettings(defaultSettings())}>帶入預設值
        </button>
      </div>
      <div className={'ptt-pb-4'}>
        <label>位置靠右 (％)：</label>
        <input className={inputClass(darkTheme)} name="right" onChange={handleChange} value={settings.right}
               type="number"/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>位置靠上 (%)：</label>
        <input className={inputClass(darkTheme)} name="top" onChange={handleChange} value={settings.top} type="number"/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>寬度 (%)：</label>
        <input className={inputClass(darkTheme)} name="width" onChange={handleChange} value={settings.width}
               type="number"/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>高度 (%)：</label>
        <input className={inputClass(darkTheme)} name="height" onChange={handleChange} value={settings.height}
               type="number"/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>高度 (%)：</label>
        <input className={inputClass(darkTheme)} name="height" onChange={handleChange} value={settings.height}
               type="number"/>
      </div>
      <div className={'ptt-pb-4'}>
        <label>透明背景：</label>
        <input type="checkbox" name="transparent" onChange={handleTransparent} checked={settings.transparent}/>
      </div>
      <div className={'ptt-flex ptt-flex ptt-justify-center ptt-items-center ptt-mt-2'}>
        <button className={`ptt-mr-2 ptt-py-1 ptt-px-3 ${darkTheme ? 'ptt-bg-stone-600' : 'ptt-bg-stone-200'}`}
                onClick={cancel}>取消
        </button>
        <button className={`ptt-py-1 ptt-px-3 ${darkTheme ? 'ptt-bg-stone-600' : 'ptt-bg-stone-200'}`}
                onClick={save}>套用
        </button>
      </div>
    </div>
  )
}