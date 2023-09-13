(async () => {
  const src = chrome.runtime.getURL("src/wasm_exec.js");
  await import(/* @vite-ignore */src);

  const go = new Go();
  const wasm = await WebAssembly.instantiateStreaming(fetch(chrome.runtime.getURL("src/ptt.wasm")), go.importObject)
  go.run(wasm.instance)

  const port = chrome.runtime.connect({name: 'PTT'});
  port.onMessage.addListener(function (request) {
    const {type} = request
    if (type === 'START') {
      const {username, password, deleteDuplicate, board, article} = request.data
      pollingMessages(username, password, deleteDuplicate, board, article, sendPushes, notifyError)
    } else if (type === 'SEND') {
      pushMessage(request.data, notifyError)
    } else if (type === 'PING') {
      port.postMessage({type: 'PONG'});
    }
  });

  function sendPushes(pushes) {
    port.postMessage({type: "MSG", data: pushes});
  }

  function notifyError(errorStr) {
    port.postMessage({type: "ERR", data: errorStr});
  }
})();
