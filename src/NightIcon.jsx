import {useContext} from "react";
import {ThemeContext} from "./App.jsx";
import {themeColor} from "./theme.js";

export default function NightIcon() {
  const theme = useContext(ThemeContext)

  return (
    <svg className={themeColor(theme).iconButton} xmlns="http://www.w3.org/2000/svg" height="24"
         viewBox="0 -960 960 960" width="24">
      <path
        d="M480-120q-151 0-255.5-104.5T120-480q0-138 90-239.5T440-838q25-3 39 18t-1 44q-17 26-25.5 55t-8.5 61q0 90 63 153t153 63q31 0 61.5-9t54.5-25q21-14 43-1.5t19 39.5q-14 138-117.5 229T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>
    </svg>
  )
}