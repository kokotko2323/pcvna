// Basic cloaking and anti-detection
(function() {
    'use strict';
    
    // Check for common bot user agents
    const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /google/i, /bing/i, /yahoo/i, /facebook/i,
        /twitter/i, /linkedin/i, /pinterest/i,
        /headless/i, /phantom/i, /selenium/i,
        /webdriver/i, /automation/i, /test/i
    ];
    
    const userAgent = navigator.userAgent;
    const isBot = botPatterns.some(pattern => pattern.test(userAgent));
    
    // Check for headless browser indicators
    const isHeadless = (
        !window.outerHeight ||
        !window.outerWidth ||
        navigator.webdriver ||
        window.navigator.webdriver ||
        window.callPhantom ||
        window._phantom ||
        window.phantom
    );
    
    // Check for automation tools
    const hasAutomationTools = (
        window.selenium ||
        window.webdriver ||
        document.$cdc_asdjflasutopfhvcZLmcfl_ ||
        navigator.webdriver
    );
    
    // Simple visitor verification
    if (isBot || isHeadless || hasAutomationTools) {
        // Redirect bots to legitimate looking page
        if (Math.random() > 0.5) {
            window.location.href = 'https://www.pandabuy.com';
        } else {
            document.body.innerHTML = '<h1>Site Under Maintenance</h1><p>Please try again later.</p>';
        }
        return;
    }
    
    // Basic session verification
    if (!sessionStorage.getItem('visitor_verified')) {
        sessionStorage.setItem('visitor_verified', 'true');
        sessionStorage.setItem('visit_time', Date.now());
    }
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Basic dev tools detection
    let devtools = {
        open: false,
        orientation: null
    };
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
            if (!devtools.open) {
                devtools.open = true;
                // Could redirect or take action here
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
})(); 