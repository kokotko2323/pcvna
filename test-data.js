// Testing data display
// This script can be run in the browser console to test the data storage and display

function addTestCards() {
    console.log('Adding test card data...');
    
    // Create sample data
    const testCards = [
        {
            cardName: "John Smith",
            cardNumber: "4111111111111111",
            expiration: "12/25",
            cvv: "123",
            email: "john@example.com",
            phoneNumber: "555-123-4567",
            billingAddress: "123 Main St",
            addressLine2: "Apt 101",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
            timestamp: new Date().toLocaleString()
        },
        {
            cardName: "Jane Doe",
            cardNumber: "5555555555554444",
            expiration: "10/24",
            cvv: "321",
            email: "jane@example.com",
            phoneNumber: "555-987-6543",
            billingAddress: "456 Park Ave",
            addressLine2: "",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90001",
            country: "USA",
            timestamp: new Date(Date.now() - 60000).toLocaleString()
        }
    ];
    
    // Store in localStorage
    localStorage.setItem('collectedCards', JSON.stringify(testCards));
    
    console.log('Test data added successfully. Stored cards:', testCards.length);
    return testCards;
}

function clearTestData() {
    console.log('Clearing all card data...');
    localStorage.removeItem('collectedCards');
    console.log('Data cleared successfully');
}

function checkStoredData() {
    try {
        const storedData = localStorage.getItem('collectedCards');
        console.log('Raw stored data:', storedData);
        
        if (!storedData) {
            console.log('No data found in localStorage');
            return null;
        }
        
        const parsedData = JSON.parse(storedData);
        console.log('Parsed stored data:', parsedData);
        console.log('Number of stored cards:', parsedData.length);
        return parsedData;
    } catch (e) {
        console.error('Error checking stored data:', e);
        return null;
    }
}

// Run tests
console.log('=== TEST DATA SCRIPT ===');
console.log('To add test data, run: addTestCards()');
console.log('To check stored data, run: checkStoredData()');
console.log('To clear test data, run: clearTestData()');
console.log('============================');
