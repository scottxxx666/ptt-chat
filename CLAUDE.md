# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start Vite dev server
yarn build        # Build extension for production
yarn lint         # ESLint (max-warnings 0)
yarn test         # Run tests once with Vitest
yarn test:watch   # Watch mode
yarn test:ui      # Vitest UI
```

> Per project policy: do not run build/test/lint commands — user runs these manually.

## What This Is

A Chrome Extension (Manifest V3) that embeds PTT (Ptt.cc, a Taiwanese BBS) chat into video streaming pages (YouTube, Twitch, etc.). Built with Vite + `@crxjs/vite-plugin` for Chrome extension bundling.

## Architecture

Three isolated execution contexts communicate via Chrome message passing:

### 1. Background Service Worker (`src/background.js`)
- Controls the extension ON/OFF toggle (badge color)
- Opens/closes a hidden PTT tab at `https://term.ptt.cc/`
- Routes all messages between content scripts and the PTT tab
- Manages the blacklist via IndexedDB (`src/indexedDbRepo.js`)
- Handles context menu ("add to blacklist") and ping/heartbeat logic

### 2. PTT Tab (`src/ptt.js` + `src/ptt.wasm`)
- Injected into the PTT tab opened by the background worker
- Loads a Go-compiled WebAssembly module (`ptt.wasm`) for PTT WebSocket protocol
- `wasm_exec.js` is the Go WASM runtime (do not lint/modify)
- Bridges WASM PTT events back to the background via `chrome.runtime.sendMessage`

### 3. Content Script + React UI (`src/content.jsx`, `src/App.jsx`)
- Injected into streaming pages; mounts React UI into a shadow DOM or injected div
- App states: `LOGIN → LOADING → STREAMING → OFF`
- Detects fullscreen and repositions the chat window accordingly
- Theme/bounding-box persisted via Chrome Storage API (`src/storage.js`)

### Message Flow
```
Video Page → Content Script → Background Worker → PTT Tab (WASM) → PTT Server
                                     ↑_____________↓ (message relay)
```

Message type constants are in `src/consts.js` (`START`, `SEND`, `MSG`, `PING`, `PONG`, `ERROR`, `BLACKLIST`).

## Key Conventions

- **CSS isolation**: Tailwind uses the `ppt-` prefix (`tailwind.config.js`) to avoid conflicts with host page styles
- **Storage split**: Chrome Storage API for UI/theme settings; IndexedDB for blacklist data
- **WASM source**: The Go code for `ptt.wasm` lives in a separate repo (`scottxxx666/ppt-websocket`, `wasm` branch) — updating the binary requires rebuilding there
- **Test environment**: Vitest with jsdom (`vitest.config.js`); ESLint ignores `wasm_exec.js` and test files
