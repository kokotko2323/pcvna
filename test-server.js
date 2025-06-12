// Test script for the card collection server API
const fetch = require('node-fetch');

// Server URL (change if your server is running on a different port)
const SERVER_URL = 'http://localhost:3000/api/cards';

// Test data
const testCard = {
    cardNumber: '4111111111111111',
    cardName: 'Test User',
    expiration: '12/25',
    cvv: '123',
    email: 'test@example.com',
    timestamp: new Date().toISOString(),
    visitor: {
        userAgent: 'Test Script',
        ip: '127.0.0.1',
        device: 'Test Device'
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Helper function to log with color
function log(message, color = colors.reset) {
    console.log(color, message, colors.reset);
}

// Helper function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testGetCards() {
    log('Testing GET /api/cards...', colors.blue);
    
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        log(`✓ GET successful - Retrieved ${data.length} cards`, colors.green);
        return true;
    } catch (error) {
        log(`✗ GET failed: ${error.message}`, colors.red);
        return false;
    }
}

async function testPostCard() {
    log('Testing POST /api/cards...', colors.blue);
    
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testCard)
        });
        
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
            log('✓ POST successful - Card added', colors.green);
            return true;
        } else {
            throw new Error('Server returned success: false');
        }
    } catch (error) {
        log(`✗ POST failed: ${error.message}`, colors.red);
        return false;
    }
}

async function testDeleteCards() {
    log('Testing DELETE /api/cards...', colors.blue);
    
    try {
        const response = await fetch(SERVER_URL, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        if (data.success) {
            log('✓ DELETE successful - All cards cleared', colors.green);
            return true;
        } else {
            throw new Error('Server returned success: false');
        }
    } catch (error) {
        log(`✗ DELETE failed: ${error.message}`, colors.red);
        return false;
    }
}

// Main test function
async function runTests() {
    log('🧪 Starting API tests...', colors.yellow);
    log('---------------------------', colors.yellow);
    
    // Check if server is running
    try {
        await fetch(SERVER_URL);
    } catch (error) {
        log('✗ Server is not running. Please start the server with "npm start" first.', colors.red);
        return;
    }
    
    // Run tests
    let getResult = await testGetCards();
    await wait(500);
    
    let postResult = await testPostCard();
    await wait(500);
    
    // Verify post worked by getting cards again
    if (postResult) {
        await testGetCards();
        await wait(500);
    }
    
    let deleteResult = await testDeleteCards();
    await wait(500);
    
    // Final verification
    if (deleteResult) {
        await testGetCards();
    }
    
    log('---------------------------', colors.yellow);
    log('🏁 All tests completed!', colors.yellow);
    
    // Summary
    const allPassed = getResult && postResult && deleteResult;
    if (allPassed) {
        log('✅ All tests passed! The server is working correctly.', colors.green);
    } else {
        log('❌ Some tests failed. Please check the errors above.', colors.red);
    }
}

// Run the tests
runTests().catch(error => {
    log(`Unexpected error: ${error.message}`, colors.red);
}); 