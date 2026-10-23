let isClaiming = false;
// Set when the bonus was clicked and we're waiting for Twitch to show the "+N" label
let pendingClaim = null;

// How long to wait for the "+N" label after a click before giving up
const PENDING_CLAIM_TIMEOUT_MS = 30000;

function clickClaimButtonWhenVisible() {
    const observer = new MutationObserver(() => {
		// Use DOM mutations rather than timers to spot the label: background tabs
		// throttle timers to once a second (or once a minute), so polling missed it
		if (pendingClaim) {
			collectPendingClaim();
			return;
		}

		const button = document.querySelector("[aria-label^='Claim Bonus']");
		if (button && isVisible(button) && !isClaiming) {
			isClaiming = true;

			// Remember the channel at click time in case the user navigates away
			pendingClaim = { key: getChannelKey(), expiresAt: Date.now() + PENDING_CLAIM_TIMEOUT_MS };
			button.click();
		}
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
}

function collectPendingClaim() {
	const addedPoints = readAddedPoints();
	if (addedPoints > 0) {
		const { key } = pendingClaim;
		pendingClaim = null;
		saveStatistics(key, addedPoints)
			.catch(error => console.log(error))
			.finally(() => {
				isClaiming = false;
			});
	} else if (Date.now() > pendingClaim.expiresAt) {
		pendingClaim = null;
		isClaiming = false;
	}
}
  
function isVisible(el) {
	const style = window.getComputedStyle(el);
	return el.offsetParent !== null && style.visibility !== "hidden" && style.display !== "none";
}

// Twitch shows a "+50" style label next to the balance for a few seconds after a claim
function readAddedPoints() {
	const el = document.querySelector('.community-points-summary__points-add-text');
	return el ? Number(el.textContent.replace(/[^\d]/g, '')) : 0;
}

// Normalize the page URL to https://www.twitch.tv/<channel> so query strings,
// sub-pages (/videos, /about) and popout chat all count towards the same channel
function getChannelKey() {
	const segments = location.pathname.split('/').filter(Boolean);
	const channel = ['popout', 'moderator', 'embed'].includes(segments[0]) ? segments[1] : segments[0];
	return channel ? `https://www.twitch.tv/${channel.toLowerCase()}` : null;
}

async function saveStatistics(key, addedPoints) {
	if (!key || !addedPoints) {
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
	module.exports = { clickClaimButtonWhenVisible, isVisible, readAddedPoints, getChannelKey, saveStatistics };
}