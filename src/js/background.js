chrome.browserAction.onClicked.addListener(function () {
    let index = chrome.extension.getURL('index.html');

    chrome.tabs.create({url: index});
});