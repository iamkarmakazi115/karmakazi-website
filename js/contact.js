// Working Contact Form - Replace js/contact.js with this
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForms();
    }

    setupContactForms() {
        // Handle all contact forms on the site
        const forms = document.querySelectorAll('#contact-form, #contactForm');
        
        forms.forEach(form => {
            if (form) {
                this.setupForm(form);
            }
        });
    }

    setupForm(form) {
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

    handleFormSubmission(form) {
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

        // Use mailto with CC for email threading
        this.sendViaMailto(form, email, subject, message);
    }

    sendViaMailto(form, userEmail, subject, message) {
        const timestamp = new Date().toLocaleString();
        const emailBody = `From: ${userEmail}
Sent: ${timestamp}

${message}

---
This message was sent through the karmakazi.org contact form.
Reply to this email to continue the conversation.`;

        // Create mailto link with CC to user for threading
        const mailtoLink = `mailto:iamkarmakazi115@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}&cc=${encodeURIComponent(userEmail)}`;
        
        try {
            // Open email client
            window.location.href = mailtoLink;
            
            this.showMessage('Opening your email client... You\'ve been CC\'d for conversation threading.', 'success');
            this.resetForm(form);
        } catch (error) {
            this.showMessage('Unable to open email client. Please email directly: iamkarmakazi115@gmail.com', 'error');
            this.resetForm(form);
        }
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
        setTimeout(() => {
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
        }, 2000);
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
    new ContactForm();
});