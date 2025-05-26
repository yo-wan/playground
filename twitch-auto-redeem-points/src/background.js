setTimeout(function() {
    chrome.tabs.query({ url: ["*://*.twitch.tv/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["/src/clicker.js"]
            });
        });
    });
}, 2000);
