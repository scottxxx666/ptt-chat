import content from './content?script'
import toggleChat from './toggleChat?script&module'
import storage from "./storage.js";

chrome.runtime.onInstalled.addListener(details => {
  console.log('details', details)
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
  chrome.tabs.sendMessage(chatTab, {type: 'DEFAULT'});
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

let pttTab
let chatTab

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  console.log(request)
  const {type} = request
  if (type === 'START') {
    await chrome.tabs.sendMessage(pttTab, {type: 'START', data: request.data});
  } else if (type === 'PTT' && sender.tab.id === pttTab) {
    await chrome.tabs.sendMessage(chatTab, {type: 'READY'});
  } else if (type === 'SEND') {
    await chrome.tabs.sendMessage(pttTab, request);
  } else if (type === 'STOP') {
    stopExtension();
  } else if (type === 'MSG' && chatTab) {
    try {
      await chrome.tabs.sendMessage(chatTab, request);
    } catch (e) {
      console.log(e);
      stopExtension();
    }
  } else if (type === 'ERR' && chatTab) {
    try {
      await chrome.tabs.sendMessage(chatTab, request);
    } catch (e) {
      console.log(e);
    }
  }
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
  if (pttTab) {
    chrome.tabs.remove(pttTab);
  }

  try {
    await chrome.scripting.executeScript({
      target: {tabId: chatTab},
      files: [toggleChat],
    });

    await chrome.tabs.sendMessage(chatTab, {type: 'STOP'})
  } catch (e) {
    console.log(e)
  }

  setStatus('OFF');
  chatTab = null
}
