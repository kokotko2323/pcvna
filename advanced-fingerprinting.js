// Advanced Browser Fingerprinting System
class AdvancedFingerprinting {
    constructor() {
        this.fingerprint = {};
        this.sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
        this.startTime = Date.now();
        this.init();
    }

    async init() {
        console.log('🕵️ Starting advanced fingerprinting...');
        await this.collectAllData();
        this.sendFingerprint();
        this.startRealTimeTracking();
    }

    async collectAllData() {
        // Basic browser info
        this.fingerprint.basic = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            url: window.location.href,
            referrer: document.referrer,
            sessionId: this.sessionId
        };

        // Hardware fingerprinting
        this.fingerprint.hardware = {
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            devicePixelRatio: window.devicePixelRatio,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory || 'unknown'
        };

        // Network info
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            this.fingerprint.network = { ip: ipData.ip };
        } catch (e) {
            this.fingerprint.network = { ip: 'unknown' };
        }

        // Canvas fingerprinting
        this.fingerprint.canvas = this.getCanvasFingerprint();
        
        // WebGL fingerprinting
        this.fingerprint.webgl = this.getWebGLFingerprint();
        
        // Font detection
        this.fingerprint.fonts = this.getFontFingerprint();
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Fingerprint test 🔍', 2, 2);
            return canvas.toDataURL();
        } catch (e) {
            return 'unavailable';
        }
    }

    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return 'unavailable';
            
            return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER)
            };
        } catch (e) {
            return 'unavailable';
        }
    }

    getFontFingerprint() {
        const testFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'];
        const availableFonts = [];
        
        for (const font of testFonts) {
            if (this.isFontAvailable(font)) {
                availableFonts.push(font);
            }
        }
        
        return availableFonts;
    }

    isFontAvailable(font) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const text = 'abcdefghijklmnopqrstuvwxyz';
        
        context.font = '72px monospace';
        const baselineWidth = context.measureText(text).width;
        
        context.font = '72px ' + font + ', monospace';
        const width = context.measureText(text).width;
        
        return width !== baselineWidth;
    }

    startRealTimeTracking() {
        // Track mouse movements
        document.addEventListener('mousemove', (e) => {
            this.sendUpdate('mouse', { x: e.clientX, y: e.clientY });
        });

        // Track clicks
        document.addEventListener('click', (e) => {
            this.sendUpdate('click', { 
                x: e.clientX, 
                y: e.clientY, 
                target: e.target.tagName 
            });
        });

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.sendUpdate('visibility', { 
                state: document.visibilityState 
            });
        });
    }

    sendFingerprint() {
        fetch('/api/fingerprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: this.sessionId,
                fingerprint: this.fingerprint,
                timestamp: new Date().toISOString()
            })
        }).catch(console.error);
    }

    sendUpdate(type, data) {
        fetch('/api/tracking-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: this.sessionId,
                type: type,
                data: data,
                timestamp: new Date().toISOString()
            })
        }).catch(console.error);
    }
}

// Auto-start fingerprinting
window.fingerprinter = new AdvancedFingerprinting(); 