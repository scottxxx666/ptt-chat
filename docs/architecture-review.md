# Architecture & Code Review — 2026-07-05

Scope: full read of `src/`, `manifest.json`, build/test configs at v1.0.11 (branch `main`,
including the uncommitted `isFirstMessage` fix in `background.js`).

Overall: the 3-context architecture (background SW ↔ PTT tab WASM ↔ content-script React UI)
is reasonable and pragmatic. The issues below are ordered by priority. Each has fix options;
**Option A is the recommended pragmatic fix** unless noted otherwise.

> For the implementing agent: per project policy, do NOT run build/test/lint — the user runs
> these manually. Verify library APIs (crxjs, chrome.offscreen, DNR) via context7 before use.

---

## P0 — Reliability bugs

### 1. MV3 service worker state loss breaks everything silently
**Where:** `src/background.js:9-11` (`pttTab`, `chatTab`, `username`), `:125-127` (`pttPort`, `pttInterval`, `isFirstMessage`)

**Problem:** MV3 terminates idle service workers (~30s). All module-level state is lost on
restart. Consequences:
- `username` undefined → context-menu "新增至黑名單" wrongly alerts 請先登入 even when logged in.
- `chatTab`/`pttTab` undefined → message relay dead, `stopExtension()` can't close the PTT tab.
- `pttInterval` (`setInterval`) dies with the worker — `setInterval` is not reliable in MV3 SWs.
- The open Port keeps the SW alive in recent Chrome versions, but only while the PTT tab lives;
  any gap (PTT tab crash/discard, Chrome update, SW crash) loses state permanently.

**Option A — Recommended: persist session state in `chrome.storage.session`**
- Store `{pttTabId, chatTabId, username}` in `chrome.storage.session` on change; read them
  (helper with in-memory cache) at each use site instead of globals.
- Replace `setInterval` ping with `chrome.alarms` (min period 30s; that's fine — the ping's only
  real job is liveness, see Issue 5) or keep the interval but re-create it inside
  `onConnect` and accept it dies with the SW (port disconnect already triggers cleanup).
- `isFirstMessage` can also live in `storage.session`, or be redesigned away (Issue 5 option).
- Trade-off: small async overhead per message relay; mitigate with an in-memory cache that
  lazily rehydrates from `storage.session` after SW restart.

**Option B — Best practice: full session-state module**
- A small `sessionState.js` repository wrapping `chrome.storage.session` with typed getters/
  setters and a single `hydrate()` on SW startup, plus `chrome.tabs.onRemoved` listeners to
  clean up `pttTabId`/`chatTabId` when tabs close (today closing the PTT tab manually only gets
  caught indirectly via port disconnect).
- Trade-off: more code, but makes routing state explicit and testable.

---

### 2. `alert()` called in service-worker context (crashes error path)
**Where:** `src/storage.js:7,28,38,46` — `storage.js` is imported by `background.js`;
`storage.clear()` runs in the SW (context menu 還原為預設值, `background.js:36`). `alert` does not
exist in a service worker → `ReferenceError` swallowed into a rejected promise; the reset can
half-fail with no signal.

Also: typo at `src/storage.js:46` — `請聲後重試` → `請稍後重試`.

**Option A — Recommended:** remove `alert` from `storage.js` entirely; let it throw/return
errors. UI callers (`App.jsx`, `ChatWindow.jsx`, `ResizeLayer.jsx`) decide how to notify
(keep `alert` there for now). Background caller uses `logError`.

**Option B:** split into `storage.js` (pure) + `uiStorage.js` (wraps with user-facing error
handling). Cleaner layering, slightly more files.

---

### 3. `pttPort` undefined race on START / SEND
**Where:** `src/background.js:94,97` — user can submit login before the PTT tab has loaded
WASM and connected the port (multi-second window), or after a SW restart before reconnect.
`pttPort.postMessage` throws inside the async listener → unhandled rejection, user stuck on
LOADING forever. There is also no handling for the PTT tab failing to load at all.

**Option A — Recommended: guard + queue-one + timeout**
- If `pttPort` is falsy on START: stash the START payload; flush it in `onConnect`.
- Add a timeout (e.g. 15s) after START: if no port/no first MSG, send `MESSAGE_TYPE.ERROR`
  to `chatTab` ("PTT 連線失敗，請重試") and `stopExtension()`.
- On SEND with no port: reply with ERROR instead of throwing.

**Option B:** full handshake — content script stays on LOADING until background confirms
`READY` (new message type sent when port connects), and Login submit is disabled until READY.
More states, but removes the race by construction.

---

### 4. `DEADLINE_EXCEEDED` auto-relogin: unbounded retry, possible crash
**Where:** `src/App.jsx:99-102` — `start(loginDataRef.current)` has no null guard (crashes if
the content script was re-mounted and the ref is empty) and no retry limit/backoff (permanent
server issue → infinite reconnect loop opening PTT sessions).

**Option A — Recommended:** guard `loginDataRef.current` (fall back to `reset()`), cap retries
(e.g. 3, reset counter on successful MSG), small delay between retries.

