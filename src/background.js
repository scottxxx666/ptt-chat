import content from './content?script'
import toggleChat from './toggleChat?script&module'

chrome.runtime.onInstalled.addListener(details => {
  console.log('details', details)
  chrome.action.setBadgeText({
    text: "OFF",
  });
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
  if (type === 'PTT' && sender.tab.id === pttTab) {
    await chrome.tabs.sendMessage(pttTab, {type: 'START'});
  } else if (type === 'MSG' && chatTab) {
    try {
      await chrome.tabs.sendMessage(chatTab, request);
    } catch (e) {
      console.log(e);
      stopExtension();
      chatTab = null
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

  await chrome.scripting.executeScript({
    target: {tabId: chatTab},
    files: [toggleChat],
  });

  setStatus('OFF');
}
