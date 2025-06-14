const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Payment success route
app.get('/payment-success.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment-success.html'));
});

// Details cards route
app.get('/details-cards.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'details-cards.html'));
});

// Admin cards route
app.get('/admin-cards.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-cards.html'));
});

// Handle form POST requests
app.post('/submit-payment', (req, res) => {
    // Just redirect to success page
    res.redirect('/payment-success.html');
});

// Catch all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 