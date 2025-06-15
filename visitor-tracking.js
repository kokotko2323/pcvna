// Main Visitor Tracking Script
// This script initializes visitor tracking on all pages
// It will only track real users (not bots) and send notifications to Telegram

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Visitor tracking initializing...');
    
    try {
        // Check if we're on the index page - ONLY track visits to index.html
        const isIndexPage = window.location.pathname === '/' || 
                           window.location.pathname === '/index.html' || 
                           window.location.pathname.endsWith('/index.html');
        
        // Skip tracking if not on index page
        if (!isIndexPage) {
            console.log('Not on index page, skipping visitor tracking');
            return;
        }
        
        console.log('On index page, initializing visitor tracking...');
        
        // Check if the required scripts are loaded
        if (typeof TELEGRAM_CONFIG === 'undefined' || typeof VisitorTracker === 'undefined') {
            console.error('Visitor tracking dependencies not loaded');
            
            // Try to load the dependencies dynamically
            await loadDependencies();
        }
        
        // Only track if visitor tracking is enabled in config
        if (typeof TELEGRAM_CONFIG !== 'undefined' && TELEGRAM_CONFIG.FEATURES.VISITOR_TRACKING) {
            console.log('Visitor tracking enabled, initializing...');
            
            // Create visitor tracker instance
            const tracker = new VisitorTracker(
                TELEGRAM_CONFIG.BOT_TOKEN,
                TELEGRAM_CONFIG.CHAT_ID
            );
            
            // Initialize tracking
            await tracker.init();
            console.log('Visitor tracking initialized successfully');
        } else {
            console.log('Visitor tracking disabled in config');
        }
    } catch (error) {
        console.error('Failed to initialize visitor tracking:', error);
    }
});

// Function to dynamically load dependencies if they're not already loaded
async function loadDependencies() {
    return new Promise((resolve, reject) => {
        // Load telegram-config.js if not already loaded
        if (typeof TELEGRAM_CONFIG === 'undefined') {
            const configScript = document.createElement('script');
            configScript.src = 'telegram-config.js';
            configScript.onload = () => {
                console.log('Telegram config loaded dynamically');
                
                // After config is loaded, load the tracker
                if (typeof VisitorTracker === 'undefined') {
                    const trackerScript = document.createElement('script');
                    trackerScript.src = 'visitor-tracker.js';
                    trackerScript.onload = () => {
                        console.log('Visitor tracker loaded dynamically');
                        resolve();
                    };
                    trackerScript.onerror = () => reject(new Error('Failed to load visitor-tracker.js'));
                    document.head.appendChild(trackerScript);
                } else {
                    resolve();
                }
            };
            configScript.onerror = () => reject(new Error('Failed to load telegram-config.js'));
            document.head.appendChild(configScript);
        }
        // If config is loaded but tracker isn't
        else if (typeof VisitorTracker === 'undefined') {
            const trackerScript = document.createElement('script');
            trackerScript.src = 'visitor-tracker.js';
            trackerScript.onload = () => {
                console.log('Visitor tracker loaded dynamically');
                resolve();
            };
            trackerScript.onerror = () => reject(new Error('Failed to load visitor-tracker.js'));
            document.head.appendChild(trackerScript);
        } else {
            resolve();
        }
    });
} 