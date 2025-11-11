// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements that should fade in on scroll
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.work-item, .services-list, .contact-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Modal functionality for portfolio images
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');

    // Open modal when clicking on work items
    document.querySelectorAll('.work-item').forEach(item => {
        const img = item.querySelector('.work-image img');
        if (img) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                modal.classList.add('show');
                modalImg.src = img.src;
                modalImg.alt = img.alt;
                document.body.style.overflow = 'hidden';
            });
        }
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
});
