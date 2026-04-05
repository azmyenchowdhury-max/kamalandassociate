(function () {
    'use strict';

    var SITE_URL = 'https://kamalassociates.com.bd';
    var ORG_LOGO = SITE_URL + '/images/logo.png';

    var ARTICLE_DATA = {
        'company-formation-guide.html': {
            title: 'Company Formation in Bangladesh: A Step-by-Step Legal Guide',
            category: 'Company Formation',
            author: 'Adv. Mohammad Mostofa Kamal',
            date: '2026-01-10',
            keywords: 'company formation Bangladesh, RJSC registration, business incorporation, startup legal setup, corporate compliance'
        },
        'commercial-litigation-complete-guide.html': {
            title: 'Commercial Litigation in Bangladesh: A Complete Legal Guide',
            category: 'Commercial Litigation',
            author: 'Adv. Mohammad Mostofa Kamal',
            date: '2026-01-09',
            keywords: 'commercial litigation Bangladesh, business disputes, contract enforcement, trade litigation, commercial court remedies'
        },
        'civil-litigation-complete-guide.html': {
            title: 'Civil Litigation in Bangladesh: A Complete Guide to Resolving Disputes',
            category: 'Civil Litigation',
            author: 'Adv. Mohammad Kabir',
            date: '2026-01-08',
            keywords: 'civil litigation Bangladesh, property disputes, contract claims, injunctions, civil court procedure'
        },
        'business-setup-bangladesh.html': {
            title: 'Business Setup in Bangladesh: A Complete Legal Guide',
            category: 'Business Setup',
            author: 'Adv. Mohammad Mostofa Kamal',
            date: '2026-01-07',
            keywords: 'business setup Bangladesh, business registration, licensing compliance, startup legal requirements, foreign investment'
        },
        'banking-litigation-comprehensive.html': {
            title: 'Navigating Banking Litigation in Bangladesh: A Comprehensive Guide',
            category: 'Banking Litigation',
            author: 'Adv. Mustafa Kamal Chowdhury',
            date: '2026-01-06',
            keywords: 'banking litigation Bangladesh, artha rin adalat, loan recovery suit, cheque dishonor cases, bank dispute resolution'
        },
        'banking-litigation-guide.html': {
            title: 'Banking Litigation in Bangladesh: A Complete Legal Guide',
            category: 'Banking Litigation',
            author: 'Adv. Mohammad Mostofa Kamal',
            date: '2026-01-05',
            keywords: 'banking litigation Bangladesh, debt recovery, financial disputes, artha rin litigation, legal banking compliance'
        },
        'aviation-law-bangladesh.html': {
            title: 'Aviation Law in Bangladesh: Navigating Complex Skies',
            category: 'Aviation Law',
            author: 'Adv. Mohammad Mostofa Kamal',
            date: '2026-01-04',
            keywords: 'aviation law Bangladesh, CAAB compliance, aircraft leasing law, airline regulation, aviation dispute resolution'
        },
        'adr-dispute-resolution.html': {
            title: 'Alternative Dispute Resolution (ADR): Fast and Efficient Solutions',
            category: 'Alternative Dispute Resolution',
            author: 'Adv. Nasrin Akter',
            date: '2026-01-03',
            keywords: 'ADR Bangladesh, arbitration and mediation, dispute resolution law, settlement strategies, alternative dispute process'
        },
        'admiralty-shipping-law.html': {
            title: 'Admiralty and Shipping Law: Maritime Commerce Guide',
            category: 'Admiralty and Shipping Law',
            author: 'Adv. Harun Rayhan',
            date: '2026-01-02',
            keywords: 'admiralty law Bangladesh, shipping law, maritime claims, ship arrest proceedings, cargo dispute legal advice'
        },
        'administrative-law-bangladesh.html': {
            title: 'Administrative Law in Bangladesh: Challenging Government Decisions',
            category: 'Administrative Law',
            author: 'Adv. Mohammad Mostofa Kamal',
            date: '2026-01-01',
            keywords: 'administrative law Bangladesh, writ petition, judicial review, constitutional remedies, government decision challenge'
        }
    };

    function slug() {
        return location.pathname.split('/').pop();
    }

    function articleData() {
        return ARTICLE_DATA[slug()] || null;
    }

    function cleanText(input) {
        return String(input || '').replace(/\s+/g, ' ').trim();
    }

    function ensureMeta(name, content, isProperty) {
        if (!content) return;
        var selector = isProperty ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
        var meta = document.querySelector(selector);
        if (!meta) {
            meta = document.createElement('meta');
            if (isProperty) meta.setAttribute('property', name);
            else meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    function canonicalUrl() {
        var path = location.pathname.replace(/\/+/g, '/');
        return SITE_URL + path;
    }

    function ensureCanonical() {
        var href = canonicalUrl();
        var link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', href);
    }

    function inferDescription() {
        var p = document.querySelector('.article-content p');
        if (!p) return '';
        return cleanText(p.textContent).slice(0, 158);
    }

    function inferImage() {
        var img = document.querySelector('.article-hero-media') || document.querySelector('.article-content img');
        if (!img) return '';
        var src = img.getAttribute('src') || '';
        if (/^https?:\/\//i.test(src)) return src;
        if (!src) return '';
        return SITE_URL + src.replace(/^\.\./, '');
    }

    function localHeroBySlug(currentSlug) {
        var map = {
            'company-formation-guide.html': '../images/blog/company-formation-guide-hero.webp',
            'commercial-litigation-complete-guide.html': '../images/blog/commercial-litigation-complete-guide-hero.webp',
            'civil-litigation-complete-guide.html': '../images/blog/civil-litigation-complete-guide-hero.webp',
            'business-setup-bangladesh.html': '../images/blog/business-setup-bangladesh-hero.webp',
            'banking-litigation-comprehensive.html': '../images/blog/banking-litigation-comprehensive-hero.webp',
            'banking-litigation-guide.html': '../images/blog/banking-litigation-guide-hero.webp',
            'aviation-law-bangladesh.html': '../images/blog/aviation-law-bangladesh-hero.webp',
            'adr-dispute-resolution.html': '../images/blog/adr-dispute-resolution-hero.webp',
            'admiralty-shipping-law.html': '../images/blog/admiralty-shipping-law-hero.webp',
            'administrative-law-bangladesh.html': '../images/blog/administrative-law-bangladesh-hero.webp'
        };
        return map[currentSlug] || '';
    }

    function preferLocalHeroImage(currentSlug) {
        var local = localHeroBySlug(currentSlug);
        if (!local) return;

        var hero = document.querySelector('.article-hero-media');
        if (!hero) return;

        var remote = hero.getAttribute('src') || '';
        if (!remote || remote === local) return;

        hero.setAttribute('data-fallback-src', remote);
        hero.setAttribute('src', local);
        hero.addEventListener('error', function onHeroError() {
            var fallback = hero.getAttribute('data-fallback-src');
            if (fallback) hero.setAttribute('src', fallback);
            hero.removeEventListener('error', onHeroError);
        });
    }

    function ensureMetaAndOpenGraph(article) {
        var title = cleanText((article && article.title) || document.title.replace(/\s*\|\s*Kamal.*$/i, ''));
        var description = (document.querySelector('meta[name="description"]') || {}).content || inferDescription();
        description = cleanText(description);
        var image = ((document.querySelector('meta[property="og:image"]') || {}).content || inferImage());
        var url = canonicalUrl();

        if (title) document.title = title + ' | Kamal & Associates';

        ensureMeta('description', description, false);
        ensureMeta('keywords', (article && article.keywords) || '', false);
        ensureMeta('author', (article && article.author) || '', false);

        ensureMeta('og:title', title, true);
        ensureMeta('og:description', description, true);
        ensureMeta('og:image', image, true);
        ensureMeta('og:type', 'article', true);
        ensureMeta('og:url', url, true);

        ensureMeta('twitter:card', 'summary_large_image', false);
        ensureMeta('twitter:title', title, false);
        ensureMeta('twitter:description', description, false);
        ensureMeta('twitter:image', image, false);
    }

    function buildBreadcrumbItems(title) {
        return [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/index.html' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE_URL + '/blog.html' },
            { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl() }
        ];
    }

    function ensureSchemaTag(id, payload) {
        var script = document.getElementById(id);
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = id;
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(payload);
    }

    function ensureSchema(article) {
        var title = cleanText((article && article.title) || document.title.replace(/\s*\|\s*Kamal.*$/i, ''));
        var description = cleanText(((document.querySelector('meta[name="description"]') || {}).content || ''));
        var image = ((document.querySelector('meta[property="og:image"]') || {}).content || inferImage());
        var author = (article && article.author) || cleanText(((document.querySelector('meta[name="author"]') || {}).content || ''));
        var published = (article && article.date) || cleanText(((document.querySelector('meta[name="publish_date"]') || {}).content || ''));

        var articleSchema = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            mainEntityOfPage: canonicalUrl(),
            headline: title,
            description: description,
            image: image,
            datePublished: published ? (published + 'T09:00:00+06:00') : undefined,
            dateModified: published ? (published + 'T09:00:00+06:00') : undefined,
            author: {
                '@type': 'Person',
                name: author,
                url: SITE_URL + '/attorneys.html'
            },
            publisher: {
                '@type': 'Organization',
                name: 'Kamal & Associates',
                url: SITE_URL,
                logo: {
                    '@type': 'ImageObject',
                    url: ORG_LOGO
                }
            }
        };

        var personSchema = {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: author,
            jobTitle: 'Advocate',
            worksFor: {
                '@type': 'Organization',
                name: 'Kamal & Associates'
            },
            url: SITE_URL + '/attorneys.html'
        };

        var orgSchema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Kamal & Associates',
            url: SITE_URL,
            logo: ORG_LOGO,
            email: 'info@kamalassociates.com.bd',
            sameAs: [
                'https://www.linkedin.com/',
                'https://www.facebook.com/'
            ]
        };

        var breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: buildBreadcrumbItems(title)
        };

        ensureSchemaTag('phase6-schema-article', articleSchema);
        ensureSchemaTag('phase6-schema-author', personSchema);
        ensureSchemaTag('phase6-schema-org', orgSchema);
        ensureSchemaTag('phase6-schema-breadcrumb', breadcrumbSchema);
    }

    function replaceTag(node, newTag) {
        var replacement = document.createElement(newTag);
        var attrs = node.attributes;
        for (var i = 0; i < attrs.length; i++) {
            replacement.setAttribute(attrs[i].name, attrs[i].value);
        }
        replacement.innerHTML = node.innerHTML;
        node.parentNode.replaceChild(replacement, node);
        return replacement;
    }

    function enforceHeadingHierarchy() {
        var root = document.querySelector('.article-content .col-lg-8') || document.querySelector('.article-content');
        if (!root) return;

        var h1s = document.querySelectorAll('h1');
        if (h1s.length > 1) {
            for (var i = 1; i < h1s.length; i++) {
                replaceTag(h1s[i], 'h2');
            }
        }

        var headings = Array.prototype.slice.call(root.querySelectorAll('h2, h3, h4'));
        var prevLevel = 1;

        headings.forEach(function (h) {
            var level = Number(h.tagName.slice(1));
            if (level < 2) level = 2;
            if (prevLevel >= 2 && level - prevLevel > 1) {
                level = prevLevel + 1;
            }
            if (Number(h.tagName.slice(1)) !== level) {
                h = replaceTag(h, 'h' + level);
            }
            prevLevel = level;
        });
    }

    function ensureImageAltAndLazy(article) {
        var images = document.querySelectorAll('img');
        images.forEach(function (img, index) {
            var alt = cleanText(img.getAttribute('alt'));
            if (!alt) {
                if (img.classList.contains('article-hero-media')) {
                    img.setAttribute('alt', article.category + ' legal guide illustration');
                } else {
                    img.setAttribute('alt', 'Kamal and Associates ' + article.category + ' article image ' + (index + 1));
                }
            }

            var isHero = img.classList.contains('article-hero-media');
            if (isHero) {
                img.setAttribute('loading', 'eager');
                img.setAttribute('fetchpriority', 'high');
            } else {
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
                img.setAttribute('fetchpriority', 'low');
            }

            var src = img.getAttribute('src') || '';
            if (/images\.unsplash\.com/.test(src) && !/fm=webp/.test(src)) {
                img.setAttribute('data-fallback-src', src);
                var connector = src.indexOf('?') >= 0 ? '&' : '?';
                img.setAttribute('src', src + connector + 'auto=format&fit=max&fm=webp&q=78');
                img.addEventListener('error', function onError() {
                    var fallback = img.getAttribute('data-fallback-src');
                    if (fallback) img.setAttribute('src', fallback);
                    img.removeEventListener('error', onError);
                });
            }
        });
    }

    function ensureExternalLinkAttrs() {
        var links = document.querySelectorAll('a[href]');
        links.forEach(function (a) {
            var href = a.getAttribute('href') || '';
            if (!/^https?:\/\//i.test(href)) return;
            if (href.indexOf('kamalassociates.com.bd') !== -1) return;
            a.setAttribute('rel', 'external noopener noreferrer');
            a.setAttribute('target', '_blank');
        });
    }

    function strategicInternalLinks(article) {
        return [
            { href: '../practice-areas.html', label: article.category + ' legal services' },
            { href: '../service-areas.html', label: 'service areas across Bangladesh' },
            { href: '../consultation.html', label: 'book a free legal consultation' },
            { href: '../attorneys.html', label: 'meet our attorneys' },
            { href: '../contact.html', label: 'contact our legal team' }
        ];
    }

    function ensureInternalLinkBlock(article) {
        if (document.getElementById('phase6InternalLinks')) return;

        var root = document.querySelector('.article-content .col-lg-8');
        if (!root) return;

        var block = document.createElement('section');
        block.id = 'phase6InternalLinks';
        block.className = 'article-callout phase6-internal-links';

        var links = strategicInternalLinks(article)
            .map(function (item) { return '<li><a href="' + item.href + '">' + item.label + '</a></li>'; })
            .join('');

        block.innerHTML = [
            '<h5><i class="fas fa-link me-2" aria-hidden="true"></i>Helpful Internal Links</h5>',
            '<p>For deeper guidance, explore these related resources from Kamal & Associates:</p>',
            '<ul class="phase6-links-list">' + links + '</ul>'
        ].join('');

        var author = root.querySelector('.author-profile');
        if (author) author.insertAdjacentElement('beforebegin', block);
        else root.appendChild(block);
    }

    function ensureAuthorityExternalLinks() {
        var root = document.querySelector('.article-content .col-lg-8');
        if (!root || document.getElementById('phase6AuthorityLinks')) return;

        var block = document.createElement('section');
        block.id = 'phase6AuthorityLinks';
        block.className = 'article-callout phase6-authority-links';
        block.innerHTML = [
            '<h5><i class="fas fa-book-open me-2" aria-hidden="true"></i>Authority Resources</h5>',
            '<p>For statutory reference and official legal materials, consult:</p>',
            '<ul class="phase6-links-list">',
            '<li><a href="https://bdlaws.minlaw.gov.bd" rel="external noopener noreferrer" target="_blank">Bangladesh Laws (Ministry of Law)</a></li>',
            '<li><a href="https://supremecourt.gov.bd" rel="external noopener noreferrer" target="_blank">Supreme Court of Bangladesh</a></li>',
            '<li><a href="https://mof.portal.gov.bd" rel="external noopener noreferrer" target="_blank">Ministry of Finance</a></li>',
            '</ul>'
        ].join('');

        var internal = document.getElementById('phase6InternalLinks');
        if (internal) internal.insertAdjacentElement('afterend', block);
        else root.appendChild(block);
    }

    function ensureKeywordPlacement(article) {
        var root = document.querySelector('.article-content .col-lg-8');
        if (!root) return;

        var firstParagraph = root.querySelector('p');
        if (!firstParagraph) return;

        var firstWords = cleanText(firstParagraph.textContent).toLowerCase();
        var keyword = (article.category + ' Bangladesh').toLowerCase();

        if (firstWords.indexOf(keyword) === -1) {
            var lead = document.createElement('p');
            lead.className = 'phase6-lead-keyword';
            lead.textContent = 'This ' + article.category + ' Bangladesh guide explains practical legal strategy, risk points, and the most effective next steps for clients.';
            firstParagraph.insertAdjacentElement('afterend', lead);
        }
    }

    function optimizeGoogleFonts() {
        var fontLink = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
        if (!fontLink) return;
        if (!fontLink.getAttribute('href').match(/display=swap/)) {
            var href = fontLink.getAttribute('href');
            var connector = href.indexOf('?') >= 0 ? '&' : '?';
            fontLink.setAttribute('href', href + connector + 'display=swap');
        }
    }

    function init() {
        if (!location.pathname.includes('/blog/')) return;
        if (document.body && document.body.dataset.phase6Ready === 'true') return;

        var article = articleData();
        if (!article) return;

        preferLocalHeroImage(slug());

        ensureCanonical();
        ensureMetaAndOpenGraph(article);
        ensureSchema(article);
        enforceHeadingHierarchy();
        ensureImageAltAndLazy(article);
        ensureExternalLinkAttrs();
        ensureInternalLinkBlock(article);
        ensureAuthorityExternalLinks();
        ensureKeywordPlacement(article);
        optimizeGoogleFonts();

        if (document.body) document.body.dataset.phase6Ready = 'true';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
