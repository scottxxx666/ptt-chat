# PTT Chat

在觀看任何實況時，可以同時發和看 ptt 推文

## 使用方式

[//]: # (- 詳細圖文教學請至 https://github.com/scottxxx666/ptt-chat#使用方式)
- 目前全螢幕只有 Youtube 下可以出現，holodex 和 twitch 僅支援劇院模式  

### Youtube
![Youtube](/docs/youtube.gif)

### Twitch 劇院模式
![Twitch 劇院模式](/docs/twitch.gif)

### 功能

- 自動更新推文
- 發推文 (enter 發送)
- 更改聊天室大小及位置
- 隱藏背景
- 縮小到旁邊
- 淺色深色模式
- 更改文字和帳號顏色

### 注意事項

- 開啟時會開一個 PTT 的 tab，請不要關掉，需要那個 tab 才能夠連到 PTT。正常情況下 tab 會在關閉時跟著關閉
- 目前僅支援 big5 字元集，日文、簡體字或是特殊符號可能會出現錯誤（讀或是發推文都是）
- 部分錯誤仍在處理中，通常再開關一次或是重新整理網頁可以解決大部分的問題
- 如果仍有問題，可以登入 PTT 確認一下，有可能某些情況沒有處理到（比方說沒有權限），歡迎回報問題
- 已知在 holodex 播放器上方調整大小會有 bug, 目前請先改好大小再移動至播放器上方

### 熱鍵

- 開啟／關閉：`CTRL(Cmd) + b`
- 可以至 [chrome://extensions/shortcuts](chrome://extensions/shortcuts) 自行修改

### 問題回報
- 程式碼公開於 https://github.com/scottxxx666/ptt-chat
- 可以在 github 開 issue 或是寄 email 至 `ptt.chat.extension@gmail.com`
- 由於未收集任何資料，問題回報時如果能提供越多資訊可以加速處理的時間，感謝
    - 時間
    - 問題內容（越詳細越好）
    - 看板和文章 id
    - chrome 版本

### 隱私

- 僅儲存聊天室顏色和位置大小在使用者電腦
- 未收集任何個人訊息，也沒有雲端儲存

## Reference

- 部分程式參考 [PyPtt](https://github.com/PyPtt/PyPtt)，感謝開源
- icon https://alexleybourne.github.io/chrome-extension-icon-generator/

## Development

- 連線 ptt 的部分在 https://github.com/scottxxx666/ptt-websocket/tree/wasm
- go 1.20.1 (wasm_exec.js)
