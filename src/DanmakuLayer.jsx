import PropTypes from "prop-types";
import {useContext, useEffect, useRef, useState} from "react";
import {ThemeContext} from "./context.js";
import {THEME_MODE} from "./consts.js";
import {PREFLIGHT_ROOT_CLASS} from "./preflightScope.js";
import {
  assignLane,
  countLanes,
  DANMAKU_LINE_HEIGHT,
  danmakuLaneHeight,
  spreadDelays,
  takeNewMessages
} from "./danmaku.js";

DanmakuLayer.propTypes = {
  messages: PropTypes.array,
  blacklistSet: PropTypes.object,
}

const RECT_POLL_MS = 1000

function getVideoRect() {
  const video = document.querySelector('video')
  if (!video) return null
  const {top, left, width, height} = video.getBoundingClientRect()
  return {top, left, width, height}
}

function sameRect(a, b) {
  return a?.top === b?.top && a?.left === b?.left && a?.width === b?.width && a?.height === b?.height
}

// keeps the overlay on top of the <video>; polling also catches SPA video swaps and
// scrolling inside containers (a capture-phase listener would also fire on every chat auto-scroll)
function useVideoRect() {
  const [rect, setRect] = useState(getVideoRect)

  useEffect(() => {
    function update() {
      const next = getVideoRect()
      setRect(prev => sameRect(prev, next) ? prev : next)
    }

    const timer = setInterval(update, RECT_POLL_MS)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, {passive: true})
    document.addEventListener('fullscreenchange', update)
    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
      document.removeEventListener('fullscreenchange', update)
    }
  }, [])

  return rect
}

export default function DanmakuLayer({messages, blacklistSet}) {
  const theme = useContext(ThemeContext)
  const {opacity, duration, area, fontSize, density} = theme.danmaku
  const rect = useVideoRect()

  const [items, setItems] = useState([])

  const lastIdRef = useRef(messages.at(-1)?.id)
  const lanesRef = useRef([])
  const timersRef = useRef(new Set())
  const measureRef = useRef()

  const latest = useRef({})
  latest.current = {rect, duration, area, density, blacklistSet, fontSize}

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  // unmounted spans never fire animationend, so drop them; otherwise they would all
  // restart together when a video reappears
  const hasRect = rect !== null
  useEffect(() => {
    if (hasRect) return
    setItems([])
    lanesRef.current = []
  }, [hasRect])

  useEffect(() => {
    const fresh = takeNewMessages(messages, lastIdRef.current)
    if (messages.length > 0) lastIdRef.current = messages.at(-1).id
    const visible = fresh.filter(e => !blacklistSet.has(e.user))

    spreadDelays(visible.length).forEach((delay, i) => {
      const timer = setTimeout(() => {
        timersRef.current.delete(timer)
        spawn(visible[i])
      }, delay)
      timersRef.current.add(timer)
    })
    // spawn reads the latest props via latest ref; only new messages should trigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  function spawn(msg) {
    const {rect, duration, area, density, blacklistSet, fontSize} = latest.current
    const measure = measureRef.current
    if (!rect || !measure || blacklistSet.has(msg.user)) return

    measure.textContent = msg.message
    const width = measure.offsetWidth
    const laneHeight = danmakuLaneHeight(fontSize)
    const laneCount = countLanes(rect.height, laneHeight, area)
    const next = {start: Date.now(), width}
    const lane = assignLane(lanesRef.current, laneCount, next, rect.width, duration, density)
    if (lane === -1) return

    lanesRef.current[lane] = next
    setItems(prev => [...prev, {
      key: msg.id,
      text: msg.message,
      top: lane * laneHeight,
      distance: rect.width + width,
      duration,
      fontSize,
    }])
  }

  function remove(key) {
    setItems(prev => prev.filter(e => e.key !== key))
  }

  if (!rect) return null

  const fontClass = `${theme.font.weight} ${theme[THEME_MODE.DARK].text}`

  return (
    <div
      data-testid="ptt-danmaku-layer"
      className={`${PREFLIGHT_ROOT_CLASS} ptt-danmaku-layer`}
      style={{top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity}}
    >
      <span
        ref={measureRef} className={`ptt-danmaku-item ptt-danmaku-measure ${fontClass}`}
        style={{fontSize, lineHeight: DANMAKU_LINE_HEIGHT}}
      />
      {items.map(e => (
        <span
          key={e.key}
          className={`ptt-danmaku-item ptt-danmaku-move ${fontClass}`}
          style={{
            top: e.top,
            fontSize: e.fontSize,
            lineHeight: DANMAKU_LINE_HEIGHT,
            animationDuration: `${e.duration}ms`,
            '--ptt-danmaku-distance': `-${e.distance}px`,
          }}
          onAnimationEnd={() => remove(e.key)}
        >
          {e.text}
        </span>
      ))}
    </div>
  )
}
