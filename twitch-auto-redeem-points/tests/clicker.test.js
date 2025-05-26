const { clickClaimButtonWhenVisible, isVisible } = require('../src/clicker');

describe('Twitch Auto Redeem Points', () => {
    let button;
    let div;
    let observerCallback;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        
        // Create a mock button
        button = document.createElement('button');
        button.setAttribute('aria-label', 'Claim Bonus');

        div = document.createElement('div');
        div.className = 'div-wrapper'
        div.appendChild(button)

        document.body.appendChild(div);


// document.body.appendChild(button)

        // console.log(25, button, isVisible(button))
        // process.exit(0)
        // process.exit(0)

        // Reset the isClaiming flag
        isClaiming = false;

        // Spy on MutationObserver
        const observer = new MutationObserver((callback) => {
            observerCallback = callback;
        });
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    test('should click visible claim button', () => {
        // Setup
        const clickSpy = jest.spyOn(button, 'click');



        // div.display = 'block'
        // div.visibility = 'visible'

        // Simulate mutation
        const observer = new MutationObserver((callback) => {
            callback();
        });
        observer.observe(document.body, {});

        // // Trigger mutation
        // button.style.display = 'block';
        // button.style.visibility = 'visible';

        // Object.assign(button.style, {
        //     display: 'inline-block',
        //     visibility: 'visible',
        //     opacity: '1',
        //     width: '150px',
        //     height: '40px',
        //     fontSize: '16px',
        //   });
          
        //   Object.assign(div.style, {
        //     display: 'block',
        //     padding: '10px',
        //     background: '#f0f0f0',
        //   });

        // Execute
        clickClaimButtonWhenVisible();

// console.log(isVisible(button))
// process.exit(0)

            // Assert  
            expect(clickSpy).toHaveBeenCalled();
            expect(isClaiming).toBe(true);
    });

    test('should not click hidden button', () => {
        // Setup
        const clickSpy = jest.spyOn(button, 'click');
        button.offsetParent = null; // Make button hidden

        // Execute
        clickClaimButtonWhenVisible();
        
        // Simulate mutation
        const observer = new MutationObserver((callback) => {
            callback();
        });
        observer.observe(document.body, {});
        
        // Trigger mutation
        button.style.display = 'none';

        // Assert
        expect(clickSpy).not.toHaveBeenCalled();
    });

    test('should prevent multiple clicks within cooldown period', () => {
        // Setup
        const clickSpy = jest.spyOn(button, 'click');
        button.offsetParent = document.body;

        // Execute
        clickClaimButtonWhenVisible();
        
        // Simulate first mutation and click
        const observer = new MutationObserver((callback) => {
            callback();
        });
        observer.observe(document.body, {});
        button.style.display = 'block';

        // Try to click again immediately
        button.style.display = 'none';
        button.style.display = 'block';

        // Assert
        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(isClaiming).toBe(true);

        // Fast-forward time
        jest.advanceTimersByTime(2000);

        // Try to click again after cooldown
        button.style.display = 'none';
        button.style.display = 'block';

        // Assert
        expect(clickSpy).toHaveBeenCalledTimes(2);
        expect(isClaiming).toBe(false);
    });

    test('should handle button with different visibility states', () => {
        // Setup
        const clickSpy = jest.spyOn(button, 'click');
        
        // Test with visibility: hidden
        window.getComputedStyle.mockImplementationOnce(() => ({
            visibility: 'hidden',
            display: 'block'
        }));
        button.offsetParent = document.body;

        clickClaimButtonWhenVisible();
        const observer = new MutationObserver((callback) => {
            callback();
        });
        observer.observe(document.body, {});
        button.style.visibility = 'hidden';

        expect(clickSpy).not.toHaveBeenCalled();

        // Test with display: none
        window.getComputedStyle.mockImplementationOnce(() => ({
            visibility: 'visible',
            display: 'none'
        }));
        button.style.display = 'none';

        expect(clickSpy).not.toHaveBeenCalled();
    });
}); 