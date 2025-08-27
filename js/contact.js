// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.messageField = document.getElementById('contact-message');
        this.wordCountDisplay = document.getElementById('word-count');
        this.maxWords = 200;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.setupWordCounter();
        this.setupFormValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time word counting
        this.messageField.addEventListener('input', () => {
            this.updateWordCount();
            this.validateWordLimit();
        });

        // Prevent typing beyond word limit
        this.messageField.addEventListener('keydown', (e) => {
            const currentWords = this.countWords(this.messageField.value);
            const isTyping = e.key.length === 1 || e.key === 'Enter';
            
            if (currentWords >= this.maxWords && isTyping && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.showWordLimitWarning();
            }
        });

        // Auto-resize textarea
        this.messageField.addEventListener('input', () => {
            this.autoResize(this.messageField);
        });
    }

    setupWordCounter() {
        this.updateWordCount();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    countWords(text) {
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }

    updateWordCount() {
        const currentWords = this.countWords(this.messageField.value);
        this.wordCountDisplay.textContent = currentWords;
        
        // Change color based on word count
        if (currentWords > this.maxWords * 0.9) {
            this.wordCountDisplay.style.color = '#ff6b6b';
        } else if (currentWords > this.maxWords * 0.7) {
            this.wordCountDisplay.style.color = '#feca57';
        } else {
            this.wordCountDisplay.style.color = '#999';
        }
    }

    validateWordLimit() {
        const currentWords = this.countWords(this.messageField.value);
        if (currentWords > this.maxWords) {
            // Trim to word limit
            const words = this.messageField.value.trim().split(/\s+/);
            const trimmedText = words.slice(0, this.maxWords).join(' ');
            this.messageField.value = trimmedText;
            this.updateWordCount();
        }
    }

    showWordLimitWarning() {
        const warning = document.createElement('div');
        warning.className = 'word-limit-warning';
        warning.textContent = `Maximum ${this.maxWords} words reached!`;
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Validate based on field type
        switch(fieldName) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'subject':
                if (value.length < 3) {
                    this.showFieldError(field, 'Subject must be at least 3 characters');
                    return false;
                }
                break;
            case 'message':
                if (value.length < 10) {
                    this.showFieldError(field, 'Message must be at least 10 characters');
                    return false;
                }
                if (this.countWords(value) > this.maxWords) {
                    this.showFieldError(field, `Message exceeds ${this.maxWords} word limit`);
                    return false;
                }
                break;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 5px;
        `;
        
        field.style.borderColor = '#ff6b6b';
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = 'rgba(255,255,255,0.2)';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleSubmit() {
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Validate all fields
        const fields = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<div class="loading"></div> Sending...';
        submitBtn.disabled = true;

        try {
            const formData = this.getFormData();
            await this.submitForm(formData);
            
            this.showNotification('Message sent successfully!', 'success');
            this.form.reset();
            this.updateWordCount();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        return {
            email: document.getElementById('contact-email').value.trim(),
            subject: document.getElementById('contact-subject').value.trim(),
            message: document.getElementById('contact-message').value.trim(),
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };
    }

    async submitForm(formData) {
        // For now, we'll use a mailto link since we don't have a backend
        // In production, you would send this to your email service
        
        const mailtoLink = this.createMailtoLink(formData);
        
        // Try to open email client
        window.location.href = mailtoLink;
        
        // Also log the data for debugging
        console.log('Contact form submission:', formData);
        
        return Promise.resolve();
    }

    createMailtoLink(formData) {
        const recipient = 'iamkarmakazi115@gmail.com';
        const subject = encodeURIComponent(`Website Contact: ${formData.subject}`);
        const body = encodeURIComponent(
            `From: ${formData.email}\n` +
            `Subject: ${formData.subject}\n` +
            `Sent: ${new Date().toLocaleString()}\n` +
            `Page: ${formData.page}\n\n` +
            `Message:\n${formData.message}`
        );
        
        return `mailto:${recipient}?subject=${subject}&body=${body}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            info: '#45b7d1'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyle);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
}