(async () => {
  const src = chrome.runtime.getURL("src/wasm_exec.js");
  await import(/* @vite-ignore */src);

  const go = new Go();
  const wasm = await WebAssembly.instantiateStreaming(fetch(chrome.runtime.getURL("src/ptt.wasm")), go.importObject)
  go.run(wasm.instance)

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      const {type} = request
      if (type === 'START') {
        const {username, password, deleteDuplicate, board, article} = request.data
        pollingMessages(username, password, deleteDuplicate, board, article, sendPushes, notifyError)
      } else if (type === 'SEND') {
        const res = pushMessage(request.data, notifyError)
      }
    }
  );

  function sendPushes(pushes) {
    chrome.runtime.sendMessage({type: "MSG", data: pushes});
  }

  function notifyError(errorStr) {
    chrome.runtime.sendMessage({type: "ERR", data: errorStr});
  }
})();
