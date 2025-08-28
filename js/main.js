// Main Site JavaScript - Updated for Floating Navigation
class KarmakaziSite {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.backgroundVideo = null;
        this.init();
    }

    init() {
        this.setupBackgroundVideo();
        this.setupPageTransitions();
        this.setupResponsiveHandling();
        this.setupAccessibility();
        this.setupPerformanceOptimizations();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('about')) return 'about';
        if (path.includes('works')) return 'works';
        if (path.includes('blog')) return 'blog';
        if (path.includes('chat')) return 'chat';
        return 'home';
    }

    setupBackgroundVideo() {
        this.backgroundVideo = document.getElementById('background-video');
        
        // Only set up video for homepage
        if (this.backgroundVideo && this.currentPage === 'home') {
            // Set appropriate video source based on page
            this.setVideoSource();
            
            // Ensure video plays properly
            this.backgroundVideo.addEventListener('loadeddata', () => {
                this.backgroundVideo.play().catch(error => {
                    console.log('Video autoplay failed:', error);
                    // Fallback: show play button or static background
                    this.handleVideoPlaybackError();
                });
            });

            // Handle video errors
            this.backgroundVideo.addEventListener('error', () => {
                this.handleVideoError();
            });

            // Optimize for mobile
            if (this.isMobileDevice()) {
                this.optimizeForMobile();
            }
        } else if (this.currentPage !== 'home') {
            // For non-home pages, just use gradient backgrounds (no video setup needed)
            console.log(`Using gradient background for ${this.currentPage} page`);
        }
    }

    setVideoSource() {
        // Only set video source for homepage
        if (this.currentPage !== 'home') {
            return;
        }

        const videoSources = {
            home: 'assets/videos/home-background.mp4'
        };

        const source = this.backgroundVideo.querySelector('source');
        if (source && videoSources[this.currentPage]) {
            source.src = videoSources[this.currentPage];
            this.backgroundVideo.load();
            
            // Add error handling for missing videos
            this.backgroundVideo.addEventListener('error', () => {
                console.log(`Video ${videoSources[this.currentPage]} not found, using fallback background`);
                this.handleVideoError();
            });
            
            // Set a timeout to fallback if video doesn't load
            setTimeout(() => {
                if (this.backgroundVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
                    console.log('Video failed to load, using fallback');
                    this.handleVideoError();
                }
            }, 3000);
        } else {
            // No video source specified, use fallback immediately
            this.handleVideoError();
        }
    }

    handleVideoPlaybackError() {
        // Create a play button overlay
        const playOverlay = document.createElement('div');
        playOverlay.className = 'video-play-overlay';
        playOverlay.innerHTML = `
            <button class="video-play-btn">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Click to play background video</span>
            </button>
        `;
        
        playOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.7);
            z-index: 0;
        `;

        const videoContainer = document.querySelector('.video-background');
        if (videoContainer) {
            videoContainer.appendChild(playOverlay);

            playOverlay.addEventListener('click', () => {
                this.backgroundVideo.play().then(() => {
                    playOverlay.remove();
                });
            });
        }
    }

    handleVideoError() {
        console.log('Setting up fallback background due to video error');
        const videoContainer = document.querySelector('.video-background');
        
        if (videoContainer) {
            // Create fallback background
            const fallbackBg = document.createElement('div');
            fallbackBg.className = 'video-fallback';
            fallbackBg.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
                opacity: 0.8;
                z-index: 1;
            `;
            
            // Only add fallback if it doesn't already exist
            if (!videoContainer.querySelector('.video-fallback')) {
                videoContainer.appendChild(fallbackBg);
            }
            
            // Hide the video element
            if (this.backgroundVideo) {
                this.backgroundVideo.style.display = 'none';
            }
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    optimizeForMobile() {
        // Reduce video quality for mobile
        this.backgroundVideo.setAttribute('preload', 'metadata');
        
        // Add option to disable video on mobile
        if (window.innerWidth < 768) {
            this.backgroundVideo.style.display = 'none';
            this.handleVideoError(); // Use fallback background
        }
    }

    setupPageTransitions() {
        // Add smooth page entrance animation
        document.body.classList.add('page-transition');
        
        // Handle page exits
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && 
                link.hostname === window.location.hostname &&
                !link.classList.contains('nav-item')) { // Don't handle floating nav clicks
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

    setupResponsiveHandling() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    handleResize() {
        // Adjust video for mobile orientation changes
        if (this.backgroundVideo && this.isMobileDevice()) {
            this.optimizeForMobile();
        }
    }

    setupAccessibility() {
        // Add skip link
        this.addSkipLink();
        
        // Ensure proper focus management
        this.setupFocusManagement();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #4ecdc4;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 1000;
            border-radius: 4px;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    setupFocusManagement() {
        // Ensure video doesn't receive focus
        if (this.backgroundVideo) {
            this.backgroundVideo.setAttribute('tabindex', '-1');
        }

        // Manage focus for contact form
        const form = document.getElementById('contact-form');
        if (form) {
            const firstInput = form.querySelector('input, textarea');
            const lastInput = form.querySelector('input:last-of-type, textarea:last-of-type, button:last-of-type');
            
            // Trap focus within form when it's active
            form.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstInput) {
                        e.preventDefault();
                        lastInput.focus();
                    } else if (!e.shiftKey && document.activeElement === lastInput) {
                        e.preventDefault();
                        firstInput.focus();
                    }
                }
            });
        }
    }

    setupPerformanceOptimizations() {
        // Lazy load video if not immediately visible
        if (this.backgroundVideo && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.backgroundVideo.load();
                        observer.unobserve(this.backgroundVideo);
                    }
                });
            });
            
            observer.observe(this.backgroundVideo);
        }

        // Preload critical resources - UPDATED to remove sphere references
        this.preloadCriticalResources();

        // Setup service worker for caching (if available)
        if ('serviceWorker' in navigator) {
            this.setupServiceWorker();
        }
    }

    preloadCriticalResources() {
        // Only preload if we're on the home page to avoid path issues
        if (this.currentPage === 'home') {
            const criticalResources = [
                'css/main.css',
                'css/floating-nav.css' // Updated: use floating-nav.css instead of sphere.css
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = 'style';
                document.head.appendChild(link);
            });
        }
    }

    setupServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }

    // Utility methods
    static showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `site-notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            warning: '#feca57',
            info: '#45b7d1'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    static addGlobalStyles() {
        const globalStyles = `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = globalStyles;
        document.head.appendChild(style);
    }
}

// Initialize site when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add global styles
    KarmakaziSite.addGlobalStyles();
    
    // Initialize main site functionality
    new KarmakaziSite();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    const video = document.getElementById('background-video');
    if (video) {
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(e => console.log('Video play failed:', e));
        }
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KarmakaziSite;
}