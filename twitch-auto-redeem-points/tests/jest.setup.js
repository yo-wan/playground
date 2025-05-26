// Mock MutationObserver
global.MutationObserver = class MutationObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
};

// Mock window.getComputedStyle
window.getComputedStyle = jest.fn().mockImplementation(() => ({
    visibility: 'visible',
    display: 'block'
}));

// Mock setTimeout
jest.useFakeTimers(); 