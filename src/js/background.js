chrome.browserAction.onClicked.addListener(function () {
    let index = chrome.extension.getURL('index.html');

    if (window.tabId) {
        chrome.tabs.update(window.tabId, {selected: true});
    } else {
        chrome.tabs.create({url: index}, function (tab) {
            window.tabId = tab.id;
        });
    }
});