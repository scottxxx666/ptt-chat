import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import {THEME_MODE} from "./consts.js";
import LightIcon from "./LightIcon.jsx";
import NightIcon from "./NightIcon.jsx";

export default function LightDarkIcon() {
  const theme = useContext(ThemeContext)
  return theme.mode === THEME_MODE.DARK ? <LightIcon/> : <NightIcon/>
}
