import content from './content?script'

chrome.runtime.onInstalled.addListener(details => {
    console.log('details', details)
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

async function setStatus(nextState) {
    // Set the action badge to the next state
    await chrome.action.setBadgeText({
        text: nextState,
    });
}

chrome.action.onClicked.addListener(async (tab) => {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({});
    // const prevState = await chrome.action.getBadgeText({tabId: tab.id});
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    if (nextState === "ON") {
        startExtension();
    } else if (nextState === "OFF") {
        // stopExtension();
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
    }else if (type === 'OPEN') {
        // startExtension();
        await setStatus('ON');
        sendResponse('ON');
    }else if (type === 'CLOSE') {
        // startExtension();
        await setStatus('OFF');
        sendResponse('OFF');
    }
});

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    return tab;
}

async function startExtension() {
    // const t = await chrome.tabs.create({
    //     url: "https://term.ptt.cc/",
    //     active: false,
    // });
    // pttTab = t.id

    const tab = await getCurrentTab();
    chatTab = tab.id;

    await chrome.scripting.executeScript({
        target: {tabId: chatTab},
        files: [content],
    });

    // await chrome.scripting.insertCSS({
    //     files: ['chat.css'],
    //     target: {tabId: chatTab}
    // });
    //
    // if (chatTab) {
    //     await chrome.tabs.sendMessage(chatTab, {type: 'START'});
    //     setStatus('ON');
    // }
}

async function stopExtension() {
    if (pttTab) {
        chrome.tabs.remove(pttTab);
    }
    if (chatTab) {
        chrome.tabs.sendMessage(chatTab, {type: 'STOP'}).catch(e => console.log(e))
        await chrome.scripting.removeCSS({
            files: ['chat.css'],
            target: {tabId: chatTab}
        });
    }
    setStatus('OFF');
}
