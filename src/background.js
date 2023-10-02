import content from './content?script'
import storage from "./storage.js";
import {logError} from "./log.js";
import {MESSAGE_TYPE} from "./consts.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });

  chrome.contextMenus.create({
    id: 'default',
    title: '還原為預設值',
    contexts: ['selection', 'action']
  })
});

chrome.contextMenus.onClicked.addListener(async () => {
  await storage.clear()
  sendMessage(chatTab, {type: MESSAGE_TYPE.DEFAULT});
});

async function setStatus(nextState) {
  await chrome.action.setBadgeText({
    text: nextState,
  });
}

chrome.action.onClicked.addListener(async () => {
  const prevState = await chrome.action.getBadgeText({});
  const nextState = prevState === 'ON' ? 'OFF' : 'ON'

  if (nextState === "ON") {
    startExtension();
  } else if (nextState === "OFF") {
    stopExtension();
  }
})

async function sendMessage(tab, data, ignoreError) {
  try {
    await chrome.tabs.sendMessage(tab, data);
  } catch (e) {
    const tabName = tab === pttTab ? 'PTT' : 'CHAT'
    logError(`send ${tabName} message`, e)
    if (!ignoreError) {
      stopExtension()
    }
  }
}

let pttTab
let chatTab

chrome.runtime.onMessage.addListener(async function (request) {
  const {type} = request
  if (type === MESSAGE_TYPE.START) {
    pttPort.postMessage({type: MESSAGE_TYPE.START, data: request.data})
  } else if (type === MESSAGE_TYPE.SEND) {
    pttPort.postMessage(request);
  } else if (type === MESSAGE_TYPE.OFF) {
    stopExtension();
  }
})

let pttPort;
let pttInterval;

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== 'PTT') return
  pttPort = port
  pttPort.onDisconnect.addListener(() => {
    clearInterval(pttInterval)
    stopExtension()
  })

  pttInterval = setInterval(() => {
    try {
      port.postMessage({type: MESSAGE_TYPE.PING})
    } catch (e) {
      clearInterval(pttInterval)
    }
  }, 10000)

  port.onMessage.addListener(function (request) {
    const {type} = request
    if (type === MESSAGE_TYPE.MSG && chatTab) {
      sendMessage(chatTab, request);
    } else if (type === MESSAGE_TYPE.ERROR && chatTab) {
      sendMessage(chatTab, request, true);
    }
  });
});

async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  return tab;
}

async function startExtension() {
  const t = await chrome.tabs.create({
    url: "https://term.ptt.cc/",
    active: false,
  });
  pttTab = t.id

  const tab = await getCurrentTab();
  chatTab = tab.id;

  await chrome.scripting.executeScript({
    target: {tabId: chatTab},
    files: [content],
  });

  // since content script only run at first time
  // use message to turn on instead
  sendMessage(chatTab, {type: MESSAGE_TYPE.ON}, true)

  setStatus('ON');
}

async function stopExtension() {
  const state = await chrome.action.getBadgeText({});
  if (state === 'OFF') return
  await setStatus('OFF');

  // since chat page reload will not close ptt tab
  // at least stop heartbeat
  clearInterval(pttInterval)

  chrome.tabs.remove(pttTab).catch(() => {
  })

  try {
    sendMessage(chatTab, {type: MESSAGE_TYPE.OFF}, true)
  } catch (e) {
    logError('stop extension', e)
  }
}
