var inteval = 10000;
var elements = null;

setInterval(function() {
    elements = document.querySelector("div.community-points-summary");
    if (!elements) {
        return;
    }

    buttons = elements.querySelectorAll("button.tw-button--success:not([hidden])");
    buttons.forEach(element => {
        element.click();
    });
}, inteval);