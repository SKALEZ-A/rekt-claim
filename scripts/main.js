/*
 * REKT Website - Main JavaScript
 * Interactive features and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initMobileNavigation();
    initSmoothScrolling();
    initNavbarScroll();
    initFAQAccordion();
    initScrollAnimations();
    initCopyToClipboard();
});

/* ==============================================
   MOBILE NAVIGATION
   ============================================== */

function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) ||
                                navMenu.contains(event.target);

        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

/* ==============================================
   SMOOTH SCROLLING
   ============================================== */

function initSmoothScrolling() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            const targetElement = document.querySelector(href);

            if (targetElement) {
                e.preventDefault();

                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update active navigation link
                updateActiveNavLink(href);
            }
        });
    });
}

/* ==============================================
   NAVBAR SCROLL EFFECTS
   ============================================== */

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class for styling
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active navigation link based on scroll position
        updateActiveNavLinkOnScroll();

        lastScrollTop = scrollTop;
    });
}

/* ==============================================
   ACTIVE NAVIGATION LINKS
   ============================================== */

function updateActiveNavLink(activeHref) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');

        if (link.getAttribute('href') === activeHref) {
            link.classList.add('active');
        }
    });
}

function updateActiveNavLinkOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.pageYOffset + document.querySelector('.navbar').offsetHeight + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/* ==============================================
   FAQ ACCORDION
   ============================================== */

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', function() {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current FAQ item
            item.classList.toggle('active');
        });
    });
}

/* ==============================================
   SCROLL ANIMATIONS
   ============================================== */

function initScrollAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Special handling for feature cards
                if (entry.target.classList.contains('feature-card')) {
                    const cards = entry.target.parentElement.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe elements for fun animation
    const animateElements = document.querySelectorAll('.section-title, .hero-content, .about-content, .features-grid, .roadmap-timeline, .community-links, .buy-steps, .faq-accordion');
    animateElements.forEach((element, index) => {
        observer.observe(element);
        // Add staggered animation delay for more fun effect
        element.style.animationDelay = `${index * 0.1}s`;
    });

    // Add floating animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('animate-float');
    });

    // Add glow animation to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((btn, index) => {
        btn.style.animationDelay = `${index * 0.3}s`;
        btn.classList.add('animate-glow');
    });
}

/* ==============================================
   COPY TO CLIPBOARD
   ============================================== */

function initCopyToClipboard() {
    // Add copy functionality to token addresses and contract info
    const copyElements = document.querySelectorAll('[data-copy]');

    copyElements.forEach(element => {
        element.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-copy');
            const originalText = this.textContent;

            // Copy to clipboard
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show feedback
                this.textContent = 'Copied!';
                this.classList.add('copied');

                // Reset after 2 seconds
                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    });
}

/* ==============================================
   UTILITY FUNCTIONS
   ============================================== */

// Throttle function for scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ==============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================== */

// Lazy load images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Preload critical resources
function preloadCriticalResources() {
    // Preload hero background image
    const heroImg = new Image();
    heroImg.src = 'bg.jpeg';

    // Preload logo
    const logoImg = new Image();
    logoImg.src = 'pfp.jpg';
}

/* ==============================================
   ERROR HANDLING
   ============================================== */

// Global error handler
window.addEventListener('error', function(event) {
    console.error('JavaScript Error:', event.error);
    // You can add error reporting here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    // You can add error reporting here
});

/* ==============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================== */

// Keyboard navigation for custom elements
document.addEventListener('keydown', function(event) {
    // Handle Enter key for FAQ accordion
    if (event.key === 'Enter' && event.target.classList.contains('faq-question')) {
        event.target.click();
    }

    // Handle Escape key to close mobile menu
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});

// Focus management for better accessibility
function initFocusManagement() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-blue);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });

    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

/* ==============================================
   INITIALIZATION
   ============================================== */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initFocusManagement();
    initLazyLoading();
    preloadCriticalResources();
});

// Initialize animations when everything is loaded
window.addEventListener('load', function() {
    // Add loaded class to body for any load-based animations
    document.body.classList.add('loaded');
});

// Add copy functionality for contract address
function copyContractAddress() {
    const contractAddress = '0xdd3B11eF34cd511a2DA159034a05fcb94D806686';
    navigator.clipboard.writeText(contractAddress).then(() => {
        alert('Contract address copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy contract address');
    });
}

// Make copy function globally available
window.copyContractAddress = copyContractAddress;
