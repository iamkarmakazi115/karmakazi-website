// Floating Text Navigation System
class FloatingNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('about')) return 'about';
        if (path.includes('works')) return 'works';
        if (path.includes('blog')) return 'blog';
        if (path.includes('chat')) return 'chat';
        return 'home';
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupPageTransitions();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            
            // Mark current page
            if (page === this.currentPage) {
                item.classList.add('current-page');
            }
            
            // Add click handler
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavClick(item, page);
            });
            
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                this.pauseAnimation(item);
            });
            
            item.addEventListener('mouseleave', () => {
                this.resumeAnimation(item);
            });
        });
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Allow tab navigation through nav items
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach(item => {
                    item.setAttribute('tabindex', '0');
                });
            }
        });

        // Handle focus for accessibility
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('focus', () => {
                this.pauseAnimation(item);
            });
            
            item.addEventListener('blur', () => {
                this.resumeAnimation(item);
            });
            
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const page = item.getAttribute('data-page');
                    this.handleNavClick(item, page);
                }
            });
        });

        // Performance optimization - pause animations when tab is hidden
        document.addEventListener('visibilitychange', () => {
            const navItems = document.querySelectorAll('.nav-item');
            
            if (document.hidden) {
                navItems.forEach(item => {
                    const navText = item.querySelector('.nav-text');
                    navText.style.animationPlayState = 'paused';
                });
            } else {
                navItems.forEach(item => {
                    if (!item.matches(':hover')) {
                        const navText = item.querySelector('.nav-text');
                        navText.style.animationPlayState = 'running';
                    }
                });
            }
        });
    }

    handleNavClick(item, page) {
        // Add click animation
        item.classList.add('clicked');
        setTimeout(() => {
            item.classList.remove('clicked');
        }, 300);

        // Navigate to page
        this.navigateToPage(page);
    }

    pauseAnimation(item) {
        const navText = item.querySelector('.nav-text');
        navText.style.animationPlayState = 'paused';
    }

    resumeAnimation(item) {
        const navText = item.querySelector('.nav-text');
        navText.style.animationPlayState = 'running';
    }

    navigateToPage(page) {
        // Show loading state
        document.body.style.opacity = '0.8';
        document.body.style.transition = 'opacity 0.3s ease';

        // Determine correct path
        let targetPath = '';
        const currentPath = window.location.pathname;
        const isInRoot = !currentPath.includes('/pages/') && 
                        (currentPath === '/' || 
                         currentPath.endsWith('/index.html') || 
                         currentPath.endsWith('/karmakazi-website/'));

        switch(page) {
            case 'home':
                targetPath = isInRoot ? 'index.html' : '../index.html';
                break;
            case 'about':
                targetPath = isInRoot ? 'pages/about.html' : 'about.html';
                break;
            case 'works':
                targetPath = isInRoot ? 'pages/works.html' : 'works.html';
                break;
            case 'blog':
                targetPath = isInRoot ? 'pages/blog.html' : 'blog.html';
                break;
            case 'chat':
                targetPath = isInRoot ? 'pages/chat.html' : 'chat.html';
                break;
            default:
                console.log('Unknown page:', page);
                return;
        }

        console.log('Navigating to:', targetPath);

        // Navigate after short delay for visual feedback
        setTimeout(() => {
            window.location.href = targetPath;
        }, 300);
    }

    setupPageTransitions() {
        // Add smooth page entrance animation
        document.body.classList.add('page-transition');
        
        // Handle page exits for internal links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && 
                link.hostname === window.location.hostname && 
                !link.classList.contains('nav-item') &&
                !link.hasAttribute('target')) {
                
                e.preventDefault();
                this.transitionToPage(link.href);
            }
        });
    }

    transitionToPage(url) {
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    // Static method to create navigation HTML
    static createNavigationHTML(currentPage = '') {
        const pages = [
            { page: 'home', title: 'Home' },
            { page: 'about', title: 'About Me' },
            { page: 'works', title: 'My Works' },
            { page: 'blog', title: 'Blog' },
            { page: 'chat', title: 'Chat Live' }
        ];

        const navItems = pages.map(({page, title}) => {
            const currentClass = page === currentPage ? ' current-page' : '';
            return `
            <a href="#" class="nav-item${currentClass}" data-page="${page}">
                <div class="nav-text">${title}</div>
            </a>`;
        }).join('');

        return `
        <div class="floating-nav-container">
            <nav class="floating-nav">
                ${navItems}
            </nav>
        </div>`;
    }
}

// Utility function to add global styles
function addGlobalStyles() {
    const globalStyles = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .page-transition {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s ease forwards;
        }
        
        /* Focus styles for accessibility */
        .nav-item:focus {
            outline: 3px solid rgba(78, 205, 196, 0.6);
            outline-offset: 5px;
            border-radius: 10px;
        }
        
        /* Smooth transitions */
        * {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addGlobalStyles();
    new FloatingNavigation();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingNavigation;
}