(function () {
    'use strict';

    const STORAGE_KEY = 'kaBlogReadingList';
    const ARTICLES = {
        'company-formation-guide.html': {
            title: 'Company Formation in Bangladesh: A Step-by-Step Legal Guide',
            category: 'Company Formation',
            date: 'January 10, 2026'
        },
        'commercial-litigation-complete-guide.html': {
            title: 'Commercial Litigation in Bangladesh: A Complete Legal Guide',
            category: 'Commercial Litigation',
            date: 'January 9, 2026'
        },
        'civil-litigation-complete-guide.html': {
            title: 'Civil Litigation in Bangladesh: A Complete Guide',
            category: 'Civil Litigation',
            date: 'January 8, 2026'
        },
        'business-setup-bangladesh.html': {
            title: 'Business Setup in Bangladesh: A Complete Legal Guide',
            category: 'Business Setup',
            date: 'January 7, 2026'
        },
        'banking-litigation-comprehensive.html': {
            title: 'Navigating Banking Litigation in Bangladesh: A Comprehensive Guide',
            category: 'Banking Litigation',
            date: 'January 6, 2026'
        },
        'banking-litigation-guide.html': {
            title: 'Banking Litigation in Bangladesh: A Complete Legal Guide',
            category: 'Banking Litigation',
            date: 'January 5, 2026'
        },
        'aviation-law-bangladesh.html': {
            title: 'Aviation Law in Bangladesh: Navigating Complex Skies',
            category: 'Aviation Law',
            date: 'January 4, 2026'
        },
        'adr-dispute-resolution.html': {
            title: 'Alternative Dispute Resolution (ADR): Fast and Efficient Solutions',
            category: 'Alternative Dispute Resolution',
            date: 'January 3, 2026'
        },
        'admiralty-shipping-law.html': {
            title: 'Admiralty and Shipping Law: Maritime Commerce Guide',
            category: 'Admiralty and Shipping Law',
            date: 'January 2, 2026'
        },
        'administrative-law-bangladesh.html': {
            title: 'Administrative Law in Bangladesh: Challenging Government Decisions',
            category: 'Administrative Law',
            date: 'January 1, 2026'
        }
    };

    function getList() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function setList(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function fallbackFromSlug(slug) {
        const clean = slug.replace('.html', '').replace(/-/g, ' ');
        const title = clean.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        return { title: title, category: 'Legal Article', date: 'Saved Article' };
    }

    function renderList() {
        const grid = document.getElementById('readingListGrid');
        const empty = document.getElementById('readingListEmpty');
        if (!grid || !empty) return;

        const list = getList();
        if (!list.length) {
            grid.innerHTML = '';
            empty.classList.remove('is-hidden');
            return;
        }

        empty.classList.add('is-hidden');
        grid.innerHTML = list.map(function (slug) {
            const data = ARTICLES[slug] || fallbackFromSlug(slug);
            const url = 'blog/' + slug;
            return [
                '<article class="reading-item" data-slug="' + slug + '">',
                '<div class="reading-item-top">',
                '<span class="reading-item-category">' + data.category + '</span>',
                '<span class="reading-item-date">' + data.date + '</span>',
                '</div>',
                '<h3 class="reading-item-title"><a href="' + url + '">' + data.title + '</a></h3>',
                '<div class="reading-item-actions">',
                '<a class="btn btn-gold btn-sm" href="' + url + '"><i class="fas fa-arrow-up-right-from-square me-2"></i>Open</a>',
                '<button type="button" class="btn btn-outline-warning btn-sm" data-remove="' + slug + '"><i class="fas fa-trash me-2"></i>Remove</button>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function removeItem(slug) {
        const list = getList().filter(function (item) { return item !== slug; });
        setList(list);
        renderList();
    }

    function clearAll() {
        setList([]);
        renderList();
    }

    function bindEvents() {
        const grid = document.getElementById('readingListGrid');
        const clearBtn = document.getElementById('clearReadingList');
        if (grid) {
            grid.addEventListener('click', function (event) {
                const btn = event.target.closest('[data-remove]');
                if (!btn) return;
                removeItem(btn.getAttribute('data-remove'));
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', clearAll);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindEvents();
        renderList();
    });
})();
