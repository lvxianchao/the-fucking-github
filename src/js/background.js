// The Fucking Github 的标签页 ID
window.tabId = null;

// 当点击了插件 LOGO 后判断是否已开启了插件页面，如果已经开启了，则激活插件页面，否则开启插件页面。
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

// 监听标签页关闭事件，如果关闭的是插件页面，则重置插件的标签页 ID。
chrome.tabs.onRemoved.addListener(function (tabId) {
    if (tabId === window.tabId) {
        window.tabId = null;
    }
});