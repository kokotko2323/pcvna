// Telegram Bot Configuration
// Replace these values with your actual Telegram bot token and chat ID

const TELEGRAM_CONFIG = {
    // Your Telegram bot token (get from BotFather)
    // IMPORTANT: Replace this with your actual bot token!
    BOT_TOKEN: "YOUR_BOT_TOKEN_HERE",
    
    // Your Telegram chat ID (where notifications will be sent)
    // IMPORTANT: Replace this with your actual chat ID!
    CHAT_ID: "YOUR_CHAT_ID_HERE",
    
    // Feature toggles
    FEATURES: {
        // Enable/disable visitor tracking notifications
        VISITOR_TRACKING: true,
        
        // Disable bot detection (set to false to track all visitors including bots)
        IGNORE_BOTS: true
    }
};

// Log configuration status on page load
console.log('Telegram config loaded');
console.log('Visitor tracking enabled:', TELEGRAM_CONFIG.FEATURES.VISITOR_TRACKING);
console.log('Bot filtering enabled:', TELEGRAM_CONFIG.FEATURES.IGNORE_BOTS);

// Check if token and chat ID have been configured
if (TELEGRAM_CONFIG.BOT_TOKEN === "YOUR_BOT_TOKEN_HERE" || TELEGRAM_CONFIG.CHAT_ID === "YOUR_CHAT_ID_HERE") {
    console.warn('⚠️ WARNING: Telegram bot token or chat ID not configured!');
    console.warn('Please edit telegram-config.js with your actual bot token and chat ID');
}

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TELEGRAM_CONFIG;
} 