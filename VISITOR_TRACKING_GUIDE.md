# Visitor Tracking Setup Guide

This guide will help you set up the visitor tracking system that sends notifications to Telegram when real users visit your website.

## Prerequisites

1. A Telegram account
2. Access to the FakePanda website files

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat with BotFather and send the command `/newbot`
3. Follow the instructions to create a new bot:
   - Enter a name for your bot (e.g., "PandaBuy Visitor Tracker")
   - Enter a username for your bot (must end with "bot", e.g., "pandabuy_visitor_bot")
4. Once created, BotFather will give you a **bot token**. It looks like this: `123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ`
5. **Save this token** - you'll need it for configuration

## Step 2: Get Your Chat ID

1. Start a chat with your newly created bot
2. Send any message to your bot (e.g., "hello")
3. Open a browser and visit this URL (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for the `"chat":{"id":` value in the response. This number is your **chat ID**
5. If you don't see any response, try sending another message to your bot and refresh the page

## Step 3: Configure the Website

1. Open the `telegram-config.js` file
2. Replace the placeholder values with your actual bot token and chat ID:
   ```javascript
   const TELEGRAM_CONFIG = {
       // Your Telegram bot token (from BotFather)
       BOT_TOKEN: "YOUR_BOT_TOKEN_HERE",
       
       // Your Telegram chat ID (where notifications will be sent)
       CHAT_ID: "YOUR_CHAT_ID_HERE",
       
       // Feature toggles
       FEATURES: {
           // Enable visitor tracking notifications
           VISITOR_TRACKING: true,
           
           // Ignore bots (set to true to only track real visitors)
           IGNORE_BOTS: true
       }
   };
   ```
3. Save the file

## Step 4: Test the Configuration

1. Upload the updated files to your server
2. Visit your website from a different device or network
3. You should receive a notification in Telegram with details about the visitor:
   - Country and city
   - Browser and OS information
   - Page visited
   - Referrer information

## Customization Options

### Disable Bot Detection

If you want to receive notifications for all visitors including bots:

```javascript
FEATURES: {
    VISITOR_TRACKING: true,
    IGNORE_BOTS: false  // Set to false to track all visitors
}
```

### Customize Notification Format

To change how the notifications look, edit the `formatVisitMessage` method in `visitor-tracker.js`.

## Troubleshooting

1. **No notifications received:**
   - Check that your bot token and chat ID are correct
   - Make sure you've started a conversation with your bot
   - Check browser console for any JavaScript errors

2. **Getting notifications for bots:**
   - Make sure `IGNORE_BOTS` is set to `true`
   - The bot detection may not catch all types of bots

3. **Missing location information:**
   - Some visitors may have location services disabled
   - Some networks block IP geolocation services

## Security Notes

- The bot token gives control over your bot, so keep it secure
- The visitor tracking only collects basic information like IP, browser, and OS
- All tracking is done client-side and requires JavaScript to be enabled 