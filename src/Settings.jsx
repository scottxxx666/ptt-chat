import {useContext, useEffect, useRef} from "react";
import {ThemeContext} from "./App.jsx";
import {
  bgColor,
  DarkThemeColor,
  inputClass,
  LightThemeColor,
  textColor,
  textColorOptions,
  themeColor
} from "./theme.js";
import PropTypes from "prop-types";
import {defaultSettings, defaultTheme} from "./configs.js";
import {deepCopy} from "./utils.js";
import DarkIcon from "./icons/DarkIcon.jsx";
import ColorSelect from "./ColorSelect.jsx";
import {THEME_MODE} from "./consts.js";
import LightIcon from "./icons/LightIcon.jsx";

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
    prevThemeRef.current = deepCopy(theme)
  }, [])

  function handleChange(e) {
    setSettings(p => ({...p, [e.target.name]: +(+e.target.value).toFixed(2)}));
  }

  function handleTransparent() {
    setTheme(p => ({...deepCopy(p), transparent: !p.transparent}))
  }

  const handleCustomColor = (mode, key) => e => {
    setTheme(p => {
      const copy = deepCopy(p);
      return {
        ...copy,
        [mode]: {
          ...copy[mode],
          [key]: e.value,
        }
      }
    })
  };

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
    setTheme(deepCopy(defaultTheme))
  }

  function optionsBgColor(mode) {
    return mode === THEME_MODE.DARK ? DarkThemeColor.background : LightThemeColor.background
  }

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
        <div className={'ptt-pb-4'}>
          <ColorSelect
            label={(<><DarkIcon/>文字顏色</>)}
            name={"textColorDark"}
            onChange={handleCustomColor(THEME_MODE.DARK, 'text')}
            defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.DARK].text)}
            options={textColorOptions}
            bgColor={optionsBgColor(THEME_MODE.DARK)}
          />
        </div>
        <ColorSelect
          label={(<><DarkIcon/>帳號顏色</>)}
          name={"accountColorDark"}
          onChange={handleCustomColor(THEME_MODE.DARK, 'account')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.DARK].account)}
          options={textColorOptions}
          bgColor={optionsBgColor(THEME_MODE.DARK)}
        />
      </div>
      <div className={'ptt-pb-4'}>
        <ColorSelect
          name={"textColorLight"}
          label={(<><LightIcon/>文字顏色</>)}
          onChange={handleCustomColor(THEME_MODE.LIGHT, 'text')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.LIGHT].text)}
          options={textColorOptions}
          bgColor={optionsBgColor(THEME_MODE.LIGHT)}
        />
      </div>
      <div className={'ptt-pb-4'}>
        <ColorSelect
          name={"accountColorLight"}
          label={(<><LightIcon/>帳號顏色</>)}
          onChange={handleCustomColor(THEME_MODE.LIGHT, 'text')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.LIGHT].account)}
          options={textColorOptions}
          bgColor={optionsBgColor(THEME_MODE.LIGHT)}
        />
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

