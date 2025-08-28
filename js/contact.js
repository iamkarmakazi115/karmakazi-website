// Enhanced Contact Form with Email Threading - Save as js/enhanced-contact.js
class EnhancedContactForm {
    constructor() {
        // You can set up these services later for professional email handling
        this.formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'; // Get from formspree.io
        this.emailjsServiceId = 'YOUR_EMAILJS_SERVICE_ID'; // Get from emailjs.com
        this.emailjsTemplateId = 'YOUR_EMAILJS_TEMPLATE_ID';
        this.emailjsPublicKey = 'YOUR_EMAILJS_PUBLIC_KEY';
        
        this.init();
    }

    init() {
        // Load EmailJS if not already loaded
        this.loadEmailJS();
        this.setupContactForms();
    }

    loadEmailJS() {
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(this.emailjsPublicKey);
            };
            document.head.appendChild(script);
        }
    }

    setupContactForms() {
        // Handle all contact forms on the site
        const forms = document.querySelectorAll('#contact-form, #contactForm');
        
        forms.forEach(form => {
            this.setupForm(form);
        });
    }

    setupForm(form) {
        if (!form) return;

        const messageTextarea = form.querySelector('#contact-message, #contactMessage');
        const wordCountSpan = form.querySelector('#word-count, #wordCount');

        // Word counting
        if (messageTextarea && wordCountSpan) {
            messageTextarea.addEventListener('input', () => {
                this.updateWordCount(messageTextarea, wordCountSpan);
            });
        }

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form);
        });
    }

    updateWordCount(textarea, countSpan) {
        const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = textarea.value.trim() === '' ? 0 : words.length;
        countSpan.textContent = wordCount;
        
        if (wordCount > 200) {
            countSpan.style.color = '#ff4444';
        } else if (wordCount > 180) {
            countSpan.style.color = '#ffaa00';
        } else {
            countSpan.style.color = 'rgba(255, 255, 255, 0.8)';
        }
    }

    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        // Validate word count
        const words = message.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = message.trim() === '' ? 0 : words.length;
        
        if (wordCount > 200) {
            this.showMessage('Message must be 200 words or less. Current count: ' + wordCount, 'error');
            return;
        }

        // Show loading state
        this.showLoading(form);

        try {
            // Method 1: Try EmailJS (recommended for your use case)
            await this.sendViaEmailJS(email, subject, message);
            
        } catch (emailjsError) {
            console.warn('EmailJS failed, trying Formspree:', emailjsError);
            
            try {
                // Method 2: Fallback to Formspree
                await this.sendViaFormspree(email, subject, message);
                
            } catch (formspreeError) {
                console.warn('Formspree failed, using mailto:', formspreeError);
                
                // Method 3: Final fallback to mailto
                this.sendViaMailto(email, subject, message);
            }
        }
    }

    async sendViaEmailJS(userEmail, subject, message) {
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS not loaded');
        }

        const timestamp = new Date().toLocaleString();
        
        // Send email to Paul Castro
        const emailToAuthor = {
            to_email: 'iamkarmakazi115@gmail.com',
            from_email: userEmail,
            from_name: userEmail.split('@')[0],
            subject: subject,
            message: message,
            timestamp: timestamp,
            reply_to: userEmail
        };

        // Send copy to user
        const emailToUser = {
            to_email: userEmail,
            from_email: 'noreply@karmakazi.org',
            from_name: 'Paul Castro - Karmakazi',
            subject: `Re: ${subject}`,
            message: `Thank you for contacting me! I've received your message and will respond soon.\n\n---\nYour original message:\nSubject: ${subject}\nMessage: ${message}\n\nSent: ${timestamp}`,
            timestamp: timestamp
        };

        // Send both emails
        await emailjs.send(this.emailjsServiceId, this.emailjsTemplateId, emailToAuthor);
        await emailjs.send(this.emailjsServiceId, 'user_copy_template', emailToUser);
        
        this.showMessage('Message sent successfully! Check your email for a copy.', 'success');
        this.resetForm(form);
    }

    async sendViaFormspree(userEmail, subject, message) {
        const response = await fetch(this.formspreeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                subject: subject,
                message: message,
                _replyto: userEmail,
                _cc: userEmail,
                _subject: `Contact from ${userEmail}: ${subject}`
            })
        });

        if (!response.ok) {
            throw new Error(`Formspree error: ${response.status}`);
        }

        this.showMessage('Message sent successfully! You should receive a copy via email.', 'success');
        this.resetForm(form);
    }

    sendViaMailto(userEmail, subject, message) {
        const timestamp = new Date().toLocaleString();
        const emailBody = `From: ${userEmail}
Sent: ${timestamp}

${message}

---
Note: Please reply to this email to continue the conversation thread.`;

        const mailtoLink = `mailto:iamkarmakazi115@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}&cc=${encodeURIComponent(userEmail)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        this.showMessage('Opening your email client... Your email address has been added as CC for thread continuation.', 'info');
        this.resetForm(form);
    }

    showLoading(form) {
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading"></div> Sending...';
        }
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        
        // Style the message
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            max-width: 400px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
        `;

        // Type-specific styling
        switch(type) {
            case 'success':
                message.style.background = 'rgba(0, 255, 0, 0.2)';
                message.style.color = '#00ff00';
                message.style.border = '1px solid #00ff00';
                break;
            case 'error':
                message.style.background = 'rgba(255, 0, 0, 0.2)';
                message.style.color = '#ff4444';
                message.style.border = '1px solid #ff4444';
                break;
            case 'info':
                message.style.background = 'rgba(0, 255, 255, 0.2)';
                message.style.color = '#00ffff';
                message.style.border = '1px solid #00ffff';
                break;
        }

        document.body.appendChild(message);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }

    resetForm(form) {
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
        
        form.reset();
        
        // Reset word count
        const wordCount = form.querySelector('#word-count, #wordCount');
        if (wordCount) {
            wordCount.textContent = '0';
            wordCount.style.color = 'rgba(255, 255, 255, 0.8)';
        }
    }
}

// CSS for animations and messages
const contactStyles = document.createElement('style');
contactStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .form-message {
        animation: slideIn 0.3s ease;
    }

    .loading {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid #4ecdc4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 8px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(contactStyles);

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedContactForm();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedContactForm;
}