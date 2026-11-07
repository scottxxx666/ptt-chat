import {DANMAKU_DENSITY} from "./consts.js";
import {
  assignLane,
  canFollow,
  countLanes,
  DANMAKU_MAX_PER_BATCH,
  danmakuLaneHeight,
  pickLane,
  spreadDelays,
  takeNewMessages
} from "./danmaku.js";

const W = 1000
const D = 5000

describe('canFollow', () => {
  test('same width: blocked until prev tail plus gap has entered', () => {
    const prev = {start: 0, width: 100}
    // v = 1100 / 5000 = 0.22 px/ms, needs (100 + 16) / 0.22 ≈ 527ms
    expect(canFollow(prev, {start: 500, width: 100}, W, D)).toBe(false)
    expect(canFollow(prev, {start: 530, width: 100}, W, D)).toBe(true)
  })

  test('slower (shorter) next only needs prev to have entered', () => {
    const prev = {start: 0, width: 500}
    // v1 = 0.3, needs 516 / 0.3 = 1720ms
    expect(canFollow(prev, {start: 1700, width: 0}, W, D)).toBe(false)
    expect(canFollow(prev, {start: 1720, width: 0}, W, D)).toBe(true)
  })

  test('faster (longer) next must not catch prev before prev leaves', () => {
    const prev = {start: 0, width: 0}
    // entered after 80ms, but v2 = 0.4 catches up unless elapsed >= 5000 - 1000 / 0.4 = 2500
    expect(canFollow(prev, {start: 1000, width: 1000}, W, D)).toBe(false)
    expect(canFollow(prev, {start: 2499, width: 1000}, W, D)).toBe(false)
    expect(canFollow(prev, {start: 2500, width: 1000}, W, D)).toBe(true)
  })
})

describe('pickLane', () => {
  const busy = {start: 0, width: 100}
  const next = {start: 10, width: 100}

  test('returns first empty lane', () => {
    expect(pickLane([], 3, next, W, D)).toBe(0)
    expect(pickLane([busy], 3, next, W, D)).toBe(1)
    expect(pickLane([busy, undefined, busy], 3, next, W, D)).toBe(1)
  })

  test('reuses a lane once it is free', () => {
    expect(pickLane([busy, busy], 2, {start: 600, width: 100}, W, D)).toBe(0)
  })

  test('returns -1 when all lanes are busy', () => {
    expect(pickLane([busy, busy], 2, next, W, D)).toBe(-1)
  })

  test('ignores lanes beyond laneCount (area shrank)', () => {
    expect(pickLane([busy, busy, undefined], 2, next, W, D)).toBe(-1)
  })
})

describe('countLanes', () => {
  test('scales with display area', () => {
    expect(countLanes(400, 24, 1)).toBe(16)
    expect(countLanes(400, 24, 0.5)).toBe(8)
    expect(countLanes(400, 24, 0.25)).toBe(4)
  })

  test('always at least one lane', () => {
    expect(countLanes(10, 24, 0.25)).toBe(1)
    expect(countLanes(400, 0, 1)).toBe(1)
  })
})

describe('spreadDelays', () => {
  test('spreads a batch evenly over the window', () => {
    expect(spreadDelays(4, 1000)).toEqual([0, 250, 500, 750])
    expect(spreadDelays(1, 1000)).toEqual([0])
    expect(spreadDelays(0, 1000)).toEqual([])
  })
})

describe('takeNewMessages', () => {
  const msgs = [{id: 1}, {id: 2}, {id: 3}]

  test('empty messages', () => {
    expect(takeNewMessages([], 1)).toEqual([])
  })

  test('returns messages after lastId', () => {
    expect(takeNewMessages(msgs, 1)).toEqual([{id: 2}, {id: 3}])
    expect(takeNewMessages(msgs, 3)).toEqual([])
  })

  test('returns all when lastId is unknown or sliced out', () => {
    expect(takeNewMessages(msgs, undefined)).toEqual(msgs)
    expect(takeNewMessages(msgs, 99)).toEqual(msgs)
  })

  test('caps a large batch to the newest ones', () => {
    const many = Array.from({length: DANMAKU_MAX_PER_BATCH + 5}, (_, i) => ({id: i}))
    const result = takeNewMessages(many, undefined)
    expect(result).toHaveLength(DANMAKU_MAX_PER_BATCH)
    expect(result.at(-1)).toEqual({id: DANMAKU_MAX_PER_BATCH + 4})
    expect(result[0]).toEqual({id: 5})
  })
})

describe('danmakuLaneHeight', () => {
  test('rounds line height up so lanes never overlap', () => {
    expect(danmakuLaneHeight(28)).toBe(35)
    expect(danmakuLaneHeight(27)).toBe(34)
  })
})

describe('assignLane', () => {
  const busy = {start: 0, width: 100}
  const next = {start: 10, width: 100}

  test('uses a free lane regardless of density', () => {
    expect(assignLane([busy], 2, next, W, D, DANMAKU_DENSITY.OVERLAP, () => 0)).toBe(1)
  })

  test('normal density drops when full', () => {
    expect(assignLane([busy, busy], 2, next, W, D, DANMAKU_DENSITY.NORMAL, () => 0)).toBe(-1)
  })

  test('overlap density picks a random lane within laneCount when full', () => {
    const lanes = [busy, busy, busy]
    expect(assignLane(lanes, 3, next, W, D, DANMAKU_DENSITY.OVERLAP, () => 0)).toBe(0)
    expect(assignLane(lanes, 3, next, W, D, DANMAKU_DENSITY.OVERLAP, () => 0.5)).toBe(1)
    expect(assignLane(lanes, 3, next, W, D, DANMAKU_DENSITY.OVERLAP, () => 0.999)).toBe(2)
  })
})
