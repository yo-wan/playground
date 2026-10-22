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

describe('getAddedPoints', () => {
    let getAddedPoints;

    beforeEach(() => {
        ({ getAddedPoints } = loadClicker());
    });

    test('parses the "+N" label', async () => {
        addPointsLabel('+50');
        await expect(getAddedPoints()).resolves.toBe(50);
    });

    test('parses labels with thousands separators', async () => {
        addPointsLabel('+1,000');
        await expect(getAddedPoints()).resolves.toBe(1000);
    });

    test('waits for the label to appear', async () => {
        const promise = getAddedPoints();
        await jest.advanceTimersByTimeAsync(600);
        addPointsLabel('+60');
        await jest.advanceTimersByTimeAsync(300);
        await expect(promise).resolves.toBe(60);
    });

    test('returns 0 if the label never appears', async () => {
        const promise = getAddedPoints();
        await jest.advanceTimersByTimeAsync(3000);
        await expect(promise).resolves.toBe(0);
    });
});

describe('saveStatistics', () => {
    const key = 'https://www.twitch.tv/somechannel';
    let saveStatistics;

    beforeEach(() => {
        ({ saveStatistics } = loadClicker());
    });

    test('stores points for a channel with no saved total', async () => {
        addPointsLabel('+50');
        await saveStatistics();
        expect(global.chromeStore[key]).toBe(50);
    });

    test('adds to an existing total', async () => {
        global.chromeStore[key] = 100;
        addPointsLabel('+50');
        await saveStatistics();
        expect(global.chromeStore[key]).toBe(150);
    });

    test('recovers from a corrupted (null) total', async () => {
        global.chromeStore[key] = null;
        addPointsLabel('+50');
        await saveStatistics();
        expect(global.chromeStore[key]).toBe(50);
    });

    test('saves under the normalized channel key', async () => {
        setPath('/popout/SomeChannel/chat?x=1');
        addPointsLabel('+50');
        await saveStatistics();
        expect(global.chromeStore).toEqual({ [key]: 50 });
    });

    test('does not save when no points label is found', async () => {
        const promise = saveStatistics();
        await jest.advanceTimersByTimeAsync(3000);
        await promise;
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });

    test('does not save outside a channel page', async () => {
        setPath('/');
        addPointsLabel('+50');
        await saveStatistics();
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });
});

describe('claim button observer', () => {
    test('clicks a visible claim button and records the points', async () => {
        loadClicker();
        const button = addClaimButton();
        const clickSpy = jest.spyOn(button, 'click');
        addPointsLabel('+50');

        latestObserver().callback();
        await flushPromises();

        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(global.chromeStore['https://www.twitch.tv/somechannel']).toBe(50);
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

    test('does not click again while a claim is being saved', async () => {
        loadClicker();
        const button = addClaimButton();
        const clickSpy = jest.spyOn(button, 'click');

        // No label yet, so saveStatistics keeps retrying
        latestObserver().callback();
        latestObserver().callback();
        expect(clickSpy).toHaveBeenCalledTimes(1);

        // Once the save gives up, the next mutation can claim again
        await jest.advanceTimersByTimeAsync(3000);
        await flushPromises();
        latestObserver().callback();
        expect(clickSpy).toHaveBeenCalledTimes(2);
    });
});
