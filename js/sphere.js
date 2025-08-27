// Sphere Navigation System
class SphereNavigation {
    constructor() {
        this.spheres = document.querySelectorAll('.sphere');
        this.init();
    }

    init() {
        this.addEventListeners();
        this.setupHoverEffects();
        this.setupClickHandlers();
    }

    addEventListeners() {
        this.spheres.forEach(sphere => {
            sphere.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSphereClick(sphere);
            });

            sphere.addEventListener('mouseenter', () => {
                this.pauseRotation(sphere);
            });

            sphere.addEventListener('mouseleave', () => {
                this.resumeRotation(sphere);
            });
        });
    }

    setupHoverEffects() {
        this.spheres.forEach(sphere => {
            sphere.addEventListener('mouseenter', () => {
                sphere.style.transform = 'scale(1.15) rotateY(20deg)';
                sphere.style.filter = 'brightness(1.2) contrast(1.1)';
                
                // Add glow effect
                sphere.style.boxShadow = '0 0 40px rgba(78, 205, 196, 0.6)';
            });

            sphere.addEventListener('mouseleave', () => {
                sphere.style.transform = 'scale(1)';
                sphere.style.filter = 'brightness(1) contrast(1)';
                sphere.style.boxShadow = 'none';
            });
        });
    }

    setupClickHandlers() {
        this.spheres.forEach(sphere => {
            sphere.addEventListener('click', () => {
                const page = sphere.getAttribute('data-page');
                if (page) {
                    this.navigateToPage(page, sphere);
                }
            });
        });
    }

    pauseRotation(sphere) {
        const sphereInner = sphere.querySelector('.sphere-inner');
        if (sphereInner) {
            sphereInner.style.animationPlayState = 'paused';
        }
    }

    resumeRotation(sphere) {
        const sphereInner = sphere.querySelector('.sphere-inner');
        if (sphereInner) {
            sphereInner.style.animationPlayState = 'running';
        }
    }

    handleSphereClick(sphere) {
        // Add click animation
        sphere.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            sphere.style.transform = 'scale(1.15)';
        }, 150);

        setTimeout(() => {
            sphere.style.transform = 'scale(1)';
        }, 300);

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
        const sphereFaces = sphere.querySelectorAll('.sphere-face');
        sphereFaces.forEach(face => {
            face.innerHTML = '<div class="loading"></div>';
        });
    }

    // Dynamic sphere creation for different page layouts
    static createSphere(text, page, container) {
        const sphere = document.createElement('div');
        sphere.className = 'sphere';
        sphere.setAttribute('data-page', page);
        
        sphere.innerHTML = `
            <div class="sphere-inner">
                <div class="sphere-face front">${text}</div>
                <div class="sphere-face back">${text}</div>
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
        });

        sphere.addEventListener('mouseenter', () => {
            this.pauseRotation(sphere);
            sphere.style.transform = 'scale(1.15) rotateY(20deg)';
            sphere.style.filter = 'brightness(1.2) contrast(1.1)';
            sphere.style.boxShadow = '0 0 40px rgba(78, 205, 196, 0.6)';
        });

        sphere.addEventListener('mouseleave', () => {
            this.resumeRotation(sphere);
            sphere.style.transform = 'scale(1)';
            sphere.style.filter = 'brightness(1) contrast(1)';
            sphere.style.boxShadow = 'none';
        });

        sphere.addEventListener('click', () => {
            const page = sphere.getAttribute('data-page');
            if (page) {
                this.navigateToPage(page, sphere);
            }
        });
    }
}

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }
    
    .sphere-ripple {
        z-index: 10;
    }
`;
document.head.appendChild(rippleStyle);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SphereNavigation();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SphereNavigation;
}