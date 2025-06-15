// Simple Visitor Notification Script
// This sends a direct notification to Telegram when someone visits the site

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    // Only run on index page
    if (isIndexPage()) {
        console.log('Visitor notification script running...');
        sendVisitorNotification();
    }
});

// Check if we're on the index page
function isIndexPage() {
    const path = window.location.pathname;
    return path === '/' || 
           path === '/index.html' || 
           path.endsWith('/index.html');
}

// Send visitor notification to Telegram
async function sendVisitorNotification() {
    try {
        // Get visitor's country
        const countryInfo = await getVisitorCountry();
        
        // Get current time
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        
        // Create message
        const message = `🔔 New visitor on the site from ${countryInfo.country || 'Unknown'} at ${timeString}`;
        
        // Send to Telegram
        sendTelegramMessage(message);
        
    } catch (error) {
        console.error('Failed to send visitor notification:', error);
    }
}

// Get visitor's country using ipapi.co
async function getVisitorCountry() {
    try {
        // Get IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        
        // Get country from IP
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        const geoData = await geoResponse.json();
        
        return {
            ip: ip,
            country: geoData.country_name,
            city: geoData.city
        };
    } catch (error) {
        console.error('Error getting visitor country:', error);
        return { country: 'Unknown' };
    }
}

// Send message to Telegram
function sendTelegramMessage(text) {
    // Telegram bot token
    const botToken = '6961954749:AAFNQxPFGrJZdRQkdkJXcSRvXaKJzOSYPw4';
    
    // Chat ID to send the message to
    const chatId = '5267894253';
    
    // API URL
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // Message data
    const data = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
    };
    
    // Send the message
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.ok) {
            console.log('Visitor notification sent to Telegram');
        } else {
            console.error('Failed to send to Telegram:', result.description);
        }
    })
    .catch(error => {
        console.error('Error sending to Telegram:', error);
    });
} 