**Option B:** move reconnect logic to the background worker (it owns the connection lifecycle),
UI only displays state. Architecturally cleaner; more moving parts.

---

## P1 — Security

### 5. PTT password is exposed to the host page
**Where:** `src/content.jsx:6-8` mounts React into a plain `div` appended to `document.body`;
`src/Login.jsx:49-50` renders the password input. Any script running on the streaming page
(YouTube, Twitch, hamivideo, eltaott, arbitrary sites the user toggles on) can read
`input[name=password]` from the DOM. Password also persists in `loginDataRef` (`App.jsx:60`)
for relogin — acceptable, but worth noting.

Note: `CLAUDE.md` claims shadow-DOM mounting — the code does **not** use one. Fix the doc
either way (Issue 13).

**Option A — Pragmatic: closed shadow root**
- Mount React + `<style>` inside `root.attachShadow({mode: 'closed'})`.
- Also fixes CSS isolation both directions (Issue 10).
- Trade-off: NOT complete protection (a hostile page can patch `attachShadow` before injection
  or observe composed keyboard events), but stops casual DOM scraping and is a small change.
  Verify event handling (Escape key listeners, `react-select` portals) still work inside the
  shadow root.

**Option B — Best practice: extension-origin iframe for login**
- Render the login form in a `chrome-extension://` page embedded as an iframe by the content
  script. Cross-origin isolation means the host page cannot read inputs or keystrokes, period.
- Credentials flow iframe → background directly, never through the content script.
- Trade-off: new HTML entry point, styling/positioning the iframe within the chat window,
  message plumbing. This is the only real fix if hostile host pages are in scope.

**Recommendation:** A now (bundled with Issue 10), B as a follow-up if the extension is meant
to be safe on arbitrary user-chosen sites.

---

## P1 — Architecture

### 6. Hidden PTT tab is fragile
**Where:** `src/background.js:169-174`. The `term.ptt.cc` tab is a normal background tab: the
user can close it (extension dies via port disconnect — handled, but abrupt), Chrome Memory
Saver can discard it (WASM/WebSocket gone), and it clutters the tab strip.

**Option A — Recommended: harden the tab**
- `chrome.tabs.onRemoved` for `pttTabId` → clean shutdown with a user-visible ERROR message
  ("PTT 分頁已關閉") instead of silent stop.
- Set `autoDiscardable: false` via `chrome.tabs.update` to prevent Memory Saver discard.
- Optionally pin the tab (`pinned: true`) so it's small and less likely to be closed by accident.
- Low effort, keeps current architecture.

**Option B — Offscreen document + declarativeNetRequest**
- Run `wasm_exec.js` + `ptt.wasm` in a `chrome.offscreen` document; use DNR
  `modifyHeaders` to set `Origin: https://term.ptt.cc` on the WebSocket handshake to
  `ws.ptt.cc` so the server accepts it. Eliminates the hidden tab entirely.
- Trade-offs: needs `offscreen` + `declarativeNetRequest` permissions and host permission for
  the WS endpoint; Origin-rewrite must be verified against the real PTT server; store review
  may ask questions about DNR header modification. Meaningful rewrite of `ptt.js` wiring.

**Recommendation:** A. Revisit B only if tab fragility keeps generating user complaints.

---

### 7. PING/PONG heartbeat is half-implemented
**Where:** `src/background.js:137-143` sends PING; `src/ptt.js:19-21` replies PONG; nothing
ever reads PONG. So there is no actual dead-peer detection — the ping's only real effect is
keeping the SW/port alive.

**Option A — Recommended:** make it honest: track `lastPongAt`; if no PONG within 2 intervals,
treat the PTT tab as dead → `stopExtension()` + ERROR to chat tab. Small change, uses the
plumbing that already exists.

**Option B:** delete PONG handling and the PONG type, keep PING purely as keep-alive with a
comment saying so. Less code, but keeps the "why is this here" smell and no failure detection.

---

### 8. Message-type literals bypass `consts.js`
**Where:** `src/Chat.jsx:41` (`"SEND"`), `src/ptt.js:25` (`"MSG"`), `src/ptt.js:29` (`"ERR"`).
`MESSAGE_TYPE.ERROR === 'ERR'` while the key is `ERROR` — easy to typo a literal and break
routing silently (the default branch only logs).

**Fix (no options needed — trivial):** use `MESSAGE_TYPE.*` everywhere; consider renaming the
constant value `'ERR'` → keep as is (wire format) but never hand-write it.

---

### 9. Go WASM runtime bundled into the React UI for nothing
**Where:** `src/App.jsx:2` and `src/ChatWindow.jsx:3` — `import './wasm_exec'`. The Go runtime
(~575 lines, defines global `Go`) is only needed in the PTT tab (`src/ptt.js` loads it via
`chrome.runtime.getURL`). In the content bundle it's dead weight and pollutes the host page's
global scope (`globalThis.Go`).

**Fix (trivial):** delete both imports. Verify the content build no longer contains `wasm_exec`.

---

