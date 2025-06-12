// Test script to simulate form submission
console.log('Starting form submission test...');

// Test data
const testData = {
    cardName: 'Test User',
    cardNumber: '4111111111111111',
    expMonth: '12',
    expYear: '2025',
    cvv: '123',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    billingAddress: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
    timestamp: new Date().toISOString()
};

// Test server submission
async function testServerSubmission() {
    try {
        console.log('Testing server submission...');
        const response = await fetch('/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        if (response.ok) {
            const result = await response.text();
            console.log('✅ Server submission successful:', result);
            return true;
        } else {
            console.error('❌ Server submission failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Server submission error:', error);
        return false;
    }
}

// Test localStorage storage
function testLocalStorage() {
    try {
        console.log('Testing localStorage...');
        localStorage.setItem('testData', JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem('testData'));
        
        if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
            console.log('✅ localStorage test successful');
            localStorage.removeItem('testData');
            return true;
        } else {
            console.error('❌ localStorage test failed - data mismatch');
            return false;
        }
    } catch (error) {
        console.error('❌ localStorage test error:', error);
        return false;
    }
}

// Test sessionStorage storage
function testSessionStorage() {
    try {
        console.log('Testing sessionStorage...');
        sessionStorage.setItem('testData', JSON.stringify(testData));
        const retrieved = JSON.parse(sessionStorage.getItem('testData'));
        
        if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
            console.log('✅ sessionStorage test successful');
            sessionStorage.removeItem('testData');
            return true;
        } else {
            console.error('❌ sessionStorage test failed - data mismatch');
            return false;
        }
    } catch (error) {
        console.error('❌ sessionStorage test error:', error);
        return false;
    }
}

// Test redirect functionality
function testRedirect() {
    try {
        console.log('Testing redirect functionality...');
        
        // Store test data
        sessionStorage.setItem('paymentData', JSON.stringify(testData));
        localStorage.setItem('mostRecentCard', JSON.stringify(testData));
        
        console.log('✅ Data stored for redirect test');
        console.log('Attempting redirect to ship-out.html...');
        
        // Simulate redirect
        setTimeout(() => {
            window.location.href = 'ship-out.html';
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('❌ Redirect test error:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('=== Form Submission Test Suite ===');
    
    const results = {
        localStorage: testLocalStorage(),
        sessionStorage: testSessionStorage(),
        serverSubmission: await testServerSubmission()
    };
    
    console.log('=== Test Results ===');
    console.log('localStorage:', results.localStorage ? '✅ PASS' : '❌ FAIL');
    console.log('sessionStorage:', results.sessionStorage ? '✅ PASS' : '❌ FAIL');
    console.log('serverSubmission:', results.serverSubmission ? '✅ PASS' : '❌ FAIL');
    
    if (results.localStorage && results.sessionStorage && results.serverSubmission) {
        console.log('🎉 All tests passed! Testing redirect...');
        testRedirect();
    } else {
        console.log('❌ Some tests failed. Check the errors above.');
    }
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
} 