import {THEME_MODE} from "./consts.js";

export const inputClass = (theme) => `ptt-pl-1 ptt-bg-transparent ptt-outline ptt-rounded ${themeColor(theme).inputOutline} ${themeColor(theme).placeholder}`;

export const bgColor = (theme) => themeColor(theme).background

export const textColor = (theme) => themeColor(theme).text

export const themeColor = (theme) => theme.mode === THEME_MODE.DARK ? DarkThemeColor : LightThemeColor

export const DarkThemeColor = {
  background: 'ptt-bg-slate-950',
  text: 'ptt-text-neutral-100',
  inputOutline: 'ptt-outline-slate-400',
  placeholder: 'placeholder:ptt-text-neutral-400',
  username: 'ptt-text-green-400',
  scrollBar: '',
  pageEnd: 'ptt-bg-sky-600',
  iconButton: 'ptt-fill-stone-50',
  button: 'ptt-bg-stone-600',
}

export const LightThemeColor = {
  background: 'ptt-bg-stone-50',
  text: 'ptt-text-slate-900',
  inputOutline: 'ptt-outline-slate-400',
  placeholder: 'placeholder:ptt-text-slate-500',
  username: 'ptt-text-green-600',
  scrollBar: 'ptt-scroll-light',
  pageEnd: 'ptt-bg-sky-400',
  iconButton: '',
  button: 'ptt-bg-stone-200',
}
