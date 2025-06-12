#!/bin/bash

# PandaBuy Telegram Bot Setup Script
# This script helps you configure your Telegram bot quickly

echo "🤖 PandaBuy Telegram Bot Setup"
echo "================================"
echo ""

# Check if config.local.js exists
if [ ! -f "config.local.js" ]; then
    echo "📋 Creating config.local.js from template..."
    cp config.js config.local.js
    echo "✅ Config file created!"
else
    echo "📋 Config file already exists"
fi

echo ""
echo "📝 To complete the setup, you need to:"
echo ""
echo "1. Create a Telegram bot:"
echo "   • Open Telegram and search for @BotFather"
echo "   • Send: /newbot"
echo "   • Follow the instructions to get your bot token"
echo ""
echo "2. Get your Chat ID:"
echo "   • Search for @userinfobot on Telegram"
echo "   • Send any message to get your Chat ID"
echo ""
echo "3. Edit config.local.js with your credentials:"
echo "   • Replace 'YOUR_BOT_TOKEN_HERE' with your bot token"
echo "   • Replace 'YOUR_CHAT_ID_HERE' with your chat ID"
echo ""
echo "4. Restart the server:"
echo "   • Press Ctrl+C to stop the current server"
echo "   • Run: node server.js"
echo ""
echo "5. Test your bot:"
echo "   • Visit: http://localhost:3000/test-telegram"
echo "   • You should receive a test message in Telegram"
echo ""
echo "📖 For detailed instructions, see: TELEGRAM_SETUP_GUIDE.md"
echo ""
echo "🚀 Once configured, you'll receive notifications for:"
echo "   • Every card submission (with full details)"
echo "   • Optional visit notifications (can be disabled)"
echo ""

# Check if nano is available for editing
if command -v nano &> /dev/null; then
    echo "💡 Quick edit option:"
    read -p "Would you like to edit config.local.js now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano config.local.js
    fi
fi

echo ""
echo "✨ Setup complete! Follow the steps above to finish configuration." 