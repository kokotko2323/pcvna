# Socket.IO Real-time Visitor Tracking Setup

This guide explains how to set up the Socket.IO-based real-time visitor tracking system that sends instant notifications to your Telegram bot.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `socket.io` - Real-time bidirectional event-based communication
- `express` - Web framework for Node.js
- `cors` - Cross-Origin Resource Sharing middleware
- `node-fetch` - Fetch API for Node.js

### 2. Start the Socket.IO Server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

The server will run on `http://localhost:3000`

### 3. Update Client Configuration

In `socket-visitor-tracker.js`, update the server URL if needed:

```javascript
// Change this to your deployed server URL
const tracker = new SocketVisitorTracker('http://localhost:3000');
```

## 📡 How It Works

### Server Side (`socket-server.js`)
- Runs an Express server with Socket.IO
- Listens for visitor connections
- Receives visitor data from clients
- Gets country information from IP addresses
- Sends formatted notifications to Telegram

### Client Side (`socket-visitor-tracker.js`)
- Loads Socket.IO client library automatically
- Connects to the server when someone visits index.html
- Collects visitor information (IP, browser, device, etc.)
- Sends data to server via Socket.IO

### Real-time Flow
1. User visits your website (index.html)
2. Client script connects to Socket.IO server
3. Visitor data is collected and sent to server
4. Server gets country from IP address
5. Formatted notification is sent to Telegram
6. You receive instant notification: "🔔 NEW VISITOR ON SITE!"

## 🔧 Configuration

### Telegram Settings
The system is pre-configured with your Telegram bot:
- **Bot Token:** `6961954749:AAFNQxPFGrJZdRQkdkJXcSRvXaKJzOSYPw4`
- **Chat ID:** `5267894253`

### Server Configuration
You can modify these settings in `socket-server.js`:
- Port (default: 3000)
- CORS settings
- Telegram bot credentials

## 🧪 Testing

### Local Testing
1. Start the server: `npm start`
2. Open `test-socket-tracking.html` in your browser
3. Click "Connect to Server" and "Send Visitor Data"
4. Check your Telegram for notifications

### Live Testing
1. Deploy the Socket.IO server to a hosting service
2. Update the server URL in `socket-visitor-tracker.js`
3. Visit your website's index page
4. You should receive a Telegram notification

## 🌐 Deployment Options

### Railway
```bash
# Deploy to Railway
railway login
railway init
railway up
```

### Heroku
```bash
# Deploy to Heroku
heroku create your-app-name
git push heroku main
```

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set run command: `npm start`

### Vercel (Serverless)
Note: Socket.IO requires persistent connections, so traditional serverless platforms may not work well. Consider using Vercel's Edge Functions or Railway/Heroku instead.

## 📱 Notification Format

When someone visits your site, you'll receive a Telegram message like:

```
🔔 NEW VISITOR ON SITE!

🌍 Location: United States
🏙️ City: New York
🕐 Time: 3:45:22 PM
📅 Date: 12/20/2024
🌐 IP: 192.168.1.1
📱 Device: Desktop
🌐 Browser: Chrome
```

## 🔍 Troubleshooting

### Connection Issues
- Make sure the Socket.IO server is running
- Check that port 3000 is not blocked
- Verify CORS settings if hosting on different domains

### No Notifications
- Verify Telegram bot token and chat ID
- Check server logs for errors
- Test with the test page first

### Performance
- The system is lightweight and handles multiple concurrent visitors
- Socket.IO automatically falls back to polling if WebSocket fails
- Server logs all connections and notifications

## 🔒 Security Notes

- The system only collects basic visitor information
- IP addresses are used only for geolocation
- No personal data is stored permanently
- All communication is over HTTPS when deployed

## 📊 Features

- ✅ Real-time notifications via Socket.IO
- ✅ Country detection from IP address
- ✅ Browser and device information
- ✅ Automatic fallback to HTTP polling
- ✅ Only tracks index.html visits
- ✅ Detailed logging and error handling
- ✅ Test page for debugging

## 🆚 Socket.IO vs Simple HTTP

**Socket.IO Advantages:**
- Real-time bidirectional communication
- Automatic reconnection
- Fallback to HTTP polling
- Better for live tracking

**Simple HTTP Advantages:**
- No server required
- Works on static hosting
- Simpler setup

Choose Socket.IO for real-time tracking with a server, or the simple HTTP method for static hosting. 