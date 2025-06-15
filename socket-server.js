// Socket.IO Server for Real-time Visitor Tracking
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '6961954749:AAFNQxPFGrJZdRQkdkJXcSRvXaKJzOSYPw4';
const TELEGRAM_CHAT_ID = '5267894253';

// Function to send message to Telegram
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        if (result.ok) {
            console.log('✅ Telegram notification sent successfully');
        } else {
            console.error('❌ Failed to send Telegram notification:', result.description);
        }
    } catch (error) {
        console.error('❌ Error sending Telegram message:', error);
    }
}

// Function to get country from IP
async function getCountryFromIP(ip) {
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        return {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting country from IP:', error);
        return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);
    
    // Handle visitor tracking
    socket.on('visitor', async (data) => {
        try {
            console.log('👁️ New visitor detected:', data);
            
            // Get visitor's IP address
            const clientIP = socket.handshake.address || 
                           socket.handshake.headers['x-forwarded-for'] || 
                           socket.handshake.headers['x-real-ip'] || 
                           data.ip || 
                           'Unknown';
            
            console.log('🌐 Visitor IP:', clientIP);
            
            // Get country information
            const locationInfo = await getCountryFromIP(clientIP);
            
            // Get current time
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString();
            
            // Create notification message
            const message = `🔔 <b>NEW VISITOR ON SITE!</b>

🌍 <b>Location:</b> ${locationInfo.country}
🏙️ <b>City:</b> ${locationInfo.city}
🕐 <b>Time:</b> ${timeString}
📅 <b>Date:</b> ${dateString}
🌐 <b>IP:</b> ${clientIP}
📱 <b>Device:</b> ${data.device || 'Unknown'}
🌐 <b>Browser:</b> ${data.browser || 'Unknown'}`;

            // Send notification to Telegram
            await sendTelegramMessage(message);
            
            // Emit confirmation back to client
            socket.emit('notification-sent', {
                success: true,
                country: locationInfo.country,
                time: timeString
            });
            
        } catch (error) {
            console.error('❌ Error processing visitor:', error);
            socket.emit('notification-sent', {
                success: false,
                error: error.message
            });
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected:', socket.id);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        connections: io.engine.clientsCount
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
    console.log(`📱 Telegram notifications enabled`);
    console.log(`🔗 Connect clients to: http://localhost:${PORT}`);
}); 