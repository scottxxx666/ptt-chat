import {DANMAKU_DENSITY} from "./consts.js";

// Fixed-duration model (Niconico style): every danmaku crosses the screen in the same
// duration, so longer text moves faster. Units: px and ms.

export const DANMAKU_GAP = 16
export const DANMAKU_SPREAD_MS = 1000
export const DANMAKU_MAX_PER_BATCH = 30
export const DANMAKU_LINE_HEIGHT = 1.25

export function danmakuLaneHeight(fontSize) {
  return Math.ceil(fontSize * DANMAKU_LINE_HEIGHT)
}

function speed(width, containerWidth, duration) {
  return (containerWidth + width) / duration
}

// prev / next: {start, width}. true if next can enter the same lane without overlapping prev.
export function canFollow(prev, next, containerWidth, duration) {
  const v1 = speed(prev.width, containerWidth, duration)
  const v2 = speed(next.width, containerWidth, duration)
  const elapsed = next.start - prev.start

  // prev's tail (plus gap) must have fully entered from the right edge
  if (elapsed * v1 < prev.width + DANMAKU_GAP) return false

  // a faster next must not catch prev's tail before prev leaves the left edge
  if (v2 > v1 && elapsed < duration - containerWidth / v2) return false

  return true
}

// lanes: array of the last {start, width} per lane (undefined = empty). Returns lane index or -1.
export function pickLane(lanes, laneCount, next, containerWidth, duration) {
  for (let i = 0; i < laneCount; i++) {
    if (!lanes[i] || canFollow(lanes[i], next, containerWidth, duration)) return i
  }
  return -1
}

// NORMAL drops when every lane is busy; OVERLAP stacks onto a random lane (Niconico 弾幕モード)
export function assignLane(lanes, laneCount, next, containerWidth, duration, density, random = Math.random) {
  const lane = pickLane(lanes, laneCount, next, containerWidth, duration)
  if (lane !== -1 || density !== DANMAKU_DENSITY.OVERLAP) return lane
  return Math.floor(random() * laneCount)
}

export function countLanes(containerHeight, laneHeight, area) {
  if (laneHeight <= 0) return 1
  return Math.max(1, Math.floor(containerHeight * area / laneHeight))
}

export function spreadDelays(count, windowMs = DANMAKU_SPREAD_MS) {
  return Array.from({length: count}, (_, i) => Math.round(i * windowMs / count))
}

// messages are appended in order; returns the ones after lastId, newest batch capped.
export function takeNewMessages(messages, lastId, max = DANMAKU_MAX_PER_BATCH) {
  if (messages.length === 0) return []
  const index = lastId === undefined ? -1 : messages.findIndex(e => e.id === lastId)
  return messages.slice(index + 1).slice(-max)
}
