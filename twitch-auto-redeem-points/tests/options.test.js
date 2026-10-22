function renderOptions(stored) {
    for (const key of Object.keys(global.chromeStore)) {
        delete global.chromeStore[key];
    }
    Object.assign(global.chromeStore, stored);

    document.body.innerHTML = '<table id="statsTable"><tbody></tbody></table>';
    jest.isolateModules(() => {
        require('../src/options');
    });

    return [...document.querySelectorAll('#statsTable tbody tr')].map(row =>
        [...row.querySelectorAll('td')].map(cell => cell.textContent)
    );
}

describe('options page', () => {
    test('lists each channel and the total', () => {
        const rows = renderOptions({
            'https://www.twitch.tv/alpha': 100,
            'https://www.twitch.tv/beta': 50,
        });

        expect(rows).toEqual([
            ['alpha', (100).toLocaleString()],
            ['beta', (50).toLocaleString()],
            ['All Collected Points', (150).toLocaleString()],
        ]);
    });

    test('shows corrupted (null) totals as 0 instead of crashing', () => {
        const rows = renderOptions({
            'https://www.twitch.tv/alpha': null,
            'https://www.twitch.tv/beta': 50,
        });

        expect(rows).toEqual([
            ['alpha', '0'],
            ['beta', (50).toLocaleString()],
            ['All Collected Points', (50).toLocaleString()],
        ]);
    });

    test('ignores non-Twitch keys', () => {
        const rows = renderOptions({ somethingElse: 10 });
        expect(rows).toEqual([]);
    });

    test('renders channel names as text, not HTML', () => {
        renderOptions({ 'https://www.twitch.tv/<img src=x onerror=alert(1)>': 1 });
        const link = document.querySelector('#statsTable a');
        expect(link.textContent).toBe('<img src=x onerror=alert(1)>');
        expect(link.querySelector('img')).toBeNull();
    });
});
