// Mock MutationObserver so tests can fire the callback by hand
global.MutationObserver = class MutationObserver {
    constructor(callback) {
        this.callback = callback;
        global.MutationObserver.instances.push(this);
    }
    observe() {}
    disconnect() {}
};
global.MutationObserver.instances = [];

// jsdom has no layout, so offsetParent is always null. Treat elements with the
// `hidden` attribute (or a hidden ancestor) as detached from layout.
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
        return this.closest('[hidden]') ? null : this.parentElement;
    },
});

// In-memory chrome.storage.sync supporting both the promise and callback styles
global.chromeStore = {};
global.chrome = {
    storage: {
        sync: {
            get: jest.fn((key, callback) => {
                let result;
                if (key == null) {
                    result = { ...global.chromeStore };
                } else {
                    result = key in global.chromeStore ? { [key]: global.chromeStore[key] } : {};
                }
                if (callback) {
                    callback(result);
                    return undefined;
                }
                return Promise.resolve(result);
            }),
            set: jest.fn((items) => {
                Object.assign(global.chromeStore, items);
                return Promise.resolve();
            }),
        },
    },
};

jest.useFakeTimers();
