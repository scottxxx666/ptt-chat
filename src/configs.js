import {THEME_MODE} from "./consts.js";

export const MAX_MESSAGE_COUNT = 300

export const defaultSettings = function () {
  return {
    top: 10,
    right: +(4 / window.innerWidth * 100).toFixed(2),
    width: +(300 / window.innerWidth * 100).toFixed(2),
    height: 80,
  };
}
export const defaultTheme = function () {
  return {
    transparent: false,
    mode: THEME_MODE.DARK,
    accountColor: 'green'
  };
}
