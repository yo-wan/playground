let isClaiming = false;

function clickClaimButtonWhenVisible() {
    const observer = new MutationObserver(() => {
		const button = document.querySelector("[aria-label^='Claim Bonus']");

		if (button && isVisible(button) && !isClaiming) {
			isClaiming = true;
			
			button.click();
			setTimeout(() => {
				isClaiming = false;
			}, 2000);
		}
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
}
  
function isVisible(el) {
	const style = window.getComputedStyle(el);
	return el.offsetParent !== null && style.visibility !== "hidden" && style.display !== "none";
}

clickClaimButtonWhenVisible();

module.exports = { clickClaimButtonWhenVisible, isVisible };