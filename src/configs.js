import {DANMAKU_DENSITY, THEME_MODE} from "./consts.js";
import {DarkThemeColor, LightThemeColor} from "./theme.js";

export const MAX_MESSAGE_COUNT = 300

export const calculateDefaultBounding = function () {
  return {
    top: 10,
    right: +(4 / window.innerWidth * 100).toFixed(2),
    width: +(300 / window.innerWidth * 100).toFixed(2),
    height: 80,
  };
}

export const defaultTheme = {
  transparent: false,
  mode: THEME_MODE.DARK,
  DARK: {
    account: DarkThemeColor.account,
    text: DarkThemeColor.text,
  },
  LIGHT: {
    account: LightThemeColor.account,
    text: LightThemeColor.text,
  },
  font: {
    size: 'ptt-text-sm',
    weight: 'ptt-font-normal',
    stroke: false,
  },
  danmaku: {
    enabled: false,
    opacity: 0.8,
    duration: 7000,
    area: 0.5,
    fontSize: 25,
    density: DANMAKU_DENSITY.NORMAL,
  },
}

// fixed px like Bilibili's default (25px, not scaled with the player)
export const danmakuSizeOptions = [
  {value: 18, label: '小'},
  {value: 25, label: '中'},
  {value: 35, label: '大'},
]

export const danmakuDensityOptions = [
  {value: DANMAKU_DENSITY.NORMAL, label: '正常'},
  {value: DANMAKU_DENSITY.OVERLAP, label: '重疊'},
]

export const danmakuDurationOptions = [
  {value: 10000, label: '慢'},
  {value: 7000, label: '中'},
  {value: 5000, label: '快'},
]

export const danmakuAreaOptions = [
  {value: 1, label: '全螢幕'},
  {value: 0.75, label: '3/4'},
  {value: 0.5, label: '半屏'},
  {value: 0.25, label: '1/4'},
]
