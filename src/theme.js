import {THEME_MODE} from "./consts.js";

export const inputClass = (theme) => `ptt-pl-1 ptt-bg-transparent ptt-outline ptt-rounded ${themeColor(theme).inputOutline} ${themeColor(theme).placeholder}`;

export const bgColor = (theme) => themeColor(theme).background

export const textColor = (theme) => themeColor(theme).text

export const themeColor = (theme) => {
  return {
    ...(theme.mode === THEME_MODE.DARK ? DarkThemeColor : LightThemeColor),
    ...theme[theme.mode]
  }
}

export const themeModeColor = (mode) => themeColor({mode})

export const DarkThemeColor = {
  background: 'ptt-bg-slate-950',
  text: 'ptt-text-neutral-100',
  inputOutline: '!ptt-outline-slate-400',
  placeholder: 'placeholder:ptt-text-neutral-400',
  account: 'ptt-text-green-400',
  scrollBar: '',
  pageEnd: 'ptt-bg-sky-600',
  iconButton: 'ptt-fill-stone-50',
  button: 'ptt-bg-stone-600',
  resize: 'ptt-fill-neutral-200',
  optionHover: 'ptt-bg-slate-700',
}

export const LightThemeColor = {
  background: 'ptt-bg-stone-50',
  text: 'ptt-text-neutral-900',
  inputOutline: 'ptt-outline-slate-400',
  placeholder: 'placeholder:ptt-text-slate-500',
  account: 'ptt-text-green-600',
  scrollBar: 'ptt-scroll-light',
  pageEnd: 'ptt-bg-sky-400',
  iconButton: '',
  button: 'ptt-bg-stone-200',
  resize: 'ptt-fill-neutral-600',
  optionHover: 'ptt-bg-slate-300',
}

export const textColorOptions = [
  {value: 'ptt-text-neutral-100', label: 'neutral-100'},
  {value: 'ptt-text-red-100', label: 'red-100'},
  {value: 'ptt-text-orange-100', label: 'orange-100'},
  {value: 'ptt-text-amber-100', label: 'amber-100'},
  {value: 'ptt-text-yellow-100', label: 'yellow-100'},
  {value: 'ptt-text-lime-100', label: 'lime-100'},
  {value: 'ptt-text-green-100', label: 'green-100'},
  {value: 'ptt-text-cyan-100', label: 'cyan-100'},
  {value: 'ptt-text-blue-100', label: 'blue-100'},
  {value: 'ptt-text-violet-100', label: 'violet-100'},
  {value: 'ptt-text-purple-100', label: 'purple-100'},
  {value: 'ptt-text-pink-100', label: 'pink-100'},
  {value: 'ptt-text-neutral-400', label: 'neutral-400'},
  {value: 'ptt-text-red-400', label: 'red-400'},
  {value: 'ptt-text-orange-400', label: 'orange-400'},
  {value: 'ptt-text-amber-400', label: 'amber-400'},
  {value: 'ptt-text-yellow-400', label: 'yellow-400'},
  {value: 'ptt-text-lime-400', label: 'lime-400'},
  {value: 'ptt-text-green-400', label: 'green-400'},
  {value: 'ptt-text-cyan-400', label: 'cyan-400'},
  {value: 'ptt-text-blue-400', label: 'blue-400'},
  {value: 'ptt-text-violet-400', label: 'violet-400'},
  {value: 'ptt-text-purple-400', label: 'purple-400'},
  {value: 'ptt-text-pink-400', label: 'pink-400'},
  {value: 'ptt-text-neutral-600', label: 'neutral-600'},
  {value: 'ptt-text-red-600', label: 'red-600'},
  {value: 'ptt-text-orange-600', label: 'orange-600'},
  {value: 'ptt-text-amber-600', label: 'amber-600'},
  {value: 'ptt-text-yellow-600', label: 'yellow-600'},
  {value: 'ptt-text-lime-600', label: 'lime-600'},
  {value: 'ptt-text-green-600', label: 'green-600'},
  {value: 'ptt-text-cyan-600', label: 'cyan-600'},
  {value: 'ptt-text-blue-600', label: 'blue-600'},
  {value: 'ptt-text-violet-600', label: 'violet-600'},
  {value: 'ptt-text-purple-600', label: 'purple-600'},
  {value: 'ptt-text-pink-600', label: 'pink-600'},
  {value: 'ptt-text-neutral-900', label: 'neutral-900'},
  {value: 'ptt-text-red-900', label: 'red-900'},
  {value: 'ptt-text-orange-900', label: 'orange-900'},
  {value: 'ptt-text-amber-900', label: 'amber-900'},
  {value: 'ptt-text-yellow-900', label: 'yellow-900'},
  {value: 'ptt-text-lime-900', label: 'lime-900'},
  {value: 'ptt-text-green-900', label: 'green-900'},
  {value: 'ptt-text-cyan-900', label: 'cyan-900'},
  {value: 'ptt-text-blue-900', label: 'blue-900'},
  {value: 'ptt-text-violet-900', label: 'violet-900'},
  {value: 'ptt-text-purple-900', label: 'purple-900'},
  {value: 'ptt-text-pink-900', label: 'pink-900'},
]

export const textSizeOptions = [
  {value: 'ptt-text-sm', label: '小'},
  {value: 'ptt-text-base', label: '中'},
  {value: 'ptt-text-lg', label: '大'},
]