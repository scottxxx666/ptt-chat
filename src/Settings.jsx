import {useContext, useEffect, useRef} from "react";
import {ThemeContext} from "./App.jsx";
import {bgColor, inputClass, textColor, textColorOptions, themeColor} from "./theme.js";
import PropTypes from "prop-types";
import {defaultSettings, defaultTheme} from "./configs.js";
import {THEME_MODE} from "./consts.js";
import Select from "react-select";

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

export default function Settings({settings, setSettings, setTheme, close}) {
  const theme = useContext(ThemeContext)
  const prevSettingsRef = useRef();
  const prevThemeRef = useRef();
  useEffect(() => {
    prevSettingsRef.current = {...settings}
    prevThemeRef.current = {...theme}
  }, [])

  function optionsClass({data, isFocused}) {
    if (isFocused) console.log(t)
    return `${data.value} ${isFocused ? 'ptt-bg-red-400' : bgColor(theme)}`
  }

  function handleChange(e) {
    setSettings(p => ({...p, [e.target.name]: +(+e.target.value).toFixed(2)}));
  }

  function handleTransparent() {
    setTheme(p => ({...p, transparent: !p.transparent}))
  }

  function handleAccountColor(e) {
    setTheme(p => ({...p, accountColor: e.value}));
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

  function getColorOptions(theme) {
    return theme.mode === THEME_MODE.DARK ? textColorOptions.DARK : textColorOptions.LIGHT
  }

  const colorOptions = getColorOptions(theme)

  return (
    <div id="ptt-chat-settings"
         className={`ptt-overflow-auto ptt-fixed ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-w-fit ptt-h-fit ptt-m-auto ptt-px-3 ptt-py-3 ptt-rounded ${bgColor(theme)} ${textColor(theme)}`}>
      <div className={'ptt-pb-4 ptt-flex ptt-justify-end'}>
        <button className={`ptt-py-1 ptt-px-3 ${themeColor(theme).button}`}
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
        <label className={'ptt-flex ptt-items-center'}>推文帳號顏色：
          <Select
            name="accountColor"
            onChange={handleAccountColor}
            defaultValue={colorOptions.find(e => e.value === theme.accountColor)}
            options={colorOptions}
            classNames={{
              singleValue: ({data}) => data.value, option: optionsClass,
              control: () => 'ptt-bg-transparent', menu: () => bgColor(theme)
            }}
          />
        </label>
      </div>
      <div className={'ptt-flex ptt-flex ptt-justify-center ptt-items-center ptt-mt-2'}>
        <button className={`ptt-mr-2 ptt-py-1 ptt-px-3 ${themeColor(theme).button}`} onClick={cancel}>
          取消
        </button>
        <button className={`ptt-py-1 ptt-px-3 ${themeColor(theme).button}`} onClick={save}>
          套用
        </button>
      </div>
    </div>
  )
}