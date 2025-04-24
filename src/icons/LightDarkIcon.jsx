import {useContext} from "react";
import {ThemeContext} from "../context.js";
import {THEME_MODE} from "../consts.js";
import LightIcon from "./LightIcon.jsx";
import DarkIcon from "./DarkIcon.jsx";

export default function LightDarkIcon() {
  const theme = useContext(ThemeContext)
  return theme.mode === THEME_MODE.DARK ? <LightIcon/> : <DarkIcon/>
}
