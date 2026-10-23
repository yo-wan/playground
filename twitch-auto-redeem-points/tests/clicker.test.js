// Load a fresh copy of clicker.js so module state (isClaiming) doesn't leak between tests
function loadClicker() {
    let clicker;
    jest.isolateModules(() => {
        clicker = require('../src/clicker');
    });
    return clicker;
}

function latestObserver() {
    const instances = global.MutationObserver.instances;
    return instances[instances.length - 1];
}

async function flushPromises() {
    for (let i = 0; i < 10; i++) {
        await Promise.resolve();
    }
}

function setPath(path) {
    window.history.pushState({}, '', path);
}

function addClaimButton() {
    const wrapper = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Claim Bonus');
    wrapper.appendChild(button);
    document.body.appendChild(wrapper);
    return button;
}

function addPointsLabel(text) {
    const label = document.createElement('span');
    label.className = 'community-points-summary__points-add-text';
    label.textContent = text;
    document.body.appendChild(label);
    return label;
}

beforeEach(() => {
    document.body.innerHTML = '';
    global.MutationObserver.instances = [];
    for (const key of Object.keys(global.chromeStore)) {
        delete global.chromeStore[key];
    }
    jest.clearAllMocks();
    jest.clearAllTimers();
    setPath('/somechannel');
});

describe('isVisible', () => {
    let isVisible;

    beforeEach(() => {
        ({ isVisible } = loadClicker());
    });

    test('returns true for a rendered element', () => {
        expect(isVisible(addClaimButton())).toBe(true);
    });

    test('returns false when display is none', () => {
        const button = addClaimButton();
        button.style.display = 'none';
        expect(isVisible(button)).toBe(false);
    });

    test('returns false when visibility is hidden', () => {
        const button = addClaimButton();
        button.style.visibility = 'hidden';
        expect(isVisible(button)).toBe(false);
    });

    test('returns false when not laid out (no offsetParent)', () => {
        const button = addClaimButton();
        button.parentElement.hidden = true;
        expect(isVisible(button)).toBe(false);
    });
});

describe('getChannelKey', () => {
    let getChannelKey;

    beforeEach(() => {
        ({ getChannelKey } = loadClicker());
    });

    test.each([
        ['/SomeChannel', 'https://www.twitch.tv/somechannel'],
        ['/somechannel?referrer=raid', 'https://www.twitch.tv/somechannel'],
        ['/somechannel/videos', 'https://www.twitch.tv/somechannel'],
        ['/popout/somechannel/chat', 'https://www.twitch.tv/somechannel'],
        ['/moderator/somechannel', 'https://www.twitch.tv/somechannel'],
        ['/embed/somechannel/chat', 'https://www.twitch.tv/somechannel'],
    ])('%s -> %s', (path, expected) => {
        setPath(path);
        expect(getChannelKey()).toBe(expected);
    });

    test('returns null on the home page', () => {
        setPath('/');
        expect(getChannelKey()).toBeNull();
    });
});

describe('readAddedPoints', () => {
    let readAddedPoints;

    beforeEach(() => {
        ({ readAddedPoints } = loadClicker());
    });

    test('parses the "+N" label', () => {
        addPointsLabel('+50');
        expect(readAddedPoints()).toBe(50);
    });

    test('parses labels with thousands separators', () => {
        addPointsLabel('+1,000');
        expect(readAddedPoints()).toBe(1000);
    });

    test('returns 0 when there is no label', () => {
        expect(readAddedPoints()).toBe(0);
    });
});

describe('saveStatistics', () => {
    const key = 'https://www.twitch.tv/somechannel';
    let saveStatistics;

    beforeEach(() => {
        ({ saveStatistics } = loadClicker());
    });

    test('stores points for a channel with no saved total', async () => {
        await saveStatistics(key, 50);
        expect(global.chromeStore[key]).toBe(50);
    });

    test('adds to an existing total', async () => {
        global.chromeStore[key] = 100;
        await saveStatistics(key, 50);
        expect(global.chromeStore[key]).toBe(150);
    });

    test('recovers from a corrupted (null) total', async () => {
        global.chromeStore[key] = null;
        await saveStatistics(key, 50);
        expect(global.chromeStore[key]).toBe(50);
    });

    test('keeps channels separate', async () => {
        await saveStatistics('https://www.twitch.tv/alpha', 50);
        await saveStatistics('https://www.twitch.tv/beta', 60);
        expect(global.chromeStore).toEqual({
            'https://www.twitch.tv/alpha': 50,
            'https://www.twitch.tv/beta': 60,
        });
    });

    test('does not save without a channel or points', async () => {
        await saveStatistics(null, 50);
        await saveStatistics(key, 0);
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });
});

describe('claim button observer', () => {
    const key = 'https://www.twitch.tv/somechannel';

    test('clicks a visible claim button and records the points once the label appears', async () => {
        loadClicker();
        const button = addClaimButton();
        const clickSpy = jest.spyOn(button, 'click');

        latestObserver().callback();
        expect(clickSpy).toHaveBeenCalledTimes(1);

        // Twitch renders the label after the claim request completes
        addPointsLabel('+50');
        latestObserver().callback();
        await flushPromises();

        expect(global.chromeStore[key]).toBe(50);
    });

    test('records points without relying on timers (background tabs)', async () => {
        loadClicker();
        addClaimButton();

        latestObserver().callback();
        addPointsLabel('+50');
        latestObserver().callback();
        await flushPromises();

        // No timers were advanced, yet the claim was saved
        expect(global.chromeStore[key]).toBe(50);
    });

    test('saves under the channel that was open when the bonus was clicked', async () => {
        setPath('/popout/SomeChannel/chat');
        loadClicker();
        addClaimButton();

        latestObserver().callback();
        setPath('/otherchannel');
        addPointsLabel('+50');
        latestObserver().callback();
        await flushPromises();

        expect(global.chromeStore).toEqual({ [key]: 50 });
    });

    test('ignores a hidden claim button', () => {
        loadClicker();
        const button = addClaimButton();
        button.style.display = 'none';
        const clickSpy = jest.spyOn(button, 'click');

        latestObserver().callback();

        expect(clickSpy).not.toHaveBeenCalled();
    });

    test('does nothing when there is no claim button', () => {
        loadClicker();
        expect(() => latestObserver().callback()).not.toThrow();
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });

    test('does not click again while waiting for the label', () => {
        loadClicker();
        const button = addClaimButton();
        const clickSpy = jest.spyOn(button, 'click');

        latestObserver().callback();
        latestObserver().callback();

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    test('can claim again after the points are saved', async () => {
        loadClicker();
        const button = addClaimButton();
        const clickSpy = jest.spyOn(button, 'click');

        latestObserver().callback();
        const label = addPointsLabel('+50');
        latestObserver().callback();
        await flushPromises();
        label.remove();

        latestObserver().callback();
        expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    test('gives up waiting for the label after the timeout', () => {
        loadClicker();
        const button = addClaimButton();
        const clickSpy = jest.spyOn(button, 'click');

        latestObserver().callback();
        jest.setSystemTime(Date.now() + 31000);
        latestObserver().callback(); // expires the pending claim
        latestObserver().callback(); // clicks again

        expect(clickSpy).toHaveBeenCalledTimes(2);
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });
});
