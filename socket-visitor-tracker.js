// Socket.IO Client for Real-time Visitor Tracking
// This script connects to the Socket.IO server and sends visitor data

class SocketVisitorTracker {
    constructor(serverUrl = 'http://localhost:3000') {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.isConnected = false;
    }

    // Initialize the tracker
    async init() {
        try {
            // Only track on index page
            if (!this.isIndexPage()) {
                console.log('Not on index page, skipping Socket.IO visitor tracking');
                return;
            }

            console.log('🔌 Initializing Socket.IO visitor tracker...');
            
            // Load Socket.IO client library
            await this.loadSocketIO();
            
            // Connect to server
            this.connect();
            
        } catch (error) {
            console.error('❌ Failed to initialize Socket.IO visitor tracker:', error);
        }
    }

    // Check if we're on the index page
    isIndexPage() {
        const path = window.location.pathname;
        return path === '/' || 
               path === '/index.html' || 
               path.endsWith('/index.html');
    }

    // Load Socket.IO client library
    loadSocketIO() {
        return new Promise((resolve, reject) => {
            // Check if Socket.IO is already loaded
            if (typeof io !== 'undefined') {
                resolve();
                return;
            }

            // Load Socket.IO from CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
            script.onload = () => {
                console.log('✅ Socket.IO client library loaded');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Socket.IO client library'));
            };
            document.head.appendChild(script);
        });
    }

    // Connect to Socket.IO server
    connect() {
        try {
            console.log(`🔌 Connecting to Socket.IO server: ${this.serverUrl}`);
            
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 5000
            });

            // Connection successful
            this.socket.on('connect', () => {
                console.log('✅ Connected to Socket.IO server');
                this.isConnected = true;
                this.sendVisitorData();
            });

            // Connection error
            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket.IO connection error:', error);
                this.isConnected = false;
            });

            // Disconnection
            this.socket.on('disconnect', (reason) => {
                console.log('🔌 Disconnected from Socket.IO server:', reason);
                this.isConnected = false;
            });

            // Notification sent confirmation
            this.socket.on('notification-sent', (data) => {
                if (data.success) {
                    console.log(`✅ Visitor notification sent! Country: ${data.country}, Time: ${data.time}`);
                } else {
                    console.error('❌ Failed to send notification:', data.error);
                }
            });

        } catch (error) {
            console.error('❌ Error connecting to Socket.IO server:', error);
        }
    }

    // Send visitor data to server
    async sendVisitorData() {
        try {
            console.log('📊 Collecting visitor data...');
            
            // Get visitor information
            const visitorData = await this.collectVisitorData();
            
            console.log('📤 Sending visitor data to server:', visitorData);
            
            // Send data to server
            this.socket.emit('visitor', visitorData);
            
        } catch (error) {
            console.error('❌ Error sending visitor data:', error);
        }
    }

    // Collect visitor data
    async collectVisitorData() {
        const data = {
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            referrer: document.referrer || 'Direct',
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Get browser info
        const browserInfo = this.getBrowserInfo();
        data.browser = browserInfo.browser;
        data.device = browserInfo.deviceType;
        data.os = browserInfo.os;

        // Try to get IP address
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            data.ip = ipData.ip;
        } catch (error) {
            console.log('Could not fetch IP address:', error);
            data.ip = 'Unknown';
        }

        return data;
    }

    // Get browser and device information
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        
        // Detect browser
        let browser = 'Unknown';
        if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (userAgent.indexOf('SamsungBrowser') > -1) {
            browser = 'Samsung Browser';
        } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
            browser = 'Opera';
        } else if (userAgent.indexOf('Trident') > -1) {
            browser = 'Internet Explorer';
        } else if (userAgent.indexOf('Edge') > -1) {
            browser = 'Edge';
        } else if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
        }
        
        // Detect OS
        let os = 'Unknown';
        if (userAgent.indexOf('Windows') > -1) {
            os = 'Windows';
        } else if (userAgent.indexOf('Mac') > -1) {
            os = 'MacOS';
        } else if (userAgent.indexOf('Linux') > -1) {
            os = 'Linux';
        } else if (userAgent.indexOf('Android') > -1) {
            os = 'Android';
        } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
            os = 'iOS';
        }
        
        // Detect device type
        let deviceType = 'Desktop';
        if (userAgent.indexOf('Mobile') > -1) {
            deviceType = 'Mobile';
        } else if (userAgent.indexOf('Tablet') > -1 || userAgent.indexOf('iPad') > -1) {
            deviceType = 'Tablet';
        }
        
        return { browser, os, deviceType };
    }
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create tracker instance
        // Change this URL to your deployed Socket.IO server
        const tracker = new SocketVisitorTracker('http://localhost:3000');
        
        // Initialize tracking
        await tracker.init();
        
    } catch (error) {
        console.error('❌ Failed to start Socket.IO visitor tracking:', error);
    }
}); 