### 10. No CSS isolation from host page → also see Issue 5
**Where:** `src/content.jsx` injects `<style>` + div straight into the page. Tailwind's `ppt-`
prefix protects the *page* from *us*, but host-page CSS (e.g. aggressive `div { ... }` rules,
YouTube's styles) can still restyle the chat UI.

**Fix:** covered by Issue 5 Option A (shadow root). If shadow root is rejected, at minimum add
`all: initial`-style containment on `#crx-root`.

---

### 11. ON/OFF re-injection relies on undocumented crxjs loader caching
**Where:** `src/background.js:179-187`. Every ON click runs `executeScript` again; the comment
says "content script only run at first time". That's only true because the crxjs dev/build
loader dynamic-imports the real module and the module cache dedupes. If crxjs changes its
loader, toggling would mount a second `#crx-root` + second React app (double chat windows,
double message listeners).

**Option A — Recommended:** guard in `src/main.jsx`: if `document.getElementById('crx-root')`
exists, skip mount (the ON message re-activates the existing app). One line, removes the
fragile assumption.

**Option B:** track injected tabs in `chrome.storage.session` and skip `executeScript` when
already injected. More state to maintain; Option A is strictly simpler.

---

### 12. Single-chat-tab assumption / orphaned UIs
**Where:** `src/background.js:10,176-177` — `chatTab` is one global. Turning ON in tab A, then
ON in tab B (after toggling OFF) leaves tab A's content script mounted and listening forever;
`runtime.sendMessage` from an orphaned tab (e.g. BLACKLIST_ADD) still mutates shared state.

**Option A — Recommended:** accept single-session design but make it explicit: when
`startExtension` runs and an old `chatTab` exists, send it `OFF` first. Document "one chat
window at a time" in CLAUDE.md/README.

**Option B:** true multi-tab support (map of chatTabId → session). Significant relay redesign;
YAGNI unless users ask for it.

---

## P2 — Quality / maintenance

### 13. Documentation drift (CLAUDE.md / README)
- CLAUDE.md says UI mounts into "shadow DOM or injected div" — only injected div exists today
  (update after Issue 5/10 lands).
- CLAUDE.md says the PTT tab "bridges WASM events back to the background via
  `chrome.runtime.sendMessage`" — it actually uses a long-lived Port (`runtime.connect`,
  `src/ptt.js:11`). The `background.js:87` comment has it right.
- **Fix:** correct both lines when touching the related code (project policy: keep docs
  updated, avoid over-detailing).

### 14. Test coverage is effectively zero
Only `src/IconButton.test.jsx` (trivial). Highest-value targets, in order:
1. `indexedDbRepo` — add/getBlacklist/delete/uniqueness-constraint/destroy (use `fake-indexeddb`).
2. Background message routing — START/SEND/BLACKLIST_* switch + `isFirstMessage` ordering
   (the bug just fixed in the uncommitted diff is exactly the kind of regression a test catches).
   Requires mocking `chrome.*`; a tiny hand-rolled mock is fine, YAGNI on heavy frameworks.
3. `App.jsx` message listener — MSG appends + `MAX_MESSAGE_COUNT` cap, ERROR branches,
   BLACKLIST set derivation.

### 15. Small fixes (batch these)
- `src/Chat.jsx:40-43`: `sendMessage` sends empty/whitespace input — guard with
  `if (!input.trim()) return`.
- `src/log.js`: `logError` uses `console.log` — use `console.error`; consider prefixing
  `[ptt-chat]` for findability in SW logs.
- `src/ResizeLayer.jsx:54,76`: `storage.saveBounding` runs on mount (isWidth/isHeight start
  false), writing storage needlessly — only save when a resize actually ended.
- `src/App.jsx:14`: `getVideoContainer`/`supportFullscreen` host special-cases → move to a
  single site-config map in `configs.js` (data, not branches).
- `src/Login.jsx:44`: `minLength` does nothing outside a validated form; either validate on
  submit (empty username/password → don't submit) or drop the attribute.
- `package.json` version `0.0.0` vs manifest `1.0.11` — sync or note that manifest is the
  source of truth.

### 16. Dependency staleness (do deliberately, not casually)
Vite 4 / Vitest 0.34 / `@crxjs/vite-plugin` 2.0.0-beta.28 / React 18 are all old. crxjs beta
is the risky pin (it dictates the loader behavior Issue 11 depends on). When upgrading, check
current stable versions and migration notes via context7 first; upgrade crxjs + vite together
in one dedicated change with manual extension smoke-testing (build, load unpacked, toggle
ON/OFF, login, blacklist).

---

## Suggested implementation order

1. **Batch 1 (bugs, no behavior redesign):** Issues 2, 8, 9, 15 + guard from Issue 4 Option A.
2. **Batch 2 (SW resilience):** Issue 1 Option A, Issue 3 Option A, Issue 7 Option A,
   Issue 6 Option A, Issue 11 Option A, Issue 12 Option A.
3. **Batch 3 (isolation):** Issue 5/10 Option A (shadow root) + CLAUDE.md updates (Issue 13).
4. **Batch 4 (tests):** Issue 14 (at least indexedDbRepo + background routing).
5. **Later / on demand:** Issue 5 Option B (login iframe), Issue 6 Option B (offscreen+DNR),
   Issue 16 (dependency upgrade).
