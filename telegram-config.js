// Telegram Bot Configuration
// Replace these values with your actual Telegram bot token and chat ID

const TELEGRAM_CONFIG = {
    // Your Telegram bot token (get from BotFather)
    BOT_TOKEN: "YOUR_BOT_TOKEN_HERE",
    
    // Your Telegram chat ID (where notifications will be sent)
    CHAT_ID: "YOUR_CHAT_ID_HERE",
    
    // Feature toggles
    FEATURES: {
        // Enable/disable visitor tracking notifications
        VISITOR_TRACKING: true,
        
        // Disable bot detection (set to false to track all visitors including bots)
        IGNORE_BOTS: true
    }
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TELEGRAM_CONFIG;
} 