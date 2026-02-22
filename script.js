// ============================================
// CTC Portfolio - Scripts
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ---- Mobile Menu Toggle ----
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Mobile dropdown toggle
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(function (dropdown) {
            const link = dropdown.querySelector('.nav-link');
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });

        // Close menu when clicking a dropdown sub-link
        const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                dropdowns.forEach(function (d) { d.classList.remove('active'); });
            });
        });

        // Close menu when clicking a regular nav link
        const navLinks = document.querySelectorAll('.nav-menu > .nav-item:not(.dropdown) > .nav-link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ---- Scroll-based card reveal animation ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedCards = document.querySelectorAll('.use-case-card, .platform-card, .about-tech, .principle');
    animatedCards.forEach(function (card) {
        card.classList.add('animate-on-scroll');
        observer.observe(card);
    });

    // ---- Active nav link highlighting on scroll ----
    const sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        var scrollY = window.scrollY + 100;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            var link = document.querySelector('.nav-link[href="#' + sectionId + '"]');
            if (link) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    highlightNav();
});
