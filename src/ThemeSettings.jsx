import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import {bgColor, textColor, textColorOptions, textSizeOptions, textWeightOptions, themeColor} from "./theme.js";
import PropTypes from "prop-types";
import {deepCopy} from "./utils.js";
import DarkIcon from "./icons/DarkIcon.jsx";
import ColorSelect from "./ColorSelect.jsx";
import {THEME_MODE} from "./consts.js";
import LightIcon from "./icons/LightIcon.jsx";

ThemeSettings.propTypes = {
  setTheme: PropTypes.func,
  cancel: PropTypes.func,
  save: PropTypes.func,
}

export default function ThemeSettings({setTheme, cancel, save}) {
  const theme = useContext(ThemeContext)

  function handleTransparent() {
    setTheme(p => ({...deepCopy(p), transparent: !p.transparent}))
  }

  const handleCustomColor = (mode, key) => e => {
    setTheme(p => {
      const copy = deepCopy(p)
      return {
        ...copy,
        [mode]: {
          ...copy[mode],
          [key]: e.value,
        }
      }
    })
  };

  const handleTextChange = (key) => (e) => {
    setTheme(p => {
      const copy = deepCopy(p)
      return {
        ...copy,
        font: {
          ...copy.font,
          [key]: e.target.value,
        }
      }
    })
  }

  const textSizeRadio = textSizeOptions.map(({value, label}) => {
    return (
      <label className={'ptt-mr-1'} key={value}>
        <input
          type="radio" name="text-size" value={value}
          checked={theme.font.size === value} onChange={handleTextChange('size')}/> {label}
      </label>
    )
  })

  const textWeightRadio = textWeightOptions.map(({value, label}) => {
    return (
      <label className={'ptt-mr-1'} key={value}>
        <input
          type="radio" name="text-weight" value={value}
          checked={theme.font.weight === value} onChange={handleTextChange('weight')}/> {label}
      </label>
    )
  })

  function handleStroke() {
    setTheme(p => {
      const copy = deepCopy(p)
      return {...copy, font: {...copy.font, stroke: !p.font.stroke}}
    })
  }

  return (
    <div
      className={`ptt-chat-theme ptt-overflow-auto ptt-fixed ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-w-fit ptt-h-fit ptt-m-auto ptt-px-3 ptt-py-3 ptt-text-left ptt-rounded ${bgColor(theme)} ${textColor(theme)} ${themeColor(theme).iconButton}`}>
      <div className={'ptt-pb-4'}>
        <label>透明背景：
          <label className="ptt-switch">
            <input type="checkbox" name="transparent" onChange={handleTransparent} checked={theme.transparent}/>
            <span className="ptt-slider ptt-round"></span>
          </label>
        </label>
      </div>
      <div className={'ptt-pb-4'}>
        <ColorSelect
          label={(<><DarkIcon/>文字顏色</>)}
          name={"textColorDark"}
          onChange={handleCustomColor(THEME_MODE.DARK, 'text')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.DARK].text)}
          options={textColorOptions}
          themeMode={THEME_MODE.DARK}
        />
      </div>
      <div className={'ptt-pb-4'}>
        <ColorSelect
          label={(<><DarkIcon/>帳號顏色</>)}
          name={"accountColorDark"}
          onChange={handleCustomColor(THEME_MODE.DARK, 'account')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.DARK].account)}
          options={textColorOptions}
          themeMode={THEME_MODE.DARK}
        />
      </div>
      <div className={'ptt-pb-4'}>
        <ColorSelect
          name={"textColorLight"}
          label={(<><LightIcon/>文字顏色</>)}
          onChange={handleCustomColor(THEME_MODE.LIGHT, 'text')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.LIGHT].text)}
          options={textColorOptions}
          themeMode={THEME_MODE.LIGHT}
        />
      </div>
      <div className={'ptt-pb-4'}>
        <ColorSelect
          name={"accountColorLight"}
          label={(<><LightIcon/>帳號顏色</>)}
          onChange={handleCustomColor(THEME_MODE.LIGHT, 'account')}
          defaultValue={textColorOptions.find(e => e.value === theme[THEME_MODE.LIGHT].account)}
          options={textColorOptions}
          themeMode={THEME_MODE.LIGHT}
        />
      </div>
      <div className={'ptt-pb-4'}>
        <label>字體大小：</label> {textSizeRadio}
      </div>
      <div className={'ptt-pb-4'}>
        <label>字體粗細：</label> {textWeightRadio}
      </div>
      <div className={'ptt-pb-4'}>
        <label>字體黑框：
          <label className="ptt-switch">
            <input type="checkbox" name="text-stroke" onChange={handleStroke} checked={theme.font.stroke}/>
            <span className="ptt-slider ptt-round"></span>
          </label>
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
