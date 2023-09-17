import content from './content?script'
import toggleChat from './toggleChat?script&module'
import storage from "./storage.js";
import {logError} from "./log.js";

chrome.runtime.onInstalled.addListener(details => {
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
  sendMessage(chatTab, {type: 'DEFAULT'});
});

async function setStatus(nextState) {
  await chrome.action.setBadgeText({
    text: nextState,
  });
}

chrome.action.onClicked.addListener(async (tab) => {
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

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  const {type} = request
  if (type === 'START') {
    pttPort.postMessage({type: 'START', data: request.data})
  } else if (type === 'SEND') {
    pttPort.postMessage(request);
  } else if (type === 'STOP') {
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
      port.postMessage({type: 'PING'})
    } catch (e) {
      clearInterval(pttInterval)
    }
  }, 10000)

  port.onMessage.addListener(function (request) {
    const {type} = request
    if (type === 'MSG' && chatTab) {
      sendMessage(chatTab, request);
    } else if (type === 'ERR' && chatTab) {
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
    files: [toggleChat],
  });

  await chrome.scripting.executeScript({
    target: {tabId: chatTab},
    files: [content],
  });

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
    await chrome.scripting.executeScript({
      target: {tabId: chatTab},
      files: [toggleChat],
    });

    sendMessage(chatTab, {type: 'STOP'}, true)
  } catch (e) {
    logError('stop extension', e)
  }
}
