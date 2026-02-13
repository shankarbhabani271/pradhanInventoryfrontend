// ============================================
// Counter Animation for KPI Values
// ============================================
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };

    updateCounter();
}

// ============================================
// Initialize Charts
// ============================================
function initializeCharts() {
    // User Role Distribution Donut Chart
    const roleCtx = document.getElementById('roleChart');
    if (roleCtx) {
        new Chart(roleCtx, {
            type: 'doughnut',
            data: {
                labels: ['Admin', 'Procurement Manager', 'Approver', 'Requester', 'Vendor'],
                datasets: [{
                    data: [45, 120, 85, 650, 347],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.9)',   // Indigo
                        'rgba(20, 184, 166, 0.9)',   // Teal
                        'rgba(168, 85, 247, 0.9)',   // Purple
                        'rgba(59, 130, 246, 0.9)',   // Blue
                        'rgba(249, 115, 22, 0.9)'    // Orange
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                family: 'Inter, sans-serif',
                                size: 13,
                                weight: '500'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Inter, sans-serif',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Inter, sans-serif',
                            size: 13
                        },
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Department-wise PR Count Bar Chart
    const prCtx = document.getElementById('prChart');
    if (prCtx) {
        new Chart(prCtx, {
            type: 'bar',
            data: {
                labels: ['IT', 'Finance', 'Operations', 'HR', 'Marketing', 'Sales', 'Admin'],
                datasets: [{
                    label: 'Purchase Requests',
                    data: [450, 320, 580, 210, 290, 410, 180],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.85)',
                        'rgba(20, 184, 166, 0.85)',
                        'rgba(168, 85, 247, 0.85)',
                        'rgba(59, 130, 246, 0.85)',
                        'rgba(249, 115, 22, 0.85)',
                        'rgba(236, 72, 153, 0.85)',
                        'rgba(59, 130, 246, 0.85)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(59, 130, 246, 1)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Inter, sans-serif',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Inter, sans-serif',
                            size: 13
                        },
                        callbacks: {
                            label: function (context) {
                                return `Requests: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(203, 213, 225, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            },
                            color: '#64748b',
                            padding: 10
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12,
                                weight: '500'
                            },
                            color: '#64748b',
                            padding: 10
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
}

// ============================================
// Add Hover Effects and Interactions
// ============================================
function addInteractiveEffects() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.management-button');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();

            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.width = ripple.style.height = '100px';
            ripple.style.left = (e.clientX - rect.left - 50) + 'px';
            ripple.style.top = (e.clientY - rect.top - 50) + 'px';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add smooth scroll for navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
            }
        });
    });
}

// ============================================
// Add CSS Animation for Ripple
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Initialize on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Animate counters
    const counterElements = document.querySelectorAll('.kpi-value[data-target]');

    // Use Intersection Observer for better performance
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counterElements.forEach(element => {
        observer.observe(element);
    });

    // Initialize charts
    initializeCharts();

    // Add interactive effects
    addInteractiveEffects();

    // Add a subtle entrance animation to the page
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    });
});

// ============================================
// Handle Window Resize for Charts
// ============================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Charts will auto-resize due to responsive: true
        console.log('Window resized - charts adjusted');
    }, 250);
});
