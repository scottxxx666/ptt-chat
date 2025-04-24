import content from './content?script'
import storage from "./storage.js";
import {logError} from "./log.js";
import {MESSAGE_TYPE} from "./consts.js";
import IndexedDbRepo from "./indexedDbRepo.js";

const blacklistRepo = new IndexedDbRepo('ptt-chat')
let pttTab
let chatTab
let username

const handleError = async func => func().catch((e) => logError(e));

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });

  chrome.contextMenus.create({
    id: 'default',
    title: '還原為預設值',
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'addBlacklist',
    title: '新增至黑名單',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuId = info.menuItemId
  if (menuId === 'default') {
    await storage.clear()
    sendMessage(chatTab, {type: MESSAGE_TYPE.DEFAULT});
    deleteDatabase()
  } else if (menuId === 'addBlacklist') {
    if (!username) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: message => { alert(message); },
        args: ['請先登入']
      });
      return
    }
    const {selectionText} = info
    if (!selectionText) return
    await handleError(async () => {
      await blacklistRepo.add(username, selectionText);
      notifyBlacklist()
    })
  }
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

// only chatTab use runtime.onMessage, pttTab use port
chrome.runtime.onMessage.addListener(async function (request) {
  const {type} = request
  switch (type) {
    case MESSAGE_TYPE.START:
      username = request.data.username
      pttPort.postMessage({type: MESSAGE_TYPE.START, data: request.data});
      break;
    case MESSAGE_TYPE.SEND:
      pttPort.postMessage(request);
      break;
    case MESSAGE_TYPE.OFF:
      stopExtension();
      break;
    case MESSAGE_TYPE.BLACKLIST_ADD:
      await handleError(async () => {
        const {blockedUser} = request.data
        await blacklistRepo.add(username, blockedUser);
        notifyBlacklist()
      })
      break;
    case MESSAGE_TYPE.BLACKLIST_DELETE:
      await handleError(async () => {
        const {id} = request.data
        const data = await blacklistRepo.get(id);
        if (data?.user !== username) {
          throw new Error('invalid user');
        }
        await blacklistRepo.delete(id);
        notifyBlacklist()
      })
      break;
    default:
      logError('unknown message type', type)
  }
})

let pttPort;
let pttInterval;
let isFirstMessage;

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

  pttPort.onMessage.addListener(function (request) {
    const {type} = request
    if (type === MESSAGE_TYPE.MSG && chatTab) {
      if (isFirstMessage) {
        isFirstMessage = false
        handleError(notifyBlacklist)
      }
      sendMessage(chatTab, request);
    } else if (type === MESSAGE_TYPE.ERROR && chatTab) {
      sendMessage(chatTab, request, true);
    }
  });
});

async function notifyBlacklist() {
  const blacklist = await blacklistRepo.getBlacklist(username);
  sendMessage(chatTab, {type: MESSAGE_TYPE.BLACKLIST, data: {blacklist}});
}

async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  return tab;
}

function deleteDatabase(dbName) {
  const request = indexedDB.deleteDatabase(dbName);

  request.onsuccess = () => {
    console.log(`Database "${dbName}" deleted successfully.`);
  };

  request.onerror = (event) => {
    console.error(`Error deleting database "${dbName}":`, event.target.error);
  };

  request.onblocked = () => {
    console.warn(`Database "${dbName}" deletion is blocked. Close all connections to the database.`);
  };
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
