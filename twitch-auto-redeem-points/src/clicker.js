let isClaiming = false;

function clickClaimButtonWhenVisible() {
    const observer = new MutationObserver(() => {
		const button = document.querySelector("[aria-label^='Claim Bonus']");
		if (button && isVisible(button) && !isClaiming) {
			isClaiming = true;

			button.click();
			saveStatistics()
				.catch(error => console.log(error))
				.finally(() => {
					isClaiming = false;
				});
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

// Twitch shows a "+50" style label next to the balance for a few seconds after a claim
async function getAddedPoints(retries = 10, delay = 300) {
	for (let i = 0; i < retries; i++) {
		const el = document.querySelector('.community-points-summary__points-add-text');
		const points = el ? Number(el.textContent.replace(/[^\d]/g, '')) : 0;
		if (points > 0) {
			return points;
		}
		await new Promise(resolve => setTimeout(resolve, delay));
	}
	return 0;
}

// Normalize the page URL to https://www.twitch.tv/<channel> so query strings,
// sub-pages (/videos, /about) and popout chat all count towards the same channel
function getChannelKey() {
	const segments = location.pathname.split('/').filter(Boolean);
	const channel = ['popout', 'moderator', 'embed'].includes(segments[0]) ? segments[1] : segments[0];
	return channel ? `https://www.twitch.tv/${channel.toLowerCase()}` : null;
}

async function saveStatistics() {
	const key = getChannelKey();
	if (!key) {
		return;
	}

	const addedPoints = await getAddedPoints();
	if (!addedPoints) {
		return;
	}

	// storage.get resolves to {} when the key is missing, so default via Number(...) || 0
	const stored = await chrome.storage.sync.get(key);
	const currentChannelPoints = Number(stored[key]) || 0;

	await chrome.storage.sync.set({ [key]: currentChannelPoints + addedPoints });
}

clickClaimButtonWhenVisible();

// Content scripts have no `module`; this only runs under Jest
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { clickClaimButtonWhenVisible, isVisible, getAddedPoints, getChannelKey, saveStatistics };
}