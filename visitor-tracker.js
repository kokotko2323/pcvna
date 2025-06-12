// Enhanced Visitor Tracking Script
// This script collects comprehensive visitor data from the browser

(function() {
    'use strict';
    
    // Function to get detailed browser information
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            'Chrome': /Chrome\/([0-9.]+)/,
            'Firefox': /Firefox\/([0-9.]+)/,
            'Safari': /Version\/([0-9.]+).*Safari/,
            'Edge': /Edg\/([0-9.]+)/,
            'Opera': /OPR\/([0-9.]+)/,
            'Internet Explorer': /MSIE ([0-9.]+)/
        };
        
        for (let browser in browsers) {
            const match = ua.match(browsers[browser]);
            if (match) {
                return {
                    name: browser,
                    version: match[1],
                    fullUA: ua
                };
            }
        }
        
        return {
            name: 'Unknown',
            version: 'Unknown',
            fullUA: ua
        };
    }
    
    // Function to get operating system information
    function getOSInfo() {
        const ua = navigator.userAgent;
        const os = {
            'Windows 11': /Windows NT 10.0.*WOW64|Windows NT 10.0.*Win64/,
            'Windows 10': /Windows NT 10.0/,
            'Windows 8.1': /Windows NT 6.3/,
            'Windows 8': /Windows NT 6.2/,
            'Windows 7': /Windows NT 6.1/,
            'macOS': /Mac OS X ([0-9._]+)/,
            'iOS': /iPhone OS ([0-9._]+)|iPad.*OS ([0-9._]+)/,
            'Android': /Android ([0-9.]+)/,
            'Linux': /Linux/,
            'Ubuntu': /Ubuntu/,
            'Chrome OS': /CrOS/
        };
        
        for (let system in os) {
            const match = ua.match(os[system]);
            if (match) {
                return {
                    name: system,
                    version: match[1] || 'Unknown',
                    architecture: navigator.platform
                };
            }
        }
        
        return {
            name: 'Unknown',
            version: 'Unknown',
            architecture: navigator.platform
        };
    }
    
    // Function to get device information
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = 'Desktop';
        let deviceModel = 'Unknown';
        
        // Detect device type
        if (/tablet|ipad/i.test(ua)) {
            deviceType = 'Tablet';
        } else if (/mobile|android|iphone/i.test(ua)) {
            deviceType = 'Mobile';
        }
        
        // Try to extract device model
        const devicePatterns = {
            'iPhone': /iPhone([0-9,]+)/,
            'iPad': /iPad([0-9,]+)/,
            'Samsung': /SM-([A-Z0-9]+)/,
            'Pixel': /Pixel ([0-9]+)/,
            'OnePlus': /OnePlus ([A-Z0-9]+)/
        };
        
        for (let device in devicePatterns) {
            const match = ua.match(devicePatterns[device]);
            if (match) {
                deviceModel = device + ' ' + match[1];
                break;
            }
        }
        
        return {
            type: deviceType,
            model: deviceModel,
            touchSupport: 'ontouchstart' in window,
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }
    
    // Function to get screen and display information
    function getScreenInfo() {
        return {
            resolution: `${screen.width}x${screen.height}`,
            availableResolution: `${screen.availWidth}x${screen.availHeight}`,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation ? screen.orientation.type : 'Unknown',
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }
    
    // Function to get network information
    function getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                effectiveType: connection.effectiveType || 'Unknown',
                downlink: connection.downlink || 'Unknown',
                rtt: connection.rtt || 'Unknown',
                saveData: connection.saveData || false
            };
        }
        return {
            effectiveType: 'Unknown',
            downlink: 'Unknown',
            rtt: 'Unknown',
            saveData: false
        };
    }
    
    // Function to get location information (if permitted)
    async function getLocationInfo() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({
                    latitude: null,
                    longitude: null,
                    accuracy: null,
                    permission: 'not_supported'
                });
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        permission: 'granted'
                    });
                },
                (error) => {
                    resolve({
                        latitude: null,
                        longitude: null,
                        accuracy: null,
                        permission: 'denied',
                        error: error.message
                    });
                },
                { timeout: 5000, enableHighAccuracy: false }
            );
        });
    }
    
    // Function to get timezone and locale information
    function getLocaleInfo() {
        return {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            languages: navigator.languages || [navigator.language],
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
            currency: new Intl.NumberFormat().resolvedOptions().currency || 'Unknown'
        };
    }
    
    // Function to get performance and memory information
    function getPerformanceInfo() {
        const performance = window.performance;
        const memory = performance.memory;
        
        return {
            loadTime: performance.timing ? (performance.timing.loadEventEnd - performance.timing.navigationStart) : null,
            domContentLoaded: performance.timing ? (performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) : null,
            memoryUsed: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB' : 'Unknown',
            memoryTotal: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB' : 'Unknown',
            memoryLimit: memory ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB' : 'Unknown'
        };
    }
    
    // Function to detect ad blockers and privacy tools
    function getPrivacyInfo() {
        const privacy = {
            adBlocker: false,
            doNotTrack: navigator.doNotTrack === '1',
            cookiesEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            plugins: Array.from(navigator.plugins).map(p => p.name),
            webGL: false
        };
        
        // Simple ad blocker detection
        try {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.position = 'absolute';
            testAd.style.left = '-10000px';
            document.body.appendChild(testAd);
            
            setTimeout(() => {
                if (testAd.offsetHeight === 0) {
                    privacy.adBlocker = true;
                }
                document.body.removeChild(testAd);
            }, 100);
        } catch (e) {
            // Ignore errors
        }
        
        // WebGL detection
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            privacy.webGL = !!gl;
            if (gl) {
                privacy.webGLVendor = gl.getParameter(gl.VENDOR);
                privacy.webGLRenderer = gl.getParameter(gl.RENDERER);
            }
        } catch (e) {
            // Ignore errors
        }
        
        return privacy;
    }
    
    // Function to get referrer and traffic source information
    function getTrafficInfo() {
        const referrer = document.referrer;
        const url = window.location;
        
        // Parse UTM parameters
        const urlParams = new URLSearchParams(url.search);
        const utmParams = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            if (urlParams.has(param)) {
                utmParams[param] = urlParams.get(param);
            }
        });
        
        return {
            referrer: referrer || 'Direct',
            currentUrl: url.href,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
            utmParams: Object.keys(utmParams).length > 0 ? utmParams : null,
            isDirectTraffic: !referrer,
            isSearchEngine: /google|bing|yahoo|duckduckgo|baidu/i.test(referrer)
        };
    }
    
    // Main function to collect all visitor data
    async function collectVisitorData() {
        const visitorData = {
            timestamp: new Date().toISOString(),
            sessionId: generateSessionId(),
            
            // Browser information
            browser: getBrowserInfo(),
            
            // Operating system
            os: getOSInfo(),
            
            // Device information
            device: getDeviceInfo(),
            
            // Screen and display
            screen: getScreenInfo(),
            
            // Network information
            network: getNetworkInfo(),
            
            // Timezone and locale
            locale: getLocaleInfo(),
            
            // Performance metrics
            performance: getPerformanceInfo(),
            
            // Privacy and security
            privacy: getPrivacyInfo(),
            
            // Traffic source
            traffic: getTrafficInfo(),
            
            // Page information
            page: {
                title: document.title,
                url: window.location.href,
                pathname: window.location.pathname,
                loadTime: Date.now()
            }
        };
        
        // Try to get location (optional)
        try {
            visitorData.location = await getLocationInfo();
        } catch (e) {
            visitorData.location = {
                latitude: null,
                longitude: null,
                accuracy: null,
                permission: 'error',
                error: e.message
            };
        }
        
        return visitorData;
    }
    
    // Function to generate a session ID
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Function to send visitor data to server
    async function sendVisitorData(data) {
        try {
            const response = await fetch('/api/track-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                console.warn('Failed to send visitor data:', response.status);
            }
        } catch (error) {
            console.warn('Error sending visitor data:', error);
        }
    }
    
    // Initialize tracking when DOM is ready
    function initializeTracking() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startTracking);
        } else {
            startTracking();
        }
    }
    
    // Start the tracking process
    async function startTracking() {
        try {
            // Collect comprehensive visitor data
            const visitorData = await collectVisitorData();
            
            // Send to server
            await sendVisitorData(visitorData);
            
            // Store in localStorage for debugging (optional)
            if (window.location.search.includes('debug=true')) {
                localStorage.setItem('lastVisitorData', JSON.stringify(visitorData, null, 2));
                console.log('Visitor data collected:', visitorData);
            }
            
        } catch (error) {
            console.warn('Error in visitor tracking:', error);
        }
    }
    
    // Initialize the tracking system
    initializeTracking();
    
    // Export for debugging purposes
    window.VisitorTracker = {
        collectData: collectVisitorData,
        sendData: sendVisitorData
    };
    
})(); 