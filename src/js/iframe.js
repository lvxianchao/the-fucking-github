window.addEventListener('storage', function (e) {
    if (e.key === 'TheFuckingGithub') {
        let TheFuckingGithub = JSON.parse(e.newValue);
        chrome.storage.sync.set({tags: TheFuckingGithub.tags});
        chrome.storage.sync.set({tagsAndRepositories: TheFuckingGithub.tagsAndRepositories});
        chrome.storage.sync.set({token: TheFuckingGithub.token});
    }
});