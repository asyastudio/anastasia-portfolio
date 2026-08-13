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
    const animatedElements = document.querySelectorAll('.work-item, .contact-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Portfolio show more / less
    const worksGrid = document.querySelector('.works-grid');
    const worksToggle = document.querySelector('.works-toggle');
    if (worksGrid && worksToggle) {
        const workItems = Array.from(worksGrid.querySelectorAll('.work-item'));
        const visibleCount = 12;
        workItems.forEach((item, index) => {
            if (index >= visibleCount) {
                item.classList.add('work-item--extra');
            }
        });

        if (workItems.length <= visibleCount) {
            worksToggle.style.display = 'none';
        } else {
            worksToggle.addEventListener('click', () => {
                const isOpen = worksGrid.classList.toggle('show-all');
                worksToggle.textContent = isOpen ? 'Скрыть' : 'Показать больше';
            });
        }
    }

    // Modal functionality
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');
    const modalPrev = document.querySelector('.modal-nav--prev');
    const modalNext = document.querySelector('.modal-nav--next');
    let modalImages = [];
    let modalIndex = 0;
    let portfolioImages = [];

    const updateModalImage = () => {
        if (!modalImages.length) return;
        const current = modalImages[modalIndex];
        modalImg.src = current.src;
        modalImg.alt = current.alt || '';
    };

    const updateModalNav = () => {
        const hasMultiple = modalImages.length > 1;
        if (modalPrev) modalPrev.style.display = hasMultiple ? 'flex' : 'none';
        if (modalNext) modalNext.style.display = hasMultiple ? 'flex' : 'none';
    };

    // the open photo is addressable as #project-slug-N so a link can be shared
    const syncHash = () => {
        const hash = modalImages[modalIndex] && modalImages[modalIndex].hash;
        const url = location.pathname + location.search + (hash ? '#' + hash : '');
        history.replaceState(null, '', url);
    };

    const clearHash = () => {
        history.replaceState(null, '', location.pathname + location.search);
    };

    const openModal = (images, index = 0) => {
        modalImages = images;
        modalIndex = index;
        modal.classList.add('show');
        updateModalImage();
        updateModalNav();
        syncHash();
        document.body.style.overflow = 'hidden';
    };

    // grid images are downscaled previews; data-full points at the full-size file
    const fullSrc = (img) => img.dataset.full
        ? new URL(img.dataset.full, document.baseURI).href
        : img.src;

    const collectPortfolioImages = () => {
        const collected = [];
        const seenInProject = {};
        document.querySelectorAll('.project__strip img, .works-grid .work-item img').forEach(img => {
            if (!img || !img.src) return;
            const project = img.closest('.project');
            let hash = '';
            if (project && project.id) {
                seenInProject[project.id] = (seenInProject[project.id] || 0) + 1;
                hash = project.id + '-' + seenInProject[project.id];
            }
            collected.push({ src: fullSrc(img), alt: img.alt || '', hash });
        });
        portfolioImages = collected;
    };

    const findPortfolioIndex = (src) => {
        if (!src || !portfolioImages.length) return 0;
        const idx = portfolioImages.findIndex(img => img.src === src);
        return idx >= 0 ? idx : 0;
    };

    collectPortfolioImages();

    // Open modal when clicking any project image
    document.querySelectorAll('.project__strip img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal(portfolioImages, findPortfolioIndex(fullSrc(img)));
        });
    });

    // Open modal when clicking on non-carousel portfolio items
    document.querySelectorAll('.work-item:not(.work-item--carousel)').forEach(item => {
        const img = item.querySelector('.work-image img');
        if (!img) return;
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal(portfolioImages, findPortfolioIndex(img.src));
        });
    });

    // Open modal for case images
    document.querySelectorAll('.case-image a').forEach(link => {
        const img = link.querySelector('img');
        const href = link.getAttribute('href') || '';
        const isImageLink = /\.(png|jpe?g|webp|gif|svg)$/i.test(href);
        if (img && isImageLink) {
            link.style.cursor = 'pointer';
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openModal([{ src: href || img.src, alt: img.alt }], 0);
            });
        }
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        modalImages = [];
        modalIndex = 0;
        updateModalNav();
        clearHash();
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    if (modalPrev) {
        modalPrev.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (modalImages.length <= 1) return;
            modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
            updateModalImage();
            syncHash();
        });
    }

    if (modalNext) {
        modalNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (modalImages.length <= 1) return;
            modalIndex = (modalIndex + 1) % modalImages.length;
            updateModalImage();
            syncHash();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
        if (!modal.classList.contains('show') || modalImages.length <= 1) {
            return;
        }
        if (e.key === 'ArrowRight') {
            modalIndex = (modalIndex + 1) % modalImages.length;
            updateModalImage();
            syncHash();
        }
        if (e.key === 'ArrowLeft') {
            modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
            updateModalImage();
            syncHash();
        }
    });

    // open the photo referenced by the address, e.g. /#vig-trans-2
    const openFromHash = () => {
        const hash = location.hash.replace('#', '');
        if (!hash) return;
        const idx = portfolioImages.findIndex(img => img.hash === hash);
        if (idx >= 0) {
            const project = document.getElementById(hash.replace(/-\d+$/, ''));
            if (project) project.scrollIntoView();
            openModal(portfolioImages, idx);
        }
    };

    openFromHash();

    // Scrollable strips
    document.querySelectorAll('.project__strip').forEach((wrap) => {
        const row = wrap.querySelector('.scroll-row');
        const prevBtn = wrap.querySelector('.scroll-control--prev');
        const nextBtn = wrap.querySelector('.scroll-control--next');
        if (!row || !prevBtn || !nextBtn) return;

        const step = () => {
            const first = row.querySelector('figure');
            return first ? first.getBoundingClientRect().width + 6 : row.clientWidth / 4;
        };

        const sync = () => {
            const max = row.scrollWidth - row.clientWidth - 1;
            prevBtn.disabled = row.scrollLeft <= 0;
            nextBtn.disabled = row.scrollLeft >= max;
        };

        prevBtn.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
        row.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        sync();
    });

    // Portfolio carousels
    document.querySelectorAll('.work-slider').forEach((slider) => {
        const slides = slider.querySelectorAll('.work-slide');
        const track = slider.querySelector('.work-slides');
        const prevBtn = slider.querySelector('.work-control--prev');
        const nextBtn = slider.querySelector('.work-control--next');
        const dotsWrap = slider.querySelector('.work-dots');
        if (!slides.length || !track || !prevBtn || !nextBtn || !dotsWrap) {
            return;
        }

        let index = 0;
        const dots = Array.from({ length: slides.length }, (_, i) => {
            const dot = document.createElement('button');
            dot.className = 'work-dot' + (i === 0 ? ' is-active' : '');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Слайд ${i + 1}`);
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                index = i;
                update();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
        };

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            index = (index - 1 + slides.length) % slides.length;
            update();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            index = (index + 1) % slides.length;
            update();
        });
    });

    // Case carousels
    document.querySelectorAll('.case-slider').forEach((slider) => {
        const slides = slider.querySelectorAll('.case-slide');
        const track = slider.querySelector('.case-slides');
        const prevBtn = slider.querySelector('.case-control--prev');
        const nextBtn = slider.querySelector('.case-control--next');
        const dotsWrap = slider.querySelector('.case-dots');
        if (!slides.length || !track || !prevBtn || !nextBtn || !dotsWrap) {
            return;
        }

        const sliderImages = Array.from(slides).map(slide => {
            const img = slide.querySelector('img');
            return { src: img ? img.src : '', alt: img ? img.alt : '' };
        });

        slides.forEach((slide, i) => {
            const img = slide.querySelector('img');
            if (!img) return;
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal(sliderImages, i);
            });
        });

        let index = 0;
        const dots = Array.from({ length: slides.length }, (_, i) => {
            const dot = document.createElement('button');
            dot.className = 'case-dot' + (i === 0 ? ' is-active' : '');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Слайд ${i + 1}`);
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                index = i;
                update();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
        };

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            index = (index - 1 + slides.length) % slides.length;
            update();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            index = (index + 1) % slides.length;
            update();
        });
    });
});
