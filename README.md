# PTT Chat

https://pse.is/ptt-chat

在觀看任何實況時，可以同時發和看 ptt 推文

## 使用方式

[//]: # (- 詳細圖文教學請至 https://github.com/scottxxx666/ptt-chat#使用方式)

### Youtube

![Youtube](/docs/youtube.gif)

### Twitch 劇院模式

![Twitch 劇院模式](/docs/twitch.gif)

### 功能

- 自動更新推文
- 發推文（enter 發送）
- 更改聊天室位置（拖曳上方按鈕那排沒有按鈕的部分）
- 更改聊天室大小（Esc 可以離開更改大小模式）
- 隱藏背景
- 縮小到旁邊
- 淺色深色模式
- 更改文字和帳號顏色

### 隱私

- 僅儲存聊天室顏色和位置大小在使用者電腦
- 未收集任何個人訊息，也沒有雲端儲存
- 程式碼公開於 https://github.com/scottxxx666/ptt-chat

### 注意事項

- 安裝時如果出現『安全瀏覽強化防護功能不信任這個擴充功能』，是因為這是第一次做 Chrome Extension，Google
  文件寫新加入的開發人員通常需要幾個月才能獲得信任
- 開啟時會開一個 PTT 的 tab，請不要關掉，需要那個 tab 才能夠連到 PTT。正常情況下 tab 會在關閉時跟著關閉
- 如果發生錯誤，通常再開關一次或是重新整理網頁可以解決大部分的問題
- 如果仍有問題，可以登入 PTT 確認一下，有可能某些情況沒有處理到，歡迎回報問題
- 目前全螢幕只有 Youtube 下可以出現，holodex 和 twitch 僅支援劇院模式

### 熱鍵

- 開啟／關閉：`CTRL(Cmd) + b`
- 可以至 [chrome://extensions/shortcuts](chrome://extensions/shortcuts) 自行修改

### 問題回報

- 可以在 github 開 issue 或是寄 email 至 `ptt.chat.extension@gmail.com`
- 由於未收集任何資料，問題回報時如果能提供越多資訊可以加速處理的時間，感謝
    - 時間
    - 問題內容（越詳細越好）
    - 看板和文章 id
    - chrome 版本

## Reference

- 部分程式參考 [PyPtt](https://github.com/PyPtt/PyPtt)，感謝開源
- icon https://alexleybourne.github.io/chrome-extension-icon-generator/
- UTF-8 參考 [pyUAO](https://github.com/eight04/pyUAO) 和 [Ptt-official-app](https://github.com/Ptt-official-app/go-openbbsmiddleware)

## 更新紀錄
v1.0.6 更新
- 當 PTT 過久沒回應（卡在未知的步驟）時重新連線
- 修正解析推文錯誤會卡住或是重覆出現

v1.0.5 更新：
- 支援 UTF-8

v1.0.4 更新：
- 修正閒置超過 30 秒之後按開始會卡在 loading

v1.0.3 更新：
- 修正剛安裝時載入較慢就會關閉而只顯示 loading 的錯誤
- 修正登入時信箱已滿的判斷

v1.0.2 更新：
- 刪除重覆連線可以正常使用
- 修正調整大小在 holodex 或是 Youtube 聊天室的問題

## Development

- 連線 ptt 的部分在 https://github.com/scottxxx666/ptt-websocket/tree/wasm
- go 1.20.1 (wasm_exec.js)
