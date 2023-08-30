import {useContext, useEffect, useRef} from "react";
import {ThemeContext} from "./App.jsx";
import {bgTextColorClass, inputClass} from "./theme.js";
import PropTypes from "prop-types";
import {defaultSettings, defaultTheme} from "./configs.js";
import {THEME_MODE} from "./consts.js";

Settings.propTypes = {
  settings: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  setSettings: PropTypes.func,
  setTheme: PropTypes.func,
  close: PropTypes.func,
}

const MODE_OPTIONS_MAP = {
  [THEME_MODE.DARK]: '深色',
  [THEME_MODE.LIGHT]: '淺色',
  [THEME_MODE.CUSTOM]: '自訂',
}

export default function Settings({settings, setSettings, setTheme, close}) {
  const theme = useContext(ThemeContext)
  const prevSettingsRef = useRef();
  const prevThemeRef = useRef();
  useEffect(() => {
    prevSettingsRef.current = {...settings}
    prevThemeRef.current = {...theme}
  }, [])

  function handleChange(e) {
    setSettings(p => ({...p, [e.target.name]: +(+e.target.value).toFixed(2)}));
  }

  function handleTransparent() {
    setTheme(p => ({...p, transparent: !p.transparent}))
  }

  function handleTheme(e) {
    setTheme(p => ({...p, [e.target.name]: e.target.value}))
  }

  function handleColor(e) {
    setTheme(p => ({...p, [e.target.name]: e.target.value}));
  }

  function cancel() {
    setSettings(prevSettingsRef.current)
    setTheme(prevThemeRef.current)
    close()
  }

  function save() {
    close()
  }

  function importDefault() {
    setSettings(defaultSettings())
    setTheme(defaultTheme())
  }

  return (
    <div id="ptt-chat-settings"
         className={`ptt-overflow-auto ptt-fixed ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-w-fit ptt-h-fit ptt-m-auto ptt-px-3 ptt-py-3 ptt-rounded ${bgTextColorClass(theme)}`}>
      <div className={'ptt-pb-4 ptt-flex ptt-justify-end'}>
        <button className={`ptt-py-1 ptt-px-3 ${theme ? 'ptt-bg-stone-600' : 'ptt-bg-stone-200'}`}
                onClick={importDefault}>帶入預設值
        </button>
      </div>
      <div className={'ptt-pb-4'}>
        <label>位置靠右 (％)：
          <input className={inputClass(theme)} name="right" onChange={handleChange} value={settings.right}
                 type="number"/>
        </label>
      </div>
      <div className={'ptt-pb-4'}>
        <label>位置靠上 (%)：
          <input className={inputClass(theme)} name="top" onChange={handleChange} value={settings.top}
                 type="number"/>
        </label>
      </div>
      <div className={'ptt-pb-4'}>
        <label>寬度 (%)：
          <input className={inputClass(theme)} name="width" onChange={handleChange} value={settings.width}
                 type="number"/>
        </label>
      </div>
      <div className={'ptt-pb-4'}>
        <label>高度 (%)：
          <input className={inputClass(theme)} name="height" onChange={handleChange} value={settings.height}
                 type="number"/>
        </label>
      </div>
      <div className={'ptt-pb-4'}>
        <label>透明背景：
          <input type="checkbox" name="transparent" onChange={handleTransparent}
                 checked={theme.transparent}/>
        </label>
      </div>
      <div className={'ptt-pb-4'}>
        <label>主題：</label>
        {Object.entries(MODE_OPTIONS_MAP).map(([k, v]) => (
          <label className={'ptt-px-1'} key={k}>
            <input type="radio" name="mode" value={k} onChange={handleTheme}
                   checked={theme.mode === k}/>
            {' ' + v}
          </label>
        ))}
      </div>
      <div className={'ptt-pb-4'}>
      </div>
      <div className={'ptt-flex ptt-flex ptt-justify-center ptt-items-center ptt-mt-2'}>
        <button className={`ptt-mr-2 ptt-py-1 ptt-px-3 ${theme ? 'ptt-bg-stone-600' : 'ptt-bg-stone-200'}`}
                onClick={cancel}>取消
        </button>
        <button className={`ptt-py-1 ptt-px-3 ${theme ? 'ptt-bg-stone-600' : 'ptt-bg-stone-200'}`}
                onClick={save}>套用
        </button>
      </div>
    </div>
  )
}