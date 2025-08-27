// Horizontal Carousel Navigation System
class SphereNavigation {
    constructor() {
        this.spheres = document.querySelectorAll('.sphere');
        this.carousel = document.getElementById('sphere-carousel');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        this.currentIndex = 0;
        this.totalSpheres = this.spheres.length;
        
        this.init();
    }

    init() {
        this.addEventListeners();
        this.setupHoverEffects();
        this.setupClickHandlers();
        this.setupCarouselNavigation();
        this.updateCarousel();
    }

    setupCarouselNavigation() {
        if (this.prevBtn && this.nextBtn && this.totalSpheres > 1) {
            this.prevBtn.addEventListener('click', () => {
                this.currentIndex = (this.currentIndex - 1 + this.totalSpheres) % this.totalSpheres;
                this.updateCarousel();
            });

            this.nextBtn.addEventListener('click', () => {
                this.currentIndex = (this.currentIndex + 1) % this.totalSpheres;
                this.updateCarousel();
            });

            // Auto-rotate carousel every 5 seconds (optional)
            setInterval(() => {
                this.currentIndex = (this.currentIndex + 1) % this.totalSpheres;
                this.updateCarousel();
            }, 5000);

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    this.prevBtn.click();
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    this.nextBtn.click();
                }
            });
        }

        // Touch/Swipe support for mobile
        this.setupTouchNavigation();
    }

    updateCarousel() {
        this.spheres.forEach((sphere, index) => {
            sphere.classList.remove('center', 'side');
            
            if (index === this.currentIndex) {
                sphere.classList.add('center');
            } else {
                sphere.classList.add('side');
            }
        });

        // Update carousel position (smooth scroll for mobile)
        if (window.innerWidth <= 768) {
            const centerSphere = this.spheres[this.currentIndex];
            if (centerSphere && this.carousel.scrollTo) {
                const sphereWidth = centerSphere.offsetWidth;
                const scrollPosition = this.currentIndex * (sphereWidth + 20) - (this.carousel.offsetWidth - sphereWidth) / 2;
                this.carousel.scrollTo({
                    left: Math.max(0, scrollPosition),
                    behavior: 'smooth'
                });
            }
        }
    }

    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });

        this.carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling
        });

        this.carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Check if horizontal swipe is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next
                    this.nextBtn.click();
                } else {
                    // Swipe right - prev
                    this.prevBtn.click();
                }
            }
            
            isDragging = false;
        });
    }

    addEventListeners() {
        this.spheres.forEach(sphere => {
            sphere.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSphereClick(sphere);
            });

            sphere.addEventListener('mouseenter', () => {
                this.pauseAutoRotation();
            });

            sphere.addEventListener('mouseleave', () => {
                this.resumeAutoRotation();
            });
        });
    }

    setupHoverEffects() {
        this.spheres.forEach(sphere => {
            sphere.addEventListener('mouseenter', () => {
                if (!sphere.classList.contains('center')) {
                    sphere.style.transform = 'scale(1.05) translateY(-5px)';
                }
                sphere.style.filter = 'brightness(1.2) contrast(1.1)';
                
                // Add glow effect
                const sphereFace = sphere.querySelector('.sphere-face');
                if (sphereFace) {
                    sphereFace.style.boxShadow = `
                        inset 0 -50px 100px rgba(0,0,0,0.4),
                        0 0 40px rgba(78, 205, 196, 0.6)
                    `;
                }
            });

            sphere.addEventListener('mouseleave', () => {
                sphere.style.transform = '';
                sphere.style.filter = '';
                
                const sphereFace = sphere.querySelector('.sphere-face');
                if (sphereFace) {
                    sphereFace.style.boxShadow = '';
                }
            });
        });
    }

    setupClickHandlers() {
        this.spheres.forEach((sphere, index) => {
            sphere.addEventListener('click', () => {
                // If clicking on a side card, center it first
                if (!sphere.classList.contains('center')) {
                    this.currentIndex = index;
                    this.updateCarousel();
                    return;
                }
                
                // If clicking on center card, navigate to page
                const page = sphere.getAttribute('data-page');
                if (page) {
                    this.navigateToPage(page, sphere);
                }
            });
        });
    }

    handleSphereClick(sphere) {
        // Add click animation
        sphere.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            sphere.style.transform = '';
        }, 150);

        // Create ripple effect
        this.createRippleEffect(sphere);
    }

    createRippleEffect(sphere) {
        const ripple = document.createElement('div');
        ripple.className = 'sphere-ripple';
        
        const rect = sphere.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(78, 205, 196, 0.4)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.zIndex = '100';
        
        sphere.style.position = 'relative';
        sphere.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    navigateToPage(page, sphere) {
        // Show loading state
        this.showLoadingState(sphere);
        
        // Determine the correct path based on current location
        const currentPath = window.location.pathname;
        let targetPath = '';
        
        // Check if we're currently in a subdirectory (pages folder)
        const isInPagesFolder = currentPath.includes('/pages/');
        
        // Set correct navigation paths
        if (page === 'home') {
            targetPath = isInPagesFolder ? '../index.html' : 'index.html';
        } else {
            targetPath = isInPagesFolder ? `${page}.html` : `pages/${page}.html`;
        }
        
        // Simulate page transition delay
        setTimeout(() => {
            window.location.href = targetPath;
        }, 500);
    }

    showLoadingState(sphere) {
        const sphereFace = sphere.querySelector('.sphere-face');
        if (sphereFace) {
            const originalContent = sphereFace.innerHTML;
            sphereFace.innerHTML = '<div class="loading"></div>';
            
            // Restore content after navigation
            setTimeout(() => {
                sphereFace.innerHTML = originalContent;
            }, 2000);
        }
    }

    pauseAutoRotation() {
        if (this.autoRotationInterval) {
            clearInterval(this.autoRotationInterval);
        }
    }

    resumeAutoRotation() {
        // Resume after a delay
        setTimeout(() => {
            this.autoRotationInterval = setInterval(() => {
                this.currentIndex = (this.currentIndex + 1) % this.totalSpheres;
                this.updateCarousel();
            }, 5000);
        }, 1000);
    }

    // Dynamic sphere creation for different page layouts
    static createSphere(text, page, container) {
        const sphere = document.createElement('div');
        sphere.className = 'sphere';
        sphere.setAttribute('data-page', page);
        
        sphere.innerHTML = `
            <div class="sphere-inner">
                <div class="sphere-face front" data-title="${text}"></div>
            </div>
        `;
        
        container.appendChild(sphere);
        
        // Initialize event listeners for the new sphere
        const navigation = new SphereNavigation();
        navigation.setupSingleSphere(sphere);
        
        return sphere;
    }

    setupSingleSphere(sphere) {
        sphere.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSphereClick(sphere);
            
            const page = sphere.getAttribute('data-page');
            if (page) {
                this.navigateToPage(page, sphere);
            }
        });

        // Add hover effects
        this.setupHoverEffects();
    }
}

// Add CSS for ripple effect and loading
const carouselStyle = document.createElement('style');
carouselStyle.textContent = `
    @keyframes ripple {
        to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }
    
    .sphere-ripple {
        z-index: 100;
    }
    
    .loading {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #4ecdc4;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(carouselStyle);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SphereNavigation();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SphereNavigation;
}
