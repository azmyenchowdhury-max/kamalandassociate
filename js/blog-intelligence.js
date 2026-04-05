(function () {
    'use strict';

    const ARTICLE_DATA = [
        {
            slug: 'company-formation-guide.html',
            title: 'Company Formation in Bangladesh: A Step-by-Step Legal Guide',
            category: 'Company Formation',
            categoryUrl: 'category-company-formation.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Company Formation Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-10',
            image: '../images/blog/company-formation-guide-thumb.webp'
        },
        {
            slug: 'commercial-litigation-complete-guide.html',
            title: 'Commercial Litigation in Bangladesh: A Complete Legal Guide',
            category: 'Commercial Litigation',
            categoryUrl: 'category-commercial-litigation.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Commercial Litigation Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-09',
            image: '../images/blog/commercial-litigation-complete-guide-thumb.webp'
        },
        {
            slug: 'civil-litigation-complete-guide.html',
            title: 'Civil Litigation in Bangladesh: A Complete Guide',
            category: 'Civil Litigation',
            categoryUrl: 'category-civil-litigation.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Civil Litigation Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-08',
            image: '../images/blog/civil-litigation-complete-guide-thumb.webp'
        },
        {
            slug: 'business-setup-bangladesh.html',
            title: 'Business Setup in Bangladesh: A Complete Legal Guide',
            category: 'Business Setup',
            categoryUrl: 'category-business-setup.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Business Setup Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-07',
            image: '../images/blog/business-setup-bangladesh-thumb.webp'
        },
        {
            slug: 'banking-litigation-comprehensive.html',
            title: 'Navigating Banking Litigation in Bangladesh: A Comprehensive Guide',
            category: 'Banking Litigation',
            categoryUrl: 'category-banking-litigation.html',
            author: 'Adv. Mustafa Kamal Chowdhury',
            authorArchive: 'author-chowdhury.html',
            expertiseBadge: 'Banking Litigation Specialist',
            authorImage: '../images/Attorneys/Chowdhury.jpg',
            date: '2026-01-06',
            image: '../images/blog/banking-litigation-comprehensive-thumb.webp'
        },
        {
            slug: 'banking-litigation-guide.html',
            title: 'Banking Litigation in Bangladesh: A Complete Legal Guide',
            category: 'Banking Litigation',
            categoryUrl: 'category-banking-litigation.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Banking Litigation Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-05',
            image: '../images/blog/banking-litigation-guide-thumb.webp'
        },
        {
            slug: 'aviation-law-bangladesh.html',
            title: 'Aviation Law in Bangladesh: Navigating Complex Skies',
            category: 'Aviation Law',
            categoryUrl: 'category-aviation-law.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Aviation Law Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-04',
            image: '../images/blog/aviation-law-bangladesh-thumb.webp'
        },
        {
            slug: 'adr-dispute-resolution.html',
            title: 'Alternative Dispute Resolution (ADR): Fast and Efficient Solutions',
            category: 'Alternative Dispute Resolution',
            categoryUrl: 'category-adr.html',
            author: 'Adv. Nasrin Akter',
            authorArchive: 'author-nasrin-akter.html',
            expertiseBadge: 'ADR Specialist',
            authorImage: '../images/Attorneys/Nasrin.jpg',
            date: '2026-01-03',
            image: '../images/blog/adr-dispute-resolution-thumb.webp'
        },
        {
            slug: 'admiralty-shipping-law.html',
            title: 'Admiralty and Shipping Law: Maritime Commerce Guide',
            category: 'Admiralty and Shipping Law',
            categoryUrl: 'category-admiralty-shipping.html',
            author: 'Adv. Harun Rayhan',
            authorArchive: 'author-harun-rayhan.html',
            expertiseBadge: 'Maritime Law Specialist',
            authorImage: '../images/Attorneys/Harun.jpg',
            date: '2026-01-02',
            image: '../images/blog/admiralty-shipping-law-thumb.webp'
        },
        {
            slug: 'administrative-law-bangladesh.html',
            title: 'Administrative Law in Bangladesh: Challenging Government Decisions',
            category: 'Administrative Law',
            categoryUrl: 'category-administrative-law.html',
            author: 'Adv. Mohammad Mostofa Kamal',
            authorArchive: 'author-kamal.html',
            expertiseBadge: 'Administrative Law Specialist',
            authorImage: '../images/Attorneys/Kamal.jpg',
            date: '2026-01-01',
            image: '../images/blog/administrative-law-bangladesh-thumb.webp'
        }
    ];

    function bySlug(slug) {
        return ARTICLE_DATA.find((x) => x.slug === slug);
    }

    function parseDate(value) {
        const dt = new Date(value + 'T00:00:00');
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    function dateDistanceInDays(a, b) {
        const one = parseDate(a);
        const two = parseDate(b);
        if (!one || !two) return Number.POSITIVE_INFINITY;
        return Math.abs(one.getTime() - two.getTime()) / (1000 * 60 * 60 * 24);
    }

    function safeText(node) {
        return (node && node.textContent ? node.textContent : '').trim();
    }

    function computeWords() {
        const contentRoot = document.querySelector('.article-content');
        if (!contentRoot) return 0;
        const text = safeText(contentRoot);
        if (!text) return 0;
        return text.split(/\s+/).filter(Boolean).length;
    }

    function updateReadingMeta(words) {
        const minutes = Math.max(1, Math.ceil(words / 220));
        const readingTime = document.getElementById('readingTime');
        if (readingTime) readingTime.textContent = String(minutes) + ' min';

        const metaRight = document.querySelector('.article-meta-bar .meta-right');
        if (!metaRight) return;

        let chip = document.getElementById('wordCountMeta');
        if (!chip) {
            chip = document.createElement('span');
            chip.id = 'wordCountMeta';
            chip.className = 'word-count-meta';
            metaRight.insertBefore(chip, metaRight.firstChild);
        }
        chip.innerHTML = '<i class="fas fa-font"></i> ' + words.toLocaleString() + ' words';
    }

    function generateTOC() {
        const toc = document.getElementById('tableOfContents');
        const contentRoot = document.querySelector('.article-content');
        if (!toc || !contentRoot) return [];

        const headings = Array.from(contentRoot.querySelectorAll('h2, h3'));
        toc.innerHTML = '';

        headings.forEach((heading, index) => {
            if (!heading.id) heading.id = 'section-' + (index + 1);
            const li = document.createElement('li');
            if (heading.tagName === 'H3') li.classList.add('toc-h3');
            const a = document.createElement('a');
            a.href = '#' + heading.id;
            a.textContent = safeText(heading);
            li.appendChild(a);
            toc.appendChild(li);
        });

        return headings;
    }

    function upsertBreadcrumb(article) {
        const articleHeader = document.querySelector('.article-header .col-lg-8') || document.querySelector('.article-header');
        if (!articleHeader) return;

        let nav = articleHeader.querySelector('.article-breadcrumb');
        if (!nav) {
            nav = document.createElement('nav');
            nav.className = 'article-breadcrumb';
            nav.setAttribute('aria-label', 'breadcrumb');
            const title = articleHeader.querySelector('.article-title');
            if (title) articleHeader.insertBefore(nav, title);
            else articleHeader.prepend(nav);
        }

        nav.innerHTML = [
            '<ol class="breadcrumb">',
            '<li class="breadcrumb-item"><a href="../blog.html">Blog</a></li>',
            '<li class="breadcrumb-item"><a href="' + article.categoryUrl + '">' + article.category + '</a></li>',
            '<li class="breadcrumb-item active">' + article.title + '</li>',
            '</ol>'
        ].join('');
    }

    function buildJumpLinks(headings) {
        const anchorPoint = document.querySelector('.article-meta-bar');
        if (!anchorPoint) return;

        let jump = document.getElementById('jumpLinks');
        if (!jump) {
            jump = document.createElement('div');
            jump.id = 'jumpLinks';
            jump.className = 'jump-links';
            anchorPoint.insertAdjacentElement('afterend', jump);
        }

        const topHeadings = headings.filter((h) => h.tagName === 'H2').slice(0, 5);
        jump.innerHTML = topHeadings
            .map((h) => '<a href="#' + h.id + '">' + safeText(h) + '</a>')
            .join('');
    }

    function enhanceAuthorCard(article) {
        const card = document.querySelector('.author-profile');
        if (!card) return;

        const image = card.querySelector('.author-profile-img');
        if (image && image.tagName === 'IMG' && (!image.getAttribute('src') || image.getAttribute('src') === '')) {
            image.setAttribute('src', article.authorImage);
        }

        let badge = card.querySelector('.expertise-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'expertise-badge';
            const title = card.querySelector('.author-profile-title');
            if (title) title.insertAdjacentElement('afterend', badge);
            else card.appendChild(badge);
        }
        badge.textContent = buildAttorneyToneBadge(article);

        let archive = card.querySelector('.author-archive-link');
        if (!archive) {
            archive = document.createElement('a');
            archive.className = 'author-archive-link';
            archive.textContent = 'View all articles by ' + article.author;
            card.appendChild(archive);
        }
        archive.setAttribute('href', article.authorArchive);
    }

    function buildAttorneyToneBadge(article) {
        const byAuthor = {
            'Adv. Mohammad Mostofa Kamal': 'Lead Counsel',
            'Adv. Mustafa Kamal Chowdhury': 'Senior Litigation Counsel',
            'Adv. Nasrin Akter': 'Dispute Resolution Counsel',
            'Adv. Harun Rayhan': 'Maritime Counsel'
        };

        const byCategory = {
            'Banking Litigation': 'Banking Recovery and Artha Rin',
            'Civil Litigation': 'Civil Trial Strategy',
            'Commercial Litigation': 'Commercial Dispute Strategy',
            'Company Formation': 'Company Formation and Governance',
            'Business Setup': 'Business Setup and Compliance',
            'Aviation Law': 'Aviation Regulatory Advisory',
            'Alternative Dispute Resolution': 'ADR and Settlement Design',
            'Admiralty and Shipping Law': 'Shipping and Maritime Claims',
            'Administrative Law': 'Constitutional and Administrative Remedies'
        };

        const tone = byAuthor[article.author] || 'Legal Counsel';
        const focus = byCategory[article.category] || article.expertiseBadge;
        return tone + ' · ' + focus;
    }

    function pickRelated(current) {
        const others = ARTICLE_DATA.filter((x) => x.slug !== current.slug);
        const sameCategory = others
            .filter((x) => x.category === current.category)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        const sameAuthor = others
            .filter((x) => x.author === current.author && x.category !== current.category)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        const sameWeekRange = others
            .filter((x) => dateDistanceInDays(x.date, current.date) <= 7)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)));

        const picked = [];
        const addUnique = function (list) {
            list.forEach((x) => {
                if (picked.length < 3 && !picked.find((p) => p.slug === x.slug)) picked.push(x);
            });
        };

        // Phase 3.1 strict order: same category first, then same author, then nearby publication week.
        addUnique(sameCategory);
        addUnique(sameAuthor);
        addUnique(sameWeekRange);

        if (picked.length < 3) {
            const byDate = others.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
            addUnique(byDate);
        }

        return picked.slice(0, 3);
    }

    function renderRelated(current) {
        const host = document.querySelector('.related-articles') || document.createElement('div');
        if (!host.classList.contains('related-articles')) host.className = 'related-articles';

        const related = pickRelated(current);
        host.innerHTML = [
            '<h3>Related Articles</h3>',
            '<div class="row">',
            related.map((item) => [
                '<div class="col-md-4 mb-4">',
                '<div class="related-card">',
                '<img src="' + item.image + '" alt="' + item.title + '" class="related-card-img">',
                '<div class="related-card-body">',
                '<span class="related-card-category">' + item.category + '</span>',
                '<a href="' + item.slug + '" class="text-decoration-none">',
                '<h5 class="related-card-title">' + item.title + '</h5>',
                '</a>',
                '<p class="related-card-date">' + item.date + '</p>',
                '</div>',
                '</div>',
                '</div>'
            ].join('')).join(''),
            '</div>'
        ].join('');

        const mainCol = document.querySelector('.article-content .col-lg-8');
        if (mainCol && !mainCol.contains(host)) mainCol.appendChild(host);
    }

    function renderPrevNext(current) {
        const ordered = ARTICLE_DATA.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
        const index = ordered.findIndex((x) => x.slug === current.slug);
        if (index < 0) return;

        const newer = index > 0 ? ordered[index - 1] : null;
        const older = index < ordered.length - 1 ? ordered[index + 1] : null;

        let nav = document.getElementById('articleChronoNav');
        if (!nav) {
            nav = document.createElement('section');
            nav.id = 'articleChronoNav';
            nav.className = 'article-nav';
        }

        nav.innerHTML = [
            older ? '<a class="article-nav-link prev" href="' + older.slug + '"><span class="dir">Previous Article</span><span class="title">' + older.title + '</span></a>' : '<span></span>',
            newer ? '<a class="article-nav-link next" href="' + newer.slug + '"><span class="dir">Next Article</span><span class="title">' + newer.title + '</span></a>' : '<span></span>'
        ].join('');

        const mainCol = document.querySelector('.article-content .col-lg-8');
        if (mainCol && !mainCol.contains(nav)) {
            const cta = mainCol.querySelector('.article-cta');
            if (cta) cta.insertAdjacentElement('afterend', nav);
            else mainCol.appendChild(nav);
        }
    }

    function applyReadingProgress() {
        const bar = document.getElementById('readingProgress');
        if (!bar) return;
        const refresh = function () {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
            bar.style.width = pct + '%';
        };
        window.addEventListener('scroll', refresh, { passive: true });
        refresh();
    }

    function init() {
        if (!location.pathname.includes('/blog/')) return;
        if (document.body && document.body.dataset.phase3Ready === 'true') return;

        const slug = location.pathname.split('/').pop();
        const article = bySlug(slug);
        if (!article) return;

        const words = computeWords();
        updateReadingMeta(words);
        const headings = generateTOC();
        upsertBreadcrumb(article);
        buildJumpLinks(headings);
        enhanceAuthorCard(article);
        renderRelated(article);
        renderPrevNext(article);
        applyReadingProgress();

        if (document.body) document.body.dataset.phase3Ready = 'true';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
