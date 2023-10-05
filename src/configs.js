import {THEME_MODE} from "./consts.js";
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
  }
}
