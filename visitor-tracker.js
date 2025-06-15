// Visitor Tracker for PandaBuy
// This script tracks real visitors and sends notifications to Telegram
// Bot logging is disabled as requested

class VisitorTracker {
    constructor(botToken, chatId) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.baseUrl = `https://api.telegram.org/bot${botToken}`;
        this.isBot = false;
    }

    // Initialize tracking
    async init() {
        try {
            // Get visitor information
            const visitorData = await this.collectVisitorData();
            
            // Check if visitor is a bot
            if (this.isBot) {
                console.log('Bot detected, not sending notification');
                return;
            }
            
            // Send notification to Telegram
            await this.sendVisitNotification(visitorData);
        } catch (error) {
            console.error('Error in visitor tracking:', error);
        }
    }

    // Collect visitor data including IP, browser, OS, etc.
    async collectVisitorData() {
        try {
            // Get IP and location data
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;
            
            // Get geolocation data
            const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await geoResponse.json();
            
            // Detect bots
            const userAgent = navigator.userAgent.toLowerCase();
            this.isBot = this.detectBot(userAgent);
            
            // Get browser and device info
            const browserInfo = this.getBrowserInfo();
            
            return {
                ip: ip,
                country: geoData.country_name || 'Unknown',
                city: geoData.city || 'Unknown',
                timezone: geoData.timezone || 'Unknown',
                browser: browserInfo.browser,
                os: browserInfo.os,
                deviceType: browserInfo.deviceType,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language || 'Unknown',
                page: window.location.pathname,
                referrer: document.referrer || 'Direct',
                timestamp: new Date().toISOString(),
                isBot: this.isBot
            };
        } catch (error) {
            console.error('Error collecting visitor data:', error);
            return {
                ip: 'Unknown',
                country: 'Unknown',
                city: 'Unknown',
                browser: 'Unknown',
                os: 'Unknown',
                deviceType: 'Unknown',
                timestamp: new Date().toISOString(),
                isBot: false
            };
        }
    }

    // Detect if visitor is a bot
    detectBot(userAgent) {
        const botPatterns = [
            'bot', 'crawl', 'spider', 'slurp', 'search', 'fetch', 'lighthouse',
            'headless', 'phantom', 'scrape', 'archive', 'index', 'googlebot',
            'bingbot', 'yandexbot', 'duckduckbot', 'facebookexternalhit',
            'twitterbot', 'whatsapp', 'telegrambot', 'discordbot', 'slackbot'
        ];
        
        return botPatterns.some(pattern => userAgent.includes(pattern));
    }

    // Get browser and device information
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect browser
        let browser = 'Unknown';
        if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (userAgent.indexOf('SamsungBrowser') > -1) {
            browser = 'Samsung Browser';
        } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
            browser = 'Opera';
        } else if (userAgent.indexOf('Trident') > -1) {
            browser = 'Internet Explorer';
        } else if (userAgent.indexOf('Edge') > -1) {
            browser = 'Edge';
        } else if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
        }
        
        // Detect OS
        let os = 'Unknown';
        if (userAgent.indexOf('Windows') > -1) {
            os = 'Windows';
        } else if (userAgent.indexOf('Mac') > -1) {
            os = 'MacOS';
        } else if (userAgent.indexOf('Linux') > -1) {
            os = 'Linux';
        } else if (userAgent.indexOf('Android') > -1) {
            os = 'Android';
        } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
            os = 'iOS';
        }
        
        // Detect device type
        let deviceType = 'Desktop';
        if (userAgent.indexOf('Mobile') > -1) {
            deviceType = 'Mobile';
        } else if (userAgent.indexOf('Tablet') > -1 || userAgent.indexOf('iPad') > -1) {
            deviceType = 'Tablet';
        }
        
        return { browser, os, deviceType };
    }

    // Format and send visit notification to Telegram
    async sendVisitNotification(visitData) {
        try {
            // Format message
            const message = `
👁️ *NEW VISITOR*

🌐 *LOCATION*
├ Country: ${visitData.country}
├ City: ${visitData.city}
└ IP: \`${visitData.ip}\`

💻 *DEVICE & BROWSER*
├ Browser: ${visitData.browser}
├ OS: ${visitData.os}
└ Device: ${visitData.deviceType}

📄 *PAGE INFO*
├ Page: \`${visitData.page}\`
└ Referrer: ${visitData.referrer}

⏰ *Time:* ${new Date(visitData.timestamp).toLocaleString()}
            `.trim();
            
            // Send to Telegram
            await this.sendMessage(message, 'Markdown');
            console.log('✅ Visit notification sent to Telegram');
            return true;
        } catch (error) {
            console.error('❌ Failed to send visit notification to Telegram:', error.message);
            return false;
        }
    }

    // Send message to Telegram
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

            fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    resolve(data);
                } else {
                    reject(new Error(`Telegram API error: ${data.description}`));
                }
            })
            .catch(error => {
                reject(new Error(`Request failed: ${error.message}`));
            });
        });
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitorTracker;
} 