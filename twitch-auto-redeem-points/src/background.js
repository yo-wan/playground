setTimeout(function() {
    browser.tabs.query({url: "*://*.twitch.tv/*"})
        .then(tabs => {
            tabs.forEach(tab => {
                browser.tabs.executeScript(tab.id, { file: "/src/clicker.js" })
                    .then(resolve => {
                        console.log('Twitch auto redeem points loaded for ' + tab.title);
                    })
                    .catch(error => {
                        console.log('error');
                        console.log(error);
                    });
            });
        });
}, 2000);
