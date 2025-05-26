let isClaiming = false;

function clickClaimButtonWhenVisible() {
    const observer = new MutationObserver(() => {
		const button = document.querySelector("[aria-label^='Claim Bonus']");
		if (button && isVisible(button) && !isClaiming) {
			isClaiming = true;

			button.click();
			setTimeout(() => {
				saveStatistics().catch(error => console.log(error))
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

async function saveStatistics() {
	let url = document.URL;

	let addedPoints = Number(document.getElementsByClassName('community-points-summary__points-add-text')[0].textContent);

	let currentChannelPoints = await chrome.storage.sync.get(url)
	if (!currentChannelPoints) {
		currentChannelPoints = 0
	} else {
		currentChannelPoints = Number(currentChannelPoints[url])
	}

	// console.log(44, url, currentChannelPoints, addedPoints)

	chrome.storage.sync.set({ [url] : currentChannelPoints + addedPoints })
}

clickClaimButtonWhenVisible();