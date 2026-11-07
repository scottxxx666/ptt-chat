import {useContext, useState} from "react";
import {ThemeContext} from "./context.js";
import {bgColor, textColor, textColorOptions, textSizeOptions, textWeightOptions, themeColor} from "./theme.js";
import PropTypes from "prop-types";
import {deepCopy} from "./utils.js";
import DarkIcon from "./icons/DarkIcon.jsx";
import ColorSelect from "./ColorSelect.jsx";
import {THEME_MODE} from "./consts.js";
import LightIcon from "./icons/LightIcon.jsx";
import Blacklist from "./Blacklist.jsx";
import IconButton from "./IconButton.jsx";
import SupportIcon from "./icons/SupportIcon.jsx";
import {danmakuAreaOptions, danmakuDensityOptions, danmakuDurationOptions, danmakuSizeOptions} from "./configs.js";

ThemeSettings.propTypes = {
  username: PropTypes.string,
  setTheme: PropTypes.func,
  cancel: PropTypes.func,
  save: PropTypes.func,
  blacklist: PropTypes.array,
  addBlacklist: PropTypes.func,
  deleteBlacklist: PropTypes.func,
}

function contactSupport() {
  window.open('https://forms.gle/AL6w9pfV1Quj3z8f7', '_blank');
}

export default function ThemeSettings({username, setTheme, cancel, save, blacklist, addBlacklist, deleteBlacklist}) {
  const theme = useContext(ThemeContext)

  const [showBlacklist, setShowBlacklist] = useState(false)

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

  const handleDanmakuChange = (key, value) => {
    setTheme(p => {
      const copy = deepCopy(p)
      return {...copy, danmaku: {...copy.danmaku, [key]: value}}
    })
  }

  const danmakuRadio = (key, options) => options.map(({value, label}) => (
    <label className={'ptt-mr-1'} key={value}>
      <input
        type="radio" name={`danmaku-${key}`} value={value}
        checked={theme.danmaku[key] === value} onChange={() => handleDanmakuChange(key, value)}/> {label}
    </label>
  ))

  const isLogin = username !== ''

  function openBlacklist() {
    if (!isLogin) {
      alert("請先登入！")
      return
    }
    setShowBlacklist(true)
  }

  return (
    <>
      {
        isLogin && showBlacklist && <Blacklist
          blacklist={blacklist}
          addBlacklist={addBlacklist}
          deleteBlacklist={deleteBlacklist}
          close={()=> setShowBlacklist(false)}
        />
      }
      <div
        className={`ptt-chat-theme ptt-overflow-auto ptt-fixed ptt-top-0 ptt-right-0 ptt-left-0 ptt-bottom-0 ptt-w-fit ptt-h-fit ptt-m-auto ptt-px-3 ptt-py-3 ptt-text-left ptt-rounded ${bgColor(theme)} ${textColor(theme)} ${themeColor(theme).iconButton}`}>
        <div className={'ptt-pb-4 ptt-flex ptt-justify-between ptt-items-center'}>
          <label>透明背景：
            <label className="ptt-switch">
              <input type="checkbox" name="transparent" onChange={handleTransparent} checked={theme.transparent}/>
              <span className="ptt-slider ptt-round"></span>
            </label>
          </label>
          <div className={'ptt-flex-col ptt-justify-center'}>
            <IconButton onClick={contactSupport}><SupportIcon/></IconButton>
          </div>
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
        <div className={'ptt-pb-4'}>
          <label>彈幕：
            <label className="ptt-switch">
              <input
                type="checkbox" name="danmaku-enabled" checked={theme.danmaku.enabled}
                onChange={() => handleDanmakuChange('enabled', !theme.danmaku.enabled)}/>
              <span className="ptt-slider ptt-round"></span>
            </label>
          </label>
        </div>
        {theme.danmaku.enabled && <>
          <div className={'ptt-pb-4'}>
            <label>彈幕大小：</label> {danmakuRadio('fontSize', danmakuSizeOptions)}
          </div>
          <div className={'ptt-pb-4'}>
            <label>彈幕速度：</label> {danmakuRadio('duration', danmakuDurationOptions)}
          </div>
          <div className={'ptt-pb-4'}>
            <label>顯示區域：</label> {danmakuRadio('area', danmakuAreaOptions)}
          </div>
          <div className={'ptt-pb-4'}>
            <label>彈幕密度：</label> {danmakuRadio('density', danmakuDensityOptions)}
          </div>
          <div className={'ptt-pb-4'}>
            <label>不透明度：
              <input
                type="range" name="danmaku-opacity" min={0.2} max={1} step={0.1}
                value={theme.danmaku.opacity}
                onChange={e => handleDanmakuChange('opacity', Number(e.target.value))}/>
              {' '}{Math.round(theme.danmaku.opacity * 100)}%
            </label>
          </div>
        </>}
        <div className={'ptt-pb-4'}>
          <button
            className={`ptt-py-1 ptt-px-3 ${themeColor(theme).button}`}
            onClick={openBlacklist}
          >
            編輯黑名單
          </button>
        </div>
        <div className={'ptt-flex ptt-justify-center ptt-items-center ptt-mt-2'}>
          <button className={`ptt-mr-2 ptt-py-1 ptt-px-3 ${themeColor(theme).button}`} onClick={cancel}>
            取消
          </button>
          <button className={`ptt-py-1 ptt-px-3 ${themeColor(theme).button}`} onClick={save}>
            套用
          </button>
        </div>
      </div>
    </>
  )
}
