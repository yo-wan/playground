var interval = 10000;
var elements = null;

setInterval(function() {
    elements = document.querySelector("div.community-points-summary");
    if (!elements) {
        return;
    }

    buttons = elements.querySelectorAll("[aria-label^='Claim Bonus']:not([hidden])");
    buttons.forEach(element => {
        element.click();
    });
}, interval);
