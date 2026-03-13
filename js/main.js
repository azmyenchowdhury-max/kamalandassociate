/* ===================================
   Kamal & Associates - Main JavaScript
   Pure HTML/CSS/JS/Bootstrap Version
   Created by: Azmyen Mustafa Chowdhury
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize AOS when available; otherwise force AOS-marked content visible.
    if (window.AOS && typeof window.AOS.init === 'function') {
        document.documentElement.classList.add('aos-enabled');
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    } else {
        document.querySelectorAll('[data-aos]').forEach((el) => {
            el.classList.add('aos-animate');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    // ===== Navbar Scroll Effect =====
    const navbar = document.querySelector('.navbar');

    function loadChatbotWidget() {
        const chatbotAlreadyLoaded = Array.from(document.scripts).some((existingScript) => {
            const src = existingScript.getAttribute('src') || '';
            return /(^|\/)chatbot\.js($|\?)/.test(src);
        });

        if (chatbotAlreadyLoaded) return;

        const script = document.createElement('script');
        script.src = 'chatbot.js';
        script.defer = true;
        document.body.appendChild(script);
    }

    loadChatbotWidget();

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function updateNavbarPhoneLabel() {
        const phoneLinks = document.querySelectorAll('.phone-number');
        if (!phoneLinks.length) return;

        const isMediumWidth = window.innerWidth >= 992 && window.innerWidth <= 1260;

        phoneLinks.forEach((link) => {
            if (!link.dataset.fullText) {
                link.dataset.fullText = (link.textContent || '').trim();
            }

            const fullText = link.dataset.fullText;
            if (!fullText) return;

            link.textContent = isMediumWidth ? fullText.replace(/\s+/g, '') : fullText;
        });
    }

    function injectMobileConsultationCta() {
        const navList = document.querySelector('#mainNav .navbar-nav');
        if (!navList) return;
        if (navList.querySelector('.nav-mobile-cta-item')) return;

        const sourceCta = document.querySelector('.action-zone .btn-gold');
        const ctaHref = (sourceCta && sourceCta.getAttribute('href')) || 'consultation.html';
        const ctaLabel = (sourceCta && sourceCta.textContent && sourceCta.textContent.trim()) || 'Free Consultation';

        const li = document.createElement('li');
        li.className = 'nav-item nav-mobile-cta-item';

        const link = document.createElement('a');
        link.className = 'nav-link nav-mobile-cta-link';
        link.href = ctaHref;
        link.innerHTML = '<i class="fas fa-calendar-check me-2"></i>' + ctaLabel;

        li.appendChild(link);
        navList.insertBefore(li, navList.firstChild);

        link.addEventListener('click', function () {
            const collapseEl = document.getElementById('mainNav');
            if (!collapseEl || !collapseEl.classList.contains('show')) return;

            if (window.bootstrap && window.bootstrap.Collapse) {
                const instance = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
                instance.hide();
            } else {
                collapseEl.classList.remove('show');
            }
        });
    }

    injectMobileConsultationCta();
    updateNavbarPhoneLabel();

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();
    window.addEventListener('resize', updateNavbarPhoneLabel);

    initBlogSearch();

    function initBlogSearch() {
        const searchInput = document.getElementById('blogSearchInput');
        const searchButton = document.getElementById('blogSearchButton');
        const suggestionsList = document.getElementById('blogSearchSuggestions');
        const statusElement = document.getElementById('blogSearchStatus');
        const clearButton = document.getElementById('blogSearchClear');
        const emptyState = document.getElementById('blogSearchEmpty');
        const categoryLinks = Array.from(document.querySelectorAll('.blog-category-link'));
        const cardColumns = Array.from(document.querySelectorAll('.blog-card-column'));

        if (!searchInput || !searchButton || !suggestionsList || !statusElement || !clearButton || !emptyState || !categoryLinks.length || !cardColumns.length) {
            return;
        }

        let currentSearchTerm = '';
        let activeCategory = 'all';
        let visibleMatches = [];
        let autocompleteMatches = [];
        let activeSuggestionIndex = -1;

        const totalArticles = cardColumns.length;
        const categoryLabels = new Map();

        categoryLinks.forEach((link) => {
            const key = normalizeBlogText(link.dataset.blogCategory || 'all') || 'all';
            const label = Array.from(link.childNodes)
                .filter((node) => node.nodeType === Node.TEXT_NODE)
                .map((node) => node.textContent)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim() || 'All Articles';

            categoryLabels.set(key, label);
        });

        const blogPosts = cardColumns.map((column, index) => {
            const card = column.querySelector('.blog-card');
            const titleEl = column.querySelector('h3 a');
            const categoryEl = column.querySelector('.badge');
            const excerptEl = column.querySelector('.blog-excerpt');
            const metaSpans = Array.from(column.querySelectorAll('.blog-meta span'));
            const modalTarget = card ? card.getAttribute('data-bs-target') || '' : '';
            const modal = modalTarget ? document.querySelector(modalTarget) : null;
            const categoryKey = normalizeBlogText(column.dataset.blogCategory || categoryEl?.textContent || 'all') || 'all';
            const title = cleanText(titleEl?.textContent);
            const excerpt = cleanText(excerptEl?.textContent);
            const author = cleanText(metaSpans[1]?.textContent);
            const date = cleanText(metaSpans[0]?.textContent);
            const categoryLabel = categoryLabels.get(categoryKey) || cleanText(categoryEl?.textContent) || 'Article';
            const modalText = cleanText(modal?.textContent);
            const searchSource = [title, excerpt, author, date, categoryLabel, modalText].join(' ');
            const normalizedSearch = normalizeBlogText(searchSource);

            [categoryEl, titleEl, excerptEl].forEach((element) => {
                if (element && !element.dataset.searchOriginalHtml) {
                    element.dataset.searchOriginalHtml = element.innerHTML;
                }
            });

            return {
                index,
                column,
                card,
                modal,
                title,
                excerpt,
                author,
                date,
                categoryKey,
                categoryLabel,
                searchText: normalizedSearch,
                titleText: normalizeBlogText(title),
                categoryText: normalizeBlogText(categoryLabel),
                authorText: normalizeBlogText(author),
                tokens: Array.from(new Set(normalizedSearch.split(' ').filter((token) => token.length >= 3))).slice(0, 220),
                highlightElements: [categoryEl, titleEl, excerptEl].filter(Boolean)
            };
        });

        hydrateSearchStateFromUrl();
        renderSearchState(false);

        function normalizeBlogText(text) {
            return String(text || '')
                .toLowerCase()
                .replace(/&/g, ' and ')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function cleanText(text) {
            return String(text || '').replace(/\s+/g, ' ').trim();
        }

        function escapeRegExp(value) {
            return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function maxAllowedDistance(length) {
            if (length <= 4) return 1;
            if (length <= 7) return 2;
            return 3;
        }

        function levenshteinDistance(source, target) {
            const a = String(source || '');
            const b = String(target || '');
            if (!a.length) return b.length;
            if (!b.length) return a.length;

            const prev = new Array(b.length + 1);
            const curr = new Array(b.length + 1);

            for (let j = 0; j <= b.length; j += 1) {
                prev[j] = j;
            }

            for (let i = 1; i <= a.length; i += 1) {
                curr[0] = i;
                for (let j = 1; j <= b.length; j += 1) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    curr[j] = Math.min(
                        prev[j] + 1,
                        curr[j - 1] + 1,
                        prev[j - 1] + cost
                    );
                }

                for (let j = 0; j <= b.length; j += 1) {
                    prev[j] = curr[j];
                }
            }

            return prev[b.length];
        }

        function getFuzzyTokenScore(token, post) {
            if (token.length < 3 || !post.tokens.length) return 0;

            const threshold = maxAllowedDistance(token.length);
            let bestDistance = Number.POSITIVE_INFINITY;

            post.tokens.forEach((candidate) => {
                if (Math.abs(candidate.length - token.length) > threshold + 1) return;

                const distance = levenshteinDistance(token, candidate);
                if (distance < bestDistance) {
                    bestDistance = distance;
                }
            });

            if (!Number.isFinite(bestDistance) || bestDistance > threshold) {
                return 0;
            }

            return Math.max(1, 8 - bestDistance * 2);
        }

        function getPostScore(post, rawTerm) {
            const term = normalizeBlogText(rawTerm);
            if (!term) return 1;

            const tokens = term.split(' ').filter(Boolean);
            let score = 0;

            if (post.searchText.includes(term)) score += 24;
            if (post.titleText.includes(term)) score += 36;
            if (post.categoryText.includes(term)) score += 18;
            if (post.authorText.includes(term)) score += 12;

            tokens.forEach((token) => {
                if (post.searchText.includes(token)) score += 5;
                if (post.titleText.includes(token)) score += 10;
                if (post.categoryText.includes(token)) score += 8;
                if (post.authorText.includes(token)) score += 6;
                score += getFuzzyTokenScore(token, post);
            });

            return score;
        }

        function getCategoryLabel(categoryKey) {
            return categoryLabels.get(categoryKey) || 'All Articles';
        }

        function getFilteredMatches(rawTerm) {
            const scopedPosts = blogPosts.filter((post) => activeCategory === 'all' || post.categoryKey === activeCategory);
            const term = normalizeBlogText(rawTerm);

            if (!term) {
                return scopedPosts;
            }

            return scopedPosts
                .map((post) => ({ post, score: getPostScore(post, rawTerm) }))
                .filter((entry) => entry.score > 0)
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.post.index - b.post.index;
                })
                .map((entry) => entry.post);
        }

        function updateHighlightedText(element, rawTerm) {
            if (!element) return;

            const originalHtml = element.dataset.searchOriginalHtml || element.innerHTML;
            const terms = Array.from(new Set(normalizeBlogText(rawTerm).split(' ').filter((token) => token.length >= 2)));

            if (!terms.length) {
                element.innerHTML = originalHtml;
                return;
            }

            const pattern = terms.map((token) => escapeRegExp(token)).join('|');
            if (!pattern) {
                element.innerHTML = originalHtml;
                return;
            }

            const regex = new RegExp(`(${pattern})`, 'ig');
            element.innerHTML = originalHtml.replace(regex, '<mark class="blog-search-highlight">$1</mark>');
        }

        function hideSuggestions() {
            suggestionsList.hidden = true;
            suggestionsList.innerHTML = '';
            autocompleteMatches = [];
            activeSuggestionIndex = -1;
            searchInput.setAttribute('aria-expanded', 'false');
            searchInput.removeAttribute('aria-activedescendant');
        }

        function setActiveSuggestion(nextIndex) {
            if (!autocompleteMatches.length) {
                activeSuggestionIndex = -1;
                return;
            }

            const total = autocompleteMatches.length;
            activeSuggestionIndex = (nextIndex + total) % total;

            Array.from(suggestionsList.querySelectorAll('.blog-search-suggestion')).forEach((option, index) => {
                const isActive = index === activeSuggestionIndex;
                option.classList.toggle('active', isActive);
                option.setAttribute('aria-selected', isActive ? 'true' : 'false');

                if (isActive) {
                    searchInput.setAttribute('aria-activedescendant', option.id);
                    option.scrollIntoView({ block: 'nearest' });
                }
            });
        }

        function openBlogPost(post) {
            if (!post?.modal) return;

            hideSuggestions();

            if (window.bootstrap && window.bootstrap.Modal) {
                window.bootstrap.Modal.getOrCreateInstance(post.modal).show();
                return;
            }

            post.card?.click();
        }

        function renderSuggestions() {
            const term = normalizeBlogText(currentSearchTerm);
            if (!term) {
                hideSuggestions();
                return;
            }

            autocompleteMatches = getFilteredMatches(currentSearchTerm).slice(0, 6);
            activeSuggestionIndex = -1;

            if (!autocompleteMatches.length) {
                hideSuggestions();
                return;
            }

            suggestionsList.innerHTML = '';

            autocompleteMatches.forEach((post, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.id = `blogSearchSuggestion-${index}`;
                button.className = 'blog-search-suggestion';
                button.setAttribute('role', 'option');
                button.setAttribute('aria-selected', 'false');

                const title = document.createElement('span');
                title.className = 'blog-search-suggestion-title';
                title.textContent = post.title;

                const meta = document.createElement('span');
                meta.className = 'blog-search-suggestion-meta';
                meta.textContent = `${post.categoryLabel} · ${post.author || post.date}`;

                button.appendChild(title);
                button.appendChild(meta);

                button.addEventListener('mouseenter', () => {
                    setActiveSuggestion(index);
                });

                button.addEventListener('click', () => {
                    openBlogPost(post);
                });

                suggestionsList.appendChild(button);
            });

            suggestionsList.hidden = false;
            searchInput.setAttribute('aria-expanded', 'true');
        }

        function syncUrlState() {
            if (!window.history || typeof window.history.replaceState !== 'function') return;

            const url = new URL(window.location.href);
            const trimmedTerm = currentSearchTerm.trim();

            if (trimmedTerm) {
                url.searchParams.set('search', trimmedTerm);
            } else {
                url.searchParams.delete('search');
            }

            if (activeCategory !== 'all') {
                url.searchParams.set('category', activeCategory);
            } else {
                url.searchParams.delete('category');
            }

            window.history.replaceState({}, '', url);
        }

        function hydrateSearchStateFromUrl() {
            const params = new URLSearchParams(window.location.search);
            const urlTerm = params.get('search') || '';
            const urlCategory = normalizeBlogText(params.get('category') || 'all') || 'all';

            currentSearchTerm = urlTerm;
            activeCategory = categoryLabels.has(urlCategory) ? urlCategory : 'all';
            searchInput.value = currentSearchTerm;
        }

        function updateStatus(matches) {
            const trimmedTerm = currentSearchTerm.trim();

            if (!trimmedTerm && activeCategory === 'all') {
                statusElement.textContent = `Showing all ${totalArticles} articles.`;
                return;
            }

            let message = `Showing ${matches.length} of ${totalArticles} article${totalArticles === 1 ? '' : 's'}`;

            if (trimmedTerm) {
                message += ` for "${trimmedTerm}"`;
            }

            if (activeCategory !== 'all') {
                message += ` in ${getCategoryLabel(activeCategory)}`;
            }

            message += '.';
            statusElement.textContent = message;
        }

        function updateCategoryState() {
            categoryLinks.forEach((link) => {
                const categoryKey = normalizeBlogText(link.dataset.blogCategory || 'all') || 'all';
                link.classList.toggle('is-active', categoryKey === activeCategory);
            });
        }

        function renderSearchState(shouldSyncUrl = true) {
            visibleMatches = getFilteredMatches(currentSearchTerm);
            const visibleIndexes = new Set(visibleMatches.map((post) => post.index));

            blogPosts.forEach((post) => {
                const isVisible = visibleIndexes.has(post.index);
                post.column.classList.toggle('is-hidden', !isVisible);

                post.highlightElements.forEach((element) => {
                    updateHighlightedText(element, isVisible ? currentSearchTerm : '');
                });
            });

            emptyState.hidden = visibleMatches.length > 0;
            clearButton.classList.toggle('d-none', !(currentSearchTerm.trim() || activeCategory !== 'all'));
            updateCategoryState();
            updateStatus(visibleMatches);

            if (currentSearchTerm.trim()) {
                renderSuggestions();
            } else {
                hideSuggestions();
            }

            if (shouldSyncUrl) {
                syncUrlState();
            }
        }

        function clearSearchState() {
            currentSearchTerm = '';
            activeCategory = 'all';
            searchInput.value = '';
            hideSuggestions();
            renderSearchState();
        }

        searchInput.addEventListener('input', () => {
            currentSearchTerm = searchInput.value;
            renderSearchState();
        });

        searchInput.addEventListener('focus', () => {
            if (currentSearchTerm.trim()) {
                renderSuggestions();
            }
        });

        searchInput.addEventListener('blur', () => {
            window.setTimeout(() => {
                hideSuggestions();
            }, 120);
        });

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' && autocompleteMatches.length) {
                event.preventDefault();
                setActiveSuggestion(activeSuggestionIndex + 1);
                return;
            }

            if (event.key === 'ArrowUp' && autocompleteMatches.length) {
                event.preventDefault();
                setActiveSuggestion(activeSuggestionIndex - 1);
                return;
            }

            if (event.key === 'Escape') {
                hideSuggestions();
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                if (autocompleteMatches.length && activeSuggestionIndex >= 0) {
                    openBlogPost(autocompleteMatches[activeSuggestionIndex]);
                    return;
                }

                if (currentSearchTerm.trim() && visibleMatches.length) {
                    openBlogPost(visibleMatches[0]);
                }
            }
        });

        searchButton.addEventListener('click', () => {
            renderSearchState();

            if (currentSearchTerm.trim() && visibleMatches.length) {
                openBlogPost(visibleMatches[0]);
                return;
            }

            searchInput.focus();
        });

        clearButton.addEventListener('click', () => {
            clearSearchState();
            searchInput.focus();
        });

        categoryLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                activeCategory = normalizeBlogText(link.dataset.blogCategory || 'all') || 'all';
                renderSearchState();
            });
        });

        document.addEventListener('click', (event) => {
            if (!suggestionsList.contains(event.target) && event.target !== searchInput) {
                hideSuggestions();
            }
        });
    }

    // ===== Theme Lock (Dark Mode Only) =====
    document.documentElement.classList.add('dark-mode');
    try {
        localStorage.setItem('theme', 'dark');
    } catch (e) {
        // Ignore storage restrictions and keep dark mode via class.
    }

    // Remove any legacy toggle buttons if present in cached markup.
    document.querySelectorAll('.theme-toggle').forEach((btn) => btn.remove());

    // ===== Rotating Text Animation =====
    const rotatingTextElement = document.getElementById('rotatingText');
    if (rotatingTextElement) {
        const words = ['Freedom.', 'Rights.', 'Case.', 'Custody.'];
        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length;
            rotatingTextElement.style.animation = 'none';
            rotatingTextElement.offsetHeight; // Trigger reflow
            rotatingTextElement.textContent = words[currentIndex];
            rotatingTextElement.style.animation = 'fadeInUp 0.5s ease';
        }, 2500);
    }

    // ===== Counter Animation =====
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, duration / steps);
        });
    }


    // TYPEWRITER / ROTATING TEXT FUNCTION
    var TxtRotate = function (el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtRotate.prototype.tick = function () {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

        var that = this;
        var delta = 300 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(function () {
            that.tick();
        }, delta);
    };

    window.addEventListener('load', function () {
        var elements = document.getElementsByClassName('txt-rotate');
        for (var i = 0; i < elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-rotate');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
                new TxtRotate(elements[i], JSON.parse(toRotate), period);
            }
        }
    });

    // Intersection Observer for Counter Animation
    const statsSection = document.getElementById('statsSection');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // ===== Case Studies Filter =====
    const filterButtons = document.querySelectorAll('#caseFilter .nav-link');
    const caseItems = document.querySelectorAll('.case-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            caseItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    });

    // ===== Service Areas Modal & Search =====
    (function initServiceAreas() {
        const modal = document.getElementById('serviceModal');
        if (!modal) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalServices = document.getElementById('modalServices');
        const closeButton = modal.querySelector('.service-modal-close');

        // Service data object
        const serviceData = {
            'administrative-law': {
                title: 'Administrative Law in Bangladesh',
                description: 'Administrative law in Bangladesh governs the relationship between citizens, businesses, and the state, ensuring that government bodies exercise their powers lawfully and fairly. Our team advises clients on regulatory compliance, licensing requirements, and approvals from ministries, the Bangladesh Energy Regulatory Commission, BTRC, and other statutory bodies. We represent clients before administrative tribunals and regulatory authorities when agencies act arbitrarily or outside their lawful mandate. Where unlawful decisions have already been made, we challenge those decisions through judicial review and administrative appeals before the High Court Division. Our goal is to shield clients from regulatory overreach while maintaining productive, credible relationships with government institutions.',
                services: [
                    'Regulatory compliance and licensing',
                    'Administrative appeals and reviews',
                    'Government contract disputes',
                    'Public procurement law',
                    'Environmental regulatory matters',
                    'Telecommunications regulation'
                ]
            },
            'admiralty-shipping': {
                title: 'Admiralty and Shipping',
                description: "Bangladesh's position as a major maritime nation creates complex legal needs across the shipping, port, and trade industries. Our admiralty practice handles ship registration, flag-state compliance, and vessel arrests under the Admiralty Court Act 2000. We represent cargo owners, shipowners, and insurers in disputes arising from collisions, salvage, general average, and cargo loss before the Admiralty Division of the High Court Division. Our lawyers advise on Bill of Lading disputes, charter party breaches, and demurrage claims under BIMCO contract forms. With expertise spanning the Bangladesh Merchant Shipping Ordinance and international maritime conventions, we deliver authoritative counsel at every stage of a shipping matter.",
                services: [
                    'Ship registration and documentation',
                    'Marine insurance claims',
                    'Cargo disputes and claims',
                    'Ship arrest and detention',
                    'Maritime liens and mortgages',
                    'International shipping contracts'
                ]
            },
            'alternative-dispute': {
                title: 'Alternative Dispute Resolution',
                description: 'Alternative dispute resolution offers parties a faster, more cost-effective path to resolving commercial conflicts without the delay and expense of court proceedings. Our ADR team is experienced in commercial mediation, arbitration under the Arbitration Act 2001, and conciliation conducted under institutional and ad-hoc rules. We draft multi-tiered dispute resolution clauses, appoint arbitrators, and represent clients before domestic and international arbitral tribunals including those of BIAC, ICC, and LCIA. Our lawyers also design structured escalation processes that combine negotiation, mediation, and binding arbitration in a single contractual framework. We help clients achieve durable, enforceable settlements that protect business relationships while fully securing their legal interests.',
                services: [
                    'Commercial arbitration',
                    'Mediation services',
                    'Arbitration agreement drafting',
                    'International arbitration',
                    'Dispute resolution consulting',
                    'Settlement negotiations'
                ]
            },
            'aviation-matters': {
                title: 'Aviation Matters',
                description: "Bangladesh's aviation sector is one of the fastest-growing in South Asia, bringing with it an increasingly complex regulatory and commercial legal landscape. We advise airlines, lessors, aviation companies, and airports on compliance with CAAB regulations, bilateral air services agreements, and ICAO standards applicable in Bangladesh. Our practice covers aircraft purchase and lease financing, mortgage registration under the Civil Aviation Act, and cross-border asset recovery from defaulting operators. We also handle aviation accident investigations, cargo liability claims under the Warsaw and Montreal Conventions, and slot coordination disputes involving HSIA and other airports. From Biman Bangladesh Airlines to private charter operators, we provide reliable legal support at every stage of the aviation lifecycle.",
                services: [
                    'Aircraft financing and leasing',
                    'Aviation regulatory compliance',
                    'Airport development projects',
                    'Aviation insurance claims',
                    'International air transport agreements',
                    'Drone and UAV regulations'
                ]
            },
            'banking-litigation': {
                title: 'Banking Litigation',
                description: "Bangladesh's banking sector is subject to strict oversight by Bangladesh Bank, the Financial Intelligence Unit, and the courts, making specialist legal representation indispensable in disputes. Our banking litigation team handles loan recovery suits under the Artha Rin Adalat Ain 2003, enforcement of mortgages and hypothecations, and foreclosure proceedings for financial institutions. We represent banks, non-bank financial institutions, and corporate borrowers in matters ranging from documentary credit defaults to guarantor liability and fraudulent loan disbursements. Our lawyers also advise on compliance with Anti-Money Laundering regulations, prudential norms, and Bangladesh Bank circulars governing capital adequacy and provisioning. We pursue swift, effective resolutions to protect our clients' balance sheets, regulatory standing, and reputations.",
                services: [
                    'Banking regulatory compliance',
                    'Loan recovery litigation',
                    'Financial fraud investigations',
                    'Banking license applications',
                    'Consumer banking disputes',
                    'International banking transactions'
                ]
            },
            'business-setup': {
                title: 'Business Setup',
                description: 'Starting a business in Bangladesh requires navigating multiple regulatory bodies including RJSC, BIDA, BEPZA, city corporations, and sector-specific licensing authorities. Our business setup team manages company incorporation, trade licence applications, sector permits, and foreign investment approvals from start to finish, eliminating confusion and delay for our clients. We design optimal business structures—whether private limited, branch office, or joint venture—to match each client\'s operational, ownership, and tax objectives. Our lawyers also advise on the BIDA One Stop Service portal and prepare the full pre-investment regulatory roadmap. We stay engaged through every approval stage until the business is fully licensed, compliant, and ready to operate.',
                services: [
                    'Company incorporation and registration',
                    'Business license applications',
                    'Foreign investment approvals',
                    'Joint venture formations',
                    'Business restructuring',
                    'Tax registration and compliance'
                ]
            },
            'civil-litigation': {
                title: 'Civil Litigation',
                description: 'Civil litigation in Bangladesh spans District Judge courts, the High Court Division, and the Appellate Division, and demands strategic navigation at every level. Our civil litigation team handles property disputes, breach of contract claims, tortious liability, declaratory suits, and injunction applications across all civil courts. We draft pleadings with precision, manage documentary evidence, and appear before courts to argue our clients\' cases with conviction and rigour. Our approach emphasises early case analysis to identify legal strengths, factual vulnerabilities, and realistic settlement opportunities before costs escalate. From filing the plaint through to obtaining a final decree and executing it against the judgment debtor, we stand with our clients at every stage.',
                services: [
                    'Contract dispute resolution',
                    'Property and real estate litigation',
                    'Tort claims and negligence',
                    'Commercial disputes',
                    'Civil appeals',
                    'Injunction applications'
                ]
            },
            'commercial-litigation': {
                title: 'Commercial Litigation',
                description: 'Complex commercial disputes often involve large financial stakes, multiple parties, and intricate questions of contract, corporate, and competition law. Our commercial litigation team handles corporate governance disputes, shareholder oppression claims, breach of major commercial contracts, and unfair trade practice actions across Bangladeshi courts. We appear before the Commercial Court, the High Court Division, and the Appellate Division, and are equally skilled at obtaining emergency injunctions to preserve the status quo before a dispute is fully heard. Our lawyers combine deep knowledge of the Companies Act 1994, the Contract Act 1872, and international commercial law principles to construct powerful and coherent cases. We also coordinate with insolvency counsel when a commercial dispute intersects with a party\'s financial distress.',
                services: [
                    'Corporate governance disputes',
                    'Shareholder litigation',
                    'Commercial contract disputes',
                    'Intellectual property disputes',
                    'Competition law matters',
                    'Business tort litigation'
                ]
            },
            'company-formation': {
                title: 'Company Formation and Registration',
                description: 'Incorporating a company in Bangladesh involves formal registration with the Registrar of Joint Stock Companies and Firms (RJSC) and obtaining a range of sector-specific approvals from regulatory authorities. Our company formation team prepares memoranda and articles of association, statutory declarations, and all RJSC filing documents for private limited, public limited, and one-person companies. We also handle branch office and liaison office registrations for foreign companies wishing to operate in Bangladesh. After incorporation, we guide clients through post-registration compliance including share allotment, director appointments, statutory books maintenance, and first board resolutions. Our end-to-end support ensures every company starts on a legally solid footing with clear governance structures and compliance obligations clearly mapped out.',
                services: [
                    'Private limited company formation',
                    'Public limited company registration',
                    'Partnership firm establishment',
                    'Foreign company branch registration',
                    'NGO and society registration',
                    'Business name registration'
                ]
            },
            'constitutional-law': {
                title: 'Constitutional Law',
                description: 'The Constitution of Bangladesh is the supreme law of the land, providing powerful remedies for citizens and organisations whose fundamental rights have been violated or threatened by state action. Our constitutional law practice files writ petitions under Articles 102 and 44 of the Constitution to enforce fundamental rights and challenge unlawful government action in the High Court Division. We have appeared in landmark matters concerning freedom of expression, right to fair trial, separation of powers, and protection from arbitrary detention in the Appellate Division. Our team also advises on public interest litigation, challenges to legislative validity, and constitutional interpretation questions alongside live proceedings. We bring both scholarly rigour and tested courtroom advocacy to every constitutional brief we accept.',
                services: [
                    'Fundamental rights petitions',
                    'Constitutional writs and PIL',
                    'Election law matters',
                    'Administrative law challenges',
                    'Human rights litigation',
                    'Constitutional interpretation'
                ]
            },
            'contracts': {
                title: 'Contracts',
                description: 'A well-drafted contract is the foundation of every successful business relationship and the first line of defence in any dispute. Our contracts team drafts, reviews, and negotiates commercial agreements ranging from simple service contracts to complex multi-jurisdictional transactions, ensuring terms are clear, balanced, and enforceable under Bangladeshi law. We identify risk allocation issues, liability exposure, unfair terms, and regulatory non-compliance before documents are executed, protecting our clients before problems arise. Where disputes occur, we advise on the full range of remedies available under the Contract Act 1872—damages, specific performance, rescission, and injunction. We also develop standard-form contract suites for businesses that transact regularly with customers, suppliers, agents, and distributors.',
                services: [
                    'Contract drafting and review',
                    'Commercial agreement negotiation',
                    'Contract dispute resolution',
                    'Terms and conditions development',
                    'Supply chain agreements',
                    'Service level agreements'
                ]
            },
            'criminal-defense': {
                title: 'Criminal Prosecution and Defense',
                description: 'Criminal proceedings in Bangladesh carry profound personal, professional, and reputational consequences, making experienced and committed legal representation essential from the very first moment of contact with the authorities. Our criminal law team appears in Magistrate courts, Sessions courts, special tribunals, and the High Court Division and Appellate Division in both prosecution and defence matters. We handle the full spectrum of cases—from petty offences and domestic disputes to complex white-collar crimes, cybercrime, and matters under the Anti-Terrorism Act 2009 and Digital Security Act 2018. Our lawyers are skilled in bail and anticipatory bail applications, charge framing challenges, formal evidence objections, and cross-examination of prosecution witnesses. We stand firmly beside our clients from the moment of arrest or notice through to final appeal or acquittal.',
                services: [
                    'Criminal defense representation',
                    'Prosecution services',
                    'Bail applications and hearings',
                    'Criminal appeals',
                    'White-collar crime defense',
                    'Corporate criminal liability'
                ]
            },
            'domestic-arbitration': {
                title: 'Domestic and International Arbitration',
                description: 'Arbitration is the preferred method of resolving commercial and investment disputes in Bangladesh, governed principally by the Arbitration Act 2001 and influenced heavily by the UNCITRAL Model Law. Our arbitration team advises on the drafting of arbitration clauses, the selection of arbitral rules—including those of BIAC, ICC, LCIA, and SIAC—and the constitution of appropriately qualified arbitral tribunals. We prepare and present claims and defences before arbitral tribunals sitting in Dhaka and in international seats such as Singapore, London, and Hong Kong. Where awards are obtained, we handle enforcement proceedings under New York Convention obligations, and where awards are defective, we challenge them on the limited grounds permitted by law in the courts. Our team has handled arbitrations exceeding BDT 500 crore in sectors spanning infrastructure, energy, banking, and manufacturing.',
                services: [
                    'International commercial arbitration',
                    'Investment treaty arbitration',
                    'Construction arbitration',
                    'Arbitration award enforcement',
                    'Arbitration agreement drafting',
                    'Arbitrator appointments'
                ]
            },
            'entertainment-litigation': {
                title: 'Entertainment and Media Litigation',
                description: "Bangladesh's fast-growing entertainment industry—spanning film, television, music, OTT platforms, and advertising—generates increasingly complex legal disputes requiring specialist counsel. Our entertainment litigation practice handles copyright infringement actions, defamation claims, invasion of privacy suits, and contractual disputes involving producers, distributors, broadcasters, and talent. We advise content creators, streaming platforms, and media houses on compliance with Bangladesh Film Censor Board regulations, the Copyright Act 2000, the Digital Security Act 2018, and broadcasting licences issued by BTRC. Our team also negotiates and drafts production agreements, distribution deals, talent management contracts, and co-production arrangements to reduce the risk of future disputes. When litigation becomes unavoidable, we pursue swift and decisive court action to protect our clients' creative work and commercial interests.",
                services: [
                    'Copyright and trademark disputes',
                    'Defamation and privacy claims',
                    'Entertainment contract disputes',
                    'Media law compliance',
                    'Celebrity and talent representation',
                    'Digital content disputes'
                ]
            },
            'environmental-law': {
                title: 'Environmental Law',
                description: 'Environmental regulation in Bangladesh is administered by the Department of Environment under the Bangladesh Environment Conservation Act 1995 and its subsequent rules and amendments. Our environmental law practice advises on obtaining Environmental Clearance Certificates, managing Environmental Impact Assessment processes, and maintaining ongoing compliance with discharge and emission standards applicable to industrial and commercial operations. We represent clients before the DoE in enforcement proceedings and negotiate remediation plans where compliance shortfalls have occurred. Our team also handles environmental litigation in civil courts and the High Court Division, including public interest actions challenging polluting activities by industrial operators. With sustainability increasingly central to domestic and international investment decisions, we help clients build robust environmental compliance frameworks that satisfy regulators and stakeholders alike.',
                services: [
                    'Environmental impact assessments',
                    'Regulatory compliance',
                    'Environmental litigation',
                    'Climate change law',
                    'Natural resource management',
                    'Sustainable development projects'
                ]
            },
            'family-matters': {
                title: 'Family Matters and Child Custody',
                description: 'Family law matters are among the most sensitive and personally significant legal issues a person can face, and our approach combines rigorous legal advocacy with genuine empathy for every client. Our family law team handles divorce proceedings under the Muslim Family Laws Ordinance 1961, the Christian Marriage Act 1872, and the Special Marriage Act, as well as child custody, maintenance, and guardianship applications. We appear before Family Courts, Children Courts, and the High Court Division with full appreciation of the emotional and practical dimensions of each case alongside our legal strategy. In property disputes arising from marriage breakdown, we advise on asset division, dower enforcement, and inheritance rights under the applicable personal law. Our priority is always to achieve the best outcome for our clients and their children in the least adversarial, most dignified manner possible.',
                services: [
                    'Divorce and separation proceedings',
                    'Child custody and visitation',
                    'Child support arrangements',
                    'Domestic violence protection',
                    'Adoption and guardianship',
                    'Family property disputes'
                ]
            },
            'foreign-investment': {
                title: 'Foreign Investment',
                description: 'Bangladesh has made significant strides in creating a welcoming environment for foreign direct investment, but navigating its regulatory framework still requires specialist legal guidance at every step. Our foreign investment team advises on BIDA registration, sector-specific approvals from Bangladesh Bank, BSEC, and other authorities, and the optimal structuring of joint ventures with local partners. We prepare FDI agreements, technology transfer contracts, and profit repatriation documentation in compliance with the Foreign Private Investment (Promotion and Protection) Act 1980 and related Bangladesh Bank circulars. Our lawyers also advise investors on the protections available under Bangladesh\'s bilateral investment treaties and the remedies available if a government entity breaches contractual or treaty obligations. From first entry to exit strategy, we provide seamless legal support throughout the entire investment lifecycle.',
                services: [
                    'Foreign direct investment approvals',
                    'Investment license applications',
                    'Joint venture structuring',
                    'Repatriation of profits',
                    'Investment protection agreements',
                    'Cross-border M&A transactions'
                ]
            },
            'fraud-crimes': {
                title: 'Fraud and White Collar Crimes',
                description: 'Financial fraud and white-collar offences carry severe criminal penalties in Bangladesh under the Penal Code 1860, the Money Laundering Prevention Act 2012, and the Anti-Corruption Commission Act 2004. Our white-collar crime team defends corporations and individuals facing allegations of banking fraud, securities manipulation, bribery, embezzlement, and customs fraud before specialised tribunals and criminal courts. We engage at the earliest stage—often before any formal charge is filed—to conduct internal investigations, preserve privileged communications, and engage constructively with the Anti-Corruption Commission or Bangladesh Financial Intelligence Unit. For clients who are victims of fraud, we simultaneously pursue civil remedies: asset tracing, freezing orders, and full recovery suits in the civil courts. Our multidisciplinary approach combines criminal defence, civil litigation, and regulatory expertise to protect our clients on all fronts at once.',
                services: [
                    'Financial fraud investigations',
                    'Money laundering defense',
                    'Securities fraud litigation',
                    'Corporate fraud matters',
                    'Regulatory enforcement defense',
                    'Asset recovery and forfeiture'
                ]
            },
            'global-investment': {
                title: 'Global Investment and Citizenship',
                description: 'For clients seeking to diversify assets, establish international operations, and build multi-jurisdictional wealth structures, navigating cross-border investment and citizenship programmes requires precise legal and regulatory expertise. Our global investment team advises on offshore company formations in Dubai, Singapore, London, and beyond, together with tax-efficient international holding structures and residency or citizenship-by-investment programmes across leading jurisdictions. We coordinate with our international law firm network to deliver seamless cross-border advice on asset protection trusts, offshore banking relationships, and multi-jurisdiction investment vehicles. Our Bangladeshi clients benefit from our understanding of Bangladesh Bank\'s regulatory framework for outward investments under the Foreign Exchange Regulation Act 1947 and relevant circulars. We help clients achieve their global wealth and mobility objectives fully within the bounds of applicable law in every jurisdiction involved.',
                services: [
                    'Citizenship by investment programs',
                    'Offshore company formation',
                    'International tax planning',
                    'Asset protection structures',
                    'Immigration and residency',
                    'Global investment advisory'
                ]
            },
            'government-contracts': {
                title: 'Government Contracts and Litigation',
                description: 'Government contracts in Bangladesh are governed by the Public Procurement Act 2006 and the Public Procurement Rules 2008, which impose strict procedural requirements on both procuring entities and tenderers. Our government contracts team advises clients on qualification requirements, bid bond and performance security documentation, technical and financial proposal preparation, and compliance with mandatory submission formats before tender deadlines. We review tender documents in advance of submission to identify ambiguities, pricing risks, and commercially unfavourable conditions that should be formally raised through the pre-bid clarification process. Where contracts are wrongfully awarded or terminated, or bid processes are tainted by procedural irregularities, we file review complaints before the procuring entity and litigate in the courts when necessary. Our detailed knowledge of PPA/PPR requirements and CPTU practices ensures that our clients compete—and perform—government contracts with full legal protection.',
                services: [
                    'Government contract bidding',
                    'Contract dispute resolution',
                    'Bid protest litigation',
                    'Public procurement compliance',
                    'Government relations',
                    'Contract performance disputes'
                ]
            },
            'immigration-law': {
                title: 'Immigration Law in Bangladesh',
                description: "Bangladesh's immigration framework governs the entry and stay of foreign nationals as well as the overseas employment of Bangladeshi workers, creating two distinct but equally important areas of legal need. Our immigration practice advises multinational companies on obtaining work permits, investor visas, and long-term stay endorsements for expatriate employees through BIDA, the Ministry of Home Affairs, and relevant ministries. We assist Bangladeshi nationals with overseas employment contracts, Wage Earners' Welfare Fund matters, and claims against fraudulent recruiting agents before the Bureau of Manpower, Employment and Training. For individual clients, we handle spousal and family reunion visa applications, citizenship by naturalisation, and NRB (Non-Resident Bangladeshi) investment visa matters through the Department of Immigration and Passports. Our team stays current with all policy circulars so that our clients' documentation is always accurate, complete, and in order.",
                services: [
                    'Work permit applications',
                    'Residency visa processing',
                    'Citizenship applications',
                    'Immigration appeals',
                    'Family reunification',
                    'Business immigration'
                ]
            },
            'insurance-recovery': {
                title: 'Insurance Recovery',
                description: 'When insurers refuse to pay valid claims, delay settlement, or dispute coverage, policyholders need vigorous legal representation to recover what they are owed under their policies. Our insurance recovery team handles disputes under general, life, and marine insurance policies governed by the Insurance Development and Regulatory Authority (IDRA) regulatory framework and the Insurance Act 2010. We draft and send formal insurance claim demands, initiate arbitration under policy arbitration clauses, and litigate in civil courts and consumer rights forums when insurers act in bad faith or unreasonably delay payment. Our lawyers also advise policyholders on coverage adequacy before a loss occurs, reducing the risk of partial or total claim denial when it matters most. From first-party property claims to third-party liability settlements, we maximise the recovery our clients receive from their insurers.',
                services: [
                    'Insurance claim disputes',
                    'Bad faith insurance litigation',
                    'Property damage claims',
                    'Liability insurance recovery',
                    'Life insurance disputes',
                    'Insurance contract interpretation'
                ]
            },
            'intellectual-property': {
                title: 'Intellectual Property (Trademark Patent Copyright)',
                description: 'Intellectual property rights are among a business\'s most valuable assets, and protecting them in Bangladesh requires proactive registration and vigilant enforcement in a market where infringement remains common. Our IP team handles trademark registration at the Department of Patents, Designs and Trademarks (DPDT), patent prosecution, and copyright registration with the Copyright Office of Bangladesh for local and multinational clients. We conduct IP due diligence, portfolio audits, and freedom-to-operate analyses for businesses entering new markets or launching new products in Bangladesh and the wider region. When infringement occurs, we move swiftly to obtain interlocutory injunctions, pursue civil damages, and coordinate with customs authorities and law enforcement for border seizure actions against counterfeit goods. Our practice also covers IP licensing agreements, technology transfer contracts, and comprehensive brand protection strategies tailored to each client\'s business model.',
                services: [
                    'Trademark registration and protection',
                    'Patent prosecution and litigation',
                    'Copyright registration and enforcement',
                    'IP licensing and transactions',
                    'Trade secret protection',
                    'IP infringement litigation'
                ]
            },
            'international-trade': {
                title: 'International Trade',
                description: "Bangladesh's export-oriented economy—anchored by the garment, textile, pharmaceutical, and agricultural sectors—demands sophisticated legal support for international trade operations at every level. Our international trade team advises on export contracts, letters of credit documentation, INCOTERMS 2020 obligations, and compliance with WTO agreements including the Agreement on Textiles and Clothing and the Agreement on Customs Valuation. We assist importers and exporters in customs classification disputes, anti-dumping proceedings, and trade remedy investigations initiated by the National Board of Revenue or foreign authorities against Bangladeshi exporters. Our lawyers also handle complex trade finance instruments—back-to-back L/Cs, UPAS credits, and deferred payment arrangements—ensuring that our clients' transactions are legally watertight before shipment occurs. With access to international trade law networks, we support cross-border commercial operations from contract formation through to payment, delivery, and any post-shipment dispute.",
                services: [
                    'International trade agreements',
                    'Import/export compliance',
                    'Customs and tariff matters',
                    'Trade dispute resolution',
                    'WTO compliance',
                    'International sanctions'
                ]
            },
            'judicial-review': {
                title: 'Judicial Review of Administrative Action',
                description: 'Judicial review is the primary remedy available in Bangladesh to challenge unlawful decisions by public authorities, regulatory bodies, and statutory tribunals under Article 102 of the Constitution. Our judicial review team files writ petitions seeking certiorari to quash unlawful orders, mandamus to compel the performance of public duties, and prohibition to restrain ultra vires acts by administrative bodies. We have successfully challenged licensing refusals, arbitrary tax reassessments, unlawful land acquisition proceedings, and disciplinary orders made without following principles of natural justice. Our lawyers conduct thorough pre-litigation analysis of every case—assessing grounds of review, time limits, standing requirements, and the realistic prospects of obtaining an interim stay order at the urgent hearing. We appear in both the High Court Division and the Appellate Division to prosecute judicial review matters to their final conclusion on behalf of our clients.',
                services: [
                    'Administrative decision challenges',
                    'Judicial review applications',
                    'Government action appeals',
                    'Regulatory decision review',
                    'Administrative fairness claims',
                    'Public law litigation'
                ]
            },
            'labour-employment': {
                title: 'Labour and Employment Matters',
                description: "Bangladesh's labour law framework under the Bangladesh Labour Act 2006, as amended in 2013 and 2018, governs employment relationships from hire to termination, and non-compliance exposes employers to financial penalties and reputational damage. Our employment law team drafts employment contracts, standing orders, workplace policies, and HR manuals that meet BLA standards and the BEPZA Worker Welfare Regulations for export processing zone enterprises. We advise on employee disciplinary proceedings, misconduct inquiries, retrenchment procedures, and the correct calculation and payment of terminal gratuity and provident fund entitlements. When disputes arise, we represent employers and employees before Labour Courts, Labour Appellate Tribunals, and the High Court Division with equal effectiveness. Our proactive compliance audit service helps businesses identify and correct labour law vulnerabilities before they escalate into costly litigation or regulatory action.",
                services: [
                    'Employment contract drafting',
                    'Workplace dispute resolution',
                    'Labor law compliance',
                    'Wrongful termination claims',
                    'Employee rights protection',
                    'Collective bargaining'
                ]
            },
            'land-documentation': {
                title: 'Land Related Documentation',
                description: 'Land transactions in Bangladesh are exceptionally complex due to a layered system of title records spanning CS, SA, RS, and BS surveys, mutations, and multiple historical transfer instruments that must each be examined. Our land documentation team conducts thorough title searches, examines the full chain of ownership across all relevant records, and prepares or reviews sale deeds, gift deeds, partition deeds, and heba documents with precision. We register instruments at the Sub-Registry Office, process mutation applications before the AC Land office, and obtain certified copies of all relevant records to complete the documentary chain. When land documents are disputed, forged, or legally insufficient, we advise on rectification suits, cancellation proceedings, and injunctions to protect lawful possession and title. Our meticulous approach to every document gives clients and financiers the confidence that their land assets are legally secure and fully defensible.',
                services: [
                    'Land registration and transfer',
                    'Property documentation',
                    'Title verification',
                    'Land dispute resolution',
                    'Real estate transactions',
                    'Property development agreements'
                ]
            },
            'marine-insurance': {
                title: 'Marine Insurance',
                description: 'Marine insurance is an essential safeguard for Bangladesh\'s vibrant trade, shipping, and fishing industries, and disputes under marine policies require specialist legal knowledge of both insurance and maritime law. Our marine insurance team represents cargo owners, vessel operators, port operators, and P&I club correspondents in claims arising from total loss, particular average, general average contributions, and collision liability. We advise on the application of the Marine Insurance Act 1906, Lloyd\'s policies, and Institute Cargo and Hull Clauses to the specific facts of each claim, and assist in appointing surveyors and average adjusters. When insurers dispute liability or quantum, we pursue recovery through arbitration or litigation in the Admiralty Division of the High Court Division with full command of the factual and legal arguments. Our experience across both domestic and international marine insurance markets enables us to secure commercially astute, prompt, and maximum claim settlements for our clients.',
                services: [
                    'Cargo insurance claims',
                    'Hull and machinery insurance',
                    'Marine liability claims',
                    'Insurance dispute resolution',
                    'Salvage and general average',
                    'Marine insurance contracts'
                ]
            },
            'natural-resources': {
                title: 'Natural Resources',
                description: "Bangladesh's natural resource sector—including coal, natural gas, river sand, construction aggregates, and forest resources—is regulated by multiple ministries and statutory bodies whose requirements must all be satisfied before commercial extraction begins. Our natural resources team advises mining companies, energy developers, and investors on concession agreements, exploration licences, and production sharing contracts with Petrobangla and BAPEX. We navigate the permitting requirements of the Department of Mines, the Bangladesh Forest Department, and the Department of Environment to secure the necessary clearances for resource development projects. Our lawyers also handle disputes arising from licence revocations, royalty reassessments, and environmental damage claims made against resource operators by regulators or communities. We help clients structure resource investments to balance commercial returns with full regulatory compliance and responsible community engagement.",
                services: [
                    'Mining and extraction rights',
                    'Energy project development',
                    'Environmental impact assessments',
                    'Resource licensing',
                    'Land use and zoning',
                    'Sustainable resource management'
                ]
            },
            'oil-gas-law': {
                title: 'Oil and Gas Law',
                description: "Bangladesh's oil and gas sector is governed by the Bangladesh Oil, Gas and Mineral Corporation Ordinance 1985 and Production Sharing Contracts negotiated with Petrobangla, requiring specialist legal expertise to navigate effectively. Our energy law team advises on the full lifecycle of oil and gas projects—from initial PSC negotiations and exploration rights through to development financing, pipeline easements, gas sales contracts, and field decommissioning. We represent international oil companies, gas utilities, and local participants in negotiations with Petrobangla, BAPEX, Titas Gas, Bakhrabad Gas, and the Ministry of Power, Energy and Mineral Resources. Our practice also covers LNG import terminal projects, downstream distribution framework agreements, and gas pricing disputes before the Bangladesh Energy Regulatory Commission. We bring a practical and commercially grounded understanding of both the regulatory and transactional dimensions of the Bangladeshi energy market.",
                services: [
                    'Oil and gas exploration contracts',
                    'Regulatory compliance',
                    'Energy project financing',
                    'Environmental compliance',
                    'Pipeline and infrastructure',
                    'Energy dispute resolution'
                ]
            },
            'private-equity': {
                title: 'Private Equity Loan Syndication',
                description: 'Private equity and structured lending transactions in Bangladesh require careful legal architecture to protect investors and lenders in a market with rapidly evolving regulatory frameworks and limited secondary market liquidity. Our private equity team advises funds, development finance institutions, and strategic investors on equity investments, convertible instruments, and shareholder agreements in Bangladeshi companies across multiple sectors. We structure loan syndications, club deals, and bilateral facilities for project and corporate financing in compliance with Bangladesh Bank directives and BSEC capital market regulations. Our lawyers draft term sheets, subscription agreements, and SHA provisions covering drag-along and tag-along rights, anti-dilution protections, reserved matters, and exit mechanisms including put/call options and IPO rights. We coordinate with relevant regulatory authorities to obtain all required investment approvals and ensure smooth repatriation of returns to international fund investors when the investment matures.',
                services: [
                    'Private equity transactions',
                    'Loan syndication agreements',
                    'Investment fund formation',
                    'Structured finance deals',
                    'Equity financing',
                    'Investment advisory'
                ]
            },
            'procurement-bidding': {
                title: 'Procurement Bidding and Government Contracts',
                description: 'Winning and performing government contracts in Bangladesh requires mastery of the Public Procurement Act 2006, the Public Procurement Rules 2008, and the often complex special conditions issued by individual procuring entities. Our procurement team advises bidders on qualification requirements, bid bond and performance security documentation, technical proposal preparation, financial bid structuring, and strict compliance with mandatory submission formats and deadlines. We review tender documents for our clients before submission to identify ambiguities, calculation errors, commercially unfavourable terms, and grounds on which clarifications should formally be sought before the bid submission deadline. When procurement decisions are made unfairly or in violation of PPR requirements, we file review complaints before the procuring entity\'s review panel and pursue litigation in the courts where the review mechanism fails to provide a fair outcome. Our knowledge of PPA/PPR compliance and the CPTU process ensures our clients compete on a level playing field and protect their contractual rights throughout performance.',
                services: [
                    'Bid preparation and submission',
                    'Government procurement compliance',
                    'Contract negotiation',
                    'Bid protest defense',
                    'Public tender processes',
                    'Procurement dispute resolution'
                ]
            },
            'project-finance': {
                title: 'Project Finance Documentation',
                description: 'Major infrastructure and energy projects in Bangladesh typically require bespoke financing structures supported by comprehensive security packages, intercreditor arrangements, and direct agreements with government counterparts. Our project finance team advises sponsors, senior lenders, and development finance institutions on the full suite of project documents—concession agreements, EPC contracts, O&M agreements, offtake contracts, and direct step-in agreements. We handle the creation and perfection of security over project assets, land, equipment, shares, and receivables under Bangladeshi law, ensuring that the security package meets the requirements of international lenders. Our lawyers manage financial close processes, advise on conditions precedent and drawdown conditions, and issue the legal opinions required by international creditors in structured transactions. We have acted on some of Bangladesh\'s most significant power sector, infrastructure, and industrial financing transactions, bringing disciplined project management to every complex multi-party deal.',
                services: [
                    'Project finance agreements',
                    'Infrastructure project documentation',
                    'Development financing',
                    'Security documentation',
                    'Project risk assessment',
                    'Financial closing documentation'
                ]
            },
            'real-estate': {
                title: 'Real Estate and Property Matters',
                description: "Bangladesh's real estate market—from commercial towers in Dhaka to residential developments across divisional cities—presents rich investment opportunities alongside significant legal risk that requires specialist guidance. Our real estate team advises on property acquisition, due diligence, sale and purchase agreements, and registration at the Sub-Registry Office under the Registration Act 1908 and the Transfer of Property Act 1882. We negotiate and document joint development agreements between landowners and REHAB-registered developers, construction contracts, and real estate investment structures for both commercial and residential projects. Our lawyers resolve possession disputes, boundary conflicts, and illegal encroachment cases through courts and direct negotiation with the other party. We also advise developers on consumer protection obligations, advance booking agreement terms, and handover disputes under the Real Estate Development and Management Act 2010.",
                services: [
                    'Property purchase and sale',
                    'Real estate development',
                    'Property dispute resolution',
                    'Lease agreements',
                    'Mortgage and financing',
                    'Property management'
                ]
            },
            'security-documentation': {
                title: 'Security Documentation',
                description: 'Security documentation is the backbone of every lending transaction in Bangladesh, and a single defect in any security instrument can jeopardise the recovery of an entire loan in a default scenario. Our security documentation team prepares and reviews mortgage deeds, hypothecation agreements, charge documents, and personal and corporate guarantees for banks, non-bank financial institutions, and private lenders across all sectors. We advise on the correct form, execution, stamp duty, and registration requirements that make each security interest fully enforceable against the borrower and binding on third parties and liquidators. Our team also handles enforcement of security—mortgage foreclosure, sale of pledged and hypothecated assets, encashment of guarantees, and recovery suits under the Artha Rin Adalat Ain 2003. By ensuring every security document is correct and perfected from the outset, we minimise the risk of that security being successfully challenged by a borrower in financial difficulty.',
                services: [
                    'Security agreements',
                    'Mortgage documentation',
                    'Guarantee agreements',
                    'Pledge and hypothecation',
                    'Security registration',
                    'Enforcement of security interests'
                ]
            },
            'ship-building': {
                title: 'Ship Building and Ship Breaking Matters',
                description: 'Bangladesh is one of the world\'s leading ship-recycling nations and an emerging player in small and medium vessel construction, creating unique legal needs in this highly specialised sector. Our shipbuilding and ship-breaking team drafts and reviews new-building contracts aligned with SAJ shipbuilding form standards, advising on risk allocation during construction, warranty provisions, delivery and acceptance tests, and vessel financing under construction. For ship-breaking operations, we assist clients in complying with the Bangladesh Ship Breaking and Recycling Rules 2011, obtaining yard licences, and managing environmental compliance audits by the Department of Environment and international classification societies. We handle disputes arising from construction defects, delayed delivery, variation orders, and casualty damage to vessels under construction before arbitral tribunals and the Admiralty Division. Our integrated understanding of both the commercial and regulatory dimensions of Bangladesh\'s maritime industry makes us the natural legal partner for ship operators, builders, and recyclers.',
                services: [
                    'Shipbuilding contracts',
                    'Ship breaking regulations',
                    'Maritime construction disputes',
                    'Vessel financing',
                    'Shipyard agreements',
                    'Environmental compliance'
                ]
            },
            'taxation-systems': {
                title: 'Taxation Systems',
                description: "Bangladesh's tax framework—administered by the National Board of Revenue—includes income tax, corporate tax, minimum tax, and sector-specific levies now governed primarily by the Income Tax Act 2023 and accompanying SROs. Our tax team provides year-round advisory on tax-efficient structuring of business transactions, transfer pricing compliance, and minimisation of withholding tax exposure for companies operating across borders. We prepare and file income tax returns, respond formally to assessment orders and demand notices, and defend clients in audit proceedings before the Deputy Commissioner of Taxes and the Commissioner (Appeals). When disputes escalate, we appear before the Tax Appellate Tribunal and the High Court Division to challenge arbitrary, inflated, or legally flawed assessments by the revenue authorities. Our goal is to ensure every client pays exactly what the law requires—no more—while maintaining full documented compliance.",
                services: [
                    'Tax planning and advisory',
                    'Tax compliance and filing',
                    'Tax dispute resolution',
                    'Transfer pricing',
                    'International tax matters',
                    'Tax audit defense'
                ]
            },
            'tenant-rights': {
                title: 'Tenant Rights in Bangladesh',
                description: "Bangladesh's tenancy legislation and the Premises Rent Control Act provide important protections for residential and commercial tenants against unlawful eviction, arbitrary rent increases, and harassment by landlords. Our tenant rights team reviews and negotiates tenancy agreements before execution to ensure legally compliant and fair terms that protect the tenant's position from the outset. We provide practical guidance on security deposit recovery, landlord repair obligations, lawful eviction procedures, and the correct legal steps for defending eviction proceedings before Rent Controllers and civil courts. When landlords resort to unlawful self-help—locking out tenants, cutting utilities, or threatening occupants—we obtain emergency injunctive relief from the courts swiftly and decisively. For commercial tenants facing business-critical lease issues, we provide urgent advice on securing possession and negotiating mutually acceptable lease modifications or exits.",
                services: [
                    'Tenant rights protection',
                    'Rent dispute resolution',
                    'Eviction defense',
                    'Lease agreement review',
                    'Housing discrimination claims',
                    'Tenant security deposits'
                ]
            },
            'telecommunication': {
                title: 'Telecommunication and IT Law',
                description: "Bangladesh's telecommunications and digital sector is one of the most dynamic in South Asia, regulated by the Bangladesh Telecommunication Regulatory Commission under the Bangladesh Telecommunication Act 2001 and a rapidly evolving set of digital laws. Our telecom and IT law team advises mobile network operators, internet service providers, fintech companies, and technology startups on licensing requirements, spectrum allocation, tariff filings, and BTRC compliance obligations. We draft and negotiate network sharing agreements, infrastructure access deals, managed service contracts, software licensing arrangements, and SaaS agreements for businesses operating across Bangladesh's digital economy. Our practice also covers data protection obligations under the Data Protection Act framework, compliance with the Digital Security Act 2018, and representation in regulatory enforcement proceedings before BTRC and other authorities. As digital business models continue to evolve rapidly, we help our clients stay fully compliant while capturing commercial opportunities in this high-growth sector.",
                services: [
                    'Telecommunications licensing',
                    'IT contract drafting',
                    'Data protection compliance',
                    'Technology dispute resolution',
                    'Digital content regulation',
                    'Cybersecurity legal matters'
                ]
            },
            'vat-tax': {
                title: 'VAT Tax and Customs Matters',
                description: 'Value Added Tax is Bangladesh\'s largest source of government revenue, governed by the VAT and Supplementary Duty Act 2012, and non-compliance carries serious financial penalties and criminal consequences for businesses and their responsible officers. Our VAT and customs team assists clients with VAT registration, input tax credit management, monthly Mushak return preparation and filing, and compliance with supplementary duty obligations across all sectors of the economy. We advise on disputed customs valuations, HS code classification challenges, anti-dumping duty assessments, and customs penalty proceedings before the Customs, Excise and VAT Commissionerate and appellate authorities. When the National Board of Revenue raises demand notices or initiates VAT audit proceedings, we prepare comprehensive objections and formally represent clients at every level of the VAT appellate process. Our proactive compliance advisory helps businesses systematically reduce exposure to VAT arrears, penalties, and compounding interest before they become material liabilities.',
                services: [
                    'VAT registration and compliance',
                    'Customs duty assessment',
                    'Import/export taxation',
                    'VAT audit defense',
                    'Indirect tax planning',
                    'Customs dispute resolution'
                ]
            },
            'verification-documents': {
                title: 'Verification and Land Documents',
                description: 'Reliable verification of land and property documents is essential before any purchase, mortgage, or investment commitment in Bangladesh\'s complex and historically layered real estate market. Our document verification team conducts comprehensive title searches covering CS, SA, RS, and City Survey records, mutation orders, succession certificates, partition decrees, and court records to establish a clean and unbroken chain of title. We identify adverse entries, undisclosed encumbrances, disputed ownership interests, and forged or fraudulent documents before our clients commit to significant legal or financial obligations. Our lawyers liaise with Sub-Registry offices, AC Land offices, District Record Rooms, and civil courts to obtain authenticated certified copies of all relevant registers and proceedings. A thorough pre-transaction verification report from our team provides clients and financiers with the legal certainty they need to proceed with full confidence in the title they are acquiring.',
                services: [
                    'Land document verification',
                    'Title search and verification',
                    'Property due diligence',
                    'Document authentication',
                    'Legal opinion on documents',
                    'Chain of title verification'
                ]
            },
            'vetting-documents': {
                title: 'Vetting of Documents',
                description: 'Independent legal vetting of documents before execution can prevent costly disputes, regulatory penalties, and agreements whose critical terms may be unenforceable or misunderstood by the parties. Our legal vetting team reviews commercial contracts, property instruments, corporate filings, and regulatory submissions for legal accuracy, internal consistency, and compliance with applicable Bangladeshi legislation and regulatory requirements. We verify stamping and registration requirements, confirm signatory authority through examination of corporate resolutions and duly executed powers of attorney, and ensure that contractual terms operate as the parties intend under Bangladeshi law. Where documents contain legal risks or material deficiencies, we provide clear, actionable written opinions identifying each issue and recommending specific remedial measures before signing occurs. Our vetting service is particularly valued by banks, multinational companies, and development finance institutions as a quality-assurance step before major investments or lending commitments are made.',
                services: [
                    'Legal document review',
                    'Contract vetting',
                    'Regulatory compliance check',
                    'Document authentication',
                    'Legal risk assessment',
                    'Document standardization'
                ]
            },
            'writ-matters': {
                title: 'Writ and High Court Matters',
                description: 'Writ jurisdiction under Article 102 of the Constitution empowers the High Court Division to intervene wherever a public authority acts unlawfully, exceeds its powers, or violates a citizen\'s fundamental rights guaranteed under Part III of the Constitution. Our writ practice team drafts petitions in certiorari, mandamus, prohibition, habeas corpus, and quo warranto, each carefully tailored to the precise relief sought and the factual and legal grounds available on the record. We file urgent applications for interim stay orders to halt the execution of harmful administrative decisions while the substantive writ petition is heard and determined by the court. Over the years, we have secured landmark decisions in service law matters, tax disputes, land acquisition proceedings, licensing refusals, and fundamental rights cases of broad public importance. Appearing regularly before the High Court Division and the Appellate Division, our lawyers combine constitutional scholarship with decisive courtroom advocacy to deliver real results for our clients.',
                services: [
                    'Writ petition drafting',
                    'Fundamental rights enforcement',
                    'Public interest litigation',
                    'Judicial review applications',
                    'Constitutional challenges',
                    'High court appeals'
                ]
            }
        };

        const searchInput = document.getElementById('serviceSearch');
        const suggestionsList = document.getElementById('serviceSuggestions');
        const alphabetNav = document.getElementById('alphabetNav');
        const alphabetNavContainer = alphabetNav?.closest('.alphabet-nav');
        const directoryContainer = document.getElementById('serviceDirectory');
        const popularContainer = document.getElementById('popularServices');
        const categoryFilters = document.getElementById('serviceCategoryFilters');
        const rescueContainer = document.getElementById('serviceRescue');

        const ctaTitle = document.getElementById('contextualCtaTitle');
        const ctaDescription = document.getElementById('contextualCtaDescription');
        const ctaButton = document.getElementById('contextualCtaButton');

        const modalLawyerName = document.getElementById('modalLawyerName');
        const modalLawyerRole = document.getElementById('modalLawyerRole');
        const modalLawyerTrust = document.getElementById('modalLawyerTrust');
        const modalLawyerProfile = document.getElementById('modalLawyerProfile');
        const modalCallNow = document.getElementById('modalCallNow');
        const modalWhatsAppNow = document.getElementById('modalWhatsAppNow');
        const modalBookConsultation = document.getElementById('modalBookConsultation');
        const modalContactFallback = document.getElementById('modalContactFallback');

        if (!searchInput || !alphabetNav || !directoryContainer || !popularContainer || !closeButton) return;

        const invalidServiceKeys = new Set(['privacy-policy', 'terms-of-service', 'disclaimer']);
        directoryContainer.querySelectorAll('.service-item').forEach((item) => {
            if (invalidServiceKeys.has(item.dataset.service || '')) {
                item.remove();
            }
        });

        const SERVICE_CLICK_STORAGE_KEY = 'kamal_service_click_counts';
        const POPULAR_SERVICE_LIMIT = 5;
        const defaultDemandSeed = {
            'company-formation': 60,
            'civil-litigation': 55,
            'family-matters': 50,
            'criminal-defense': 48,
            'real-estate': 46,
            'intellectual-property': 40,
            'immigration-law': 38,
            'taxation-systems': 35
        };

        const categoryLabelMap = {
            all: 'All Services',
            business: 'Business',
            family: 'Family',
            criminal: 'Criminal',
            property: 'Property',
            tax: 'Tax',
            international: 'International',
            regulatory: 'Regulatory'
        };

        const lawyerDirectory = {
            kamal: {
                name: 'Adv. Mohammad Mostofa Kamal',
                role: 'Head of Chamber & Founder',
                profileUrl: 'attorney-kamal.html',
                phone: '+880 1713 456 800',
                trust: 'Criminal Defense, Corporate Law, Writ Jurisdiction | 25+ Years'
            },
            harun: {
                name: 'Adv. Harun Rayhan',
                role: 'Managing Partner',
                profileUrl: 'attorney-harun.html',
                phone: '+880 1713 456 800',
                trust: 'Corporate Law, Constitutional Law | 18+ Years'
            },
            nasrin: {
                name: 'Adv. Nasrin Akter',
                role: 'Senior Partner',
                profileUrl: 'attorney-nasrin.html',
                phone: '+880 1713 456 800',
                trust: 'Banking and Corporate Law | 15+ Years'
            },
            chowdhury: {
                name: 'Adv. Mustafa Kamal Chowdhury',
                role: 'Senior Associate',
                profileUrl: 'attorney-chowdhury.html',
                phone: '+880 1713 456 800',
                trust: 'Criminal Defense, Litigation | 12+ Years'
            },
            kabir: {
                name: 'Adv. Mohammad Kabir',
                role: 'Senior Associate',
                profileUrl: 'attorney-kabir.html',
                phone: '+880 1713 456 800',
                trust: 'Family Law, Civil Law | 12+ Years'
            },
            rashed: {
                name: 'Adv. Yeasin Arafat Rashed',
                role: 'Associate',
                profileUrl: 'attorney-rashed.html',
                phone: '+880 1713 456 800',
                trust: 'Civil Law, Property Law | 8+ Years'
            },
            mahadi: {
                name: 'Adv. Mahadi Hosin Manik',
                role: 'Associate',
                profileUrl: 'attorney-mahadi.html',
                phone: '+880 1713 456 800',
                trust: 'Administrative Law, Tax Law | 5+ Years'
            }
        };

        const categoryLawyerMap = {
            business: 'harun',
            family: 'kabir',
            criminal: 'chowdhury',
            property: 'rashed',
            tax: 'mahadi',
            international: 'nasrin',
            regulatory: 'mahadi'
        };

        const serviceLawyerOverrides = {
            'civil-litigation': 'kabir',
            'commercial-litigation': 'harun',
            'criminal-defense': 'chowdhury',
            'family-matters': 'kabir',
            'land-documentation': 'rashed',
            'real-estate': 'rashed',
            'tenant-rights': 'rashed',
            'taxation-systems': 'mahadi',
            'vat-tax': 'mahadi',
            'administrative-law': 'mahadi',
            'writ-matters': 'kamal',
            'judicial-review': 'harun',
            'intellectual-property': 'kamal',
            'international-trade': 'harun',
            'business-setup': 'harun',
            'company-formation': 'harun',
            'foreign-investment': 'nasrin'
        };

        const subServiceLibrary = {
            'rjsc-name-clearance': {
                title: 'RJSC name clearance and incorporation filing support',
                description: 'Entity setup support from name screening to statutory filing sequence.',
                parentServices: ['company-formation', 'business-setup', 'foreign-investment']
            },
            'trade-license-permit-routing': {
                title: 'Trade license and local permit routing',
                description: 'Route applications across city corporation and sector-specific licensing desks.',
                parentServices: ['company-formation', 'business-setup', 'foreign-investment', 'government-contracts']
            },
            'bida-oss-workflow': {
                title: 'BIDA OSS workflow strategy and filing support',
                description: 'Plan document flow and sequence for transparent application processing.',
                parentServices: ['business-setup', 'foreign-investment', 'global-investment']
            },
            'tax-registration-stack': {
                title: 'Tax registration stack (TIN, VAT/eBIN, withholding setup)',
                description: 'Build tax setup readiness for smooth onboarding and compliance.',
                parentServices: ['company-formation', 'taxation-systems', 'vat-tax']
            },
            'tax-audit-defense': {
                title: 'Tax audit preparation and response representation',
                description: 'Support for notices, data room preparation, and representation strategy.',
                parentServices: ['taxation-systems', 'vat-tax', 'civil-litigation']
            },
            'customs-classification': {
                title: 'Customs classification, valuation, and duty challenge strategy',
                description: 'Assist import/export matters and customs objections with structured documentation.',
                parentServices: ['vat-tax', 'international-trade', 'admiralty-shipping']
            },
            'contract-risk-allocation': {
                title: 'Contract risk allocation and indemnity design',
                description: 'Commercial clauses tailored for enforceability and risk containment.',
                parentServices: ['contracts', 'commercial-litigation', 'international-trade', 'project-finance']
            },
            'land-title-chain': {
                title: 'Land title chain verification and mutation pathway',
                description: 'Trace ownership records, encumbrances, and transfer readiness.',
                parentServices: ['real-estate', 'land-documentation', 'verification-documents', 'tenant-rights']
            },
            'lease-dispute-protocol': {
                title: 'Lease structuring and landlord-tenant dispute protocol',
                description: 'Preventive drafting plus dispute response for occupancy and rent conflicts.',
                parentServices: ['tenant-rights', 'real-estate', 'civil-litigation']
            },
            'labour-inspection-readiness': {
                title: 'Labour inspection and workplace compliance readiness',
                description: 'Prepare for labour inspection and workplace governance checks.',
                parentServices: ['labour-employment', 'business-setup', 'foreign-investment']
            },
            'work-permit-compliance': {
                title: 'Work permit, expatriate onboarding, and status compliance',
                description: 'Coordinate employment and immigration compliance for foreign staff.',
                parentServices: ['immigration-law', 'labour-employment', 'global-investment']
            },
            'ip-registration-enforcement': {
                title: 'Trademark/copyright registration and enforcement planning',
                description: 'Protect brand and content rights, then enforce through civil/criminal routes.',
                parentServices: ['intellectual-property', 'commercial-litigation', 'criminal-defense']
            },
            'digital-compliance': {
                title: 'Digital platform and data governance compliance',
                description: 'Structure digital operations around telecom and technology compliance risks.',
                parentServices: ['telecommunication', 'intellectual-property', 'contracts']
            },
            'writ-remedy-mapping': {
                title: 'Writ remedy mapping against administrative inaction',
                description: 'Assess maintainability and urgent interim remedy routes in higher courts.',
                parentServices: ['writ-matters', 'judicial-review', 'administrative-law']
            },
            'adr-litigation-bridge': {
                title: 'ADR-to-litigation bridge strategy',
                description: 'Design settlement, arbitration, and enforcement strategy as one continuum.',
                parentServices: ['alternative-dispute', 'domestic-arbitration', 'civil-litigation', 'commercial-litigation']
            },
            'criminal-risk-containment': {
                title: 'Immediate criminal risk containment and bail roadmap',
                description: 'Rapid response on arrest exposure, bail preparation, and defense posture.',
                parentServices: ['criminal-defense', 'fraud-crimes', 'banking-litigation']
            },
            'banking-security-enforcement': {
                title: 'Banking security documentation and enforcement strategy',
                description: 'Strengthen collateral and recovery strategy for financing disputes.',
                parentServices: ['banking-litigation', 'security-documentation', 'private-equity']
            },
            'government-tender-compliance': {
                title: 'Government tender compliance and challenge support',
                description: 'Support tender submission quality, objections, and contractual defense.',
                parentServices: ['procurement-bidding', 'government-contracts', 'commercial-litigation']
            },
            'maritime-insurance-claims': {
                title: 'Maritime cargo and marine insurance claims management',
                description: 'Coordinate carrier, insurer, and cargo claim posture in one track.',
                parentServices: ['admiralty-shipping', 'marine-insurance', 'ship-building']
            },
            'environmental-clearance-support': {
                title: 'Environmental clearance and compliance mitigation support',
                description: 'Address permitting and operational risk in regulated projects.',
                parentServices: ['environmental-law', 'natural-resources', 'oil-gas-law', 'project-finance']
            }
        };

        const MIN_MODAL_SUBSERVICES = 10;
        const categorySubServicePools = {
            business: [
                'Business incorporation and governance structuring',
                'Shareholder and directors agreement drafting',
                'Corporate secretarial and compliance calendar',
                'Commercial contract drafting and negotiation',
                'Joint venture and investment structuring',
                'Regulatory license application strategy',
                'Employment policy and HR legal framework',
                'Vendor and procurement contract safeguards',
                'Debt recovery and payment default action',
                'Corporate dispute prevention and representation',
                'Business restructuring and exit planning',
                'Mergers and acquisitions due diligence support'
            ],
            family: [
                'Divorce and separation proceedings',
                'Child custody and visitation rights',
                'Child and spousal maintenance claims',
                'Muslim family law advisory',
                'Marriage registration and legal validation',
                'Domestic violence protection strategy',
                'Guardianship and succession family petitions',
                'Dower and marital property claims',
                'Family settlement and mediation',
                'Family court representation',
                'Decree execution and compliance follow-up',
                'Cross-border family dispute coordination'
            ],
            criminal: [
                'Anticipatory and regular bail applications',
                'FIR and complaint response strategy',
                'Police investigation representation',
                'Trial defense in magistrate and sessions courts',
                'White-collar and financial crime defense',
                'Cybercrime complaint and defense support',
                'Criminal revision and appeal drafting',
                'Quashing and discharge petition strategy',
                'Witness preparation and evidence review',
                'Negotiated settlement where legally permissible',
                'Remand hearing representation',
                'Post-conviction relief planning'
            ],
            property: [
                'Land title verification and record check',
                'Mutation and land record correction',
                'Sale deed and transfer documentation',
                'Lease and tenancy agreement drafting',
                'Boundary and possession dispute strategy',
                'Developer agreement and flat handover issues',
                'Mortgage and charge documentation review',
                'Partition and ownership claim litigation',
                'Land acquisition compensation advisory',
                'Eviction and injunction representation',
                'Encumbrance and lien due diligence',
                'Property tax and utility dispute support'
            ],
            tax: [
                'Income tax return and planning support',
                'VAT registration and compliance management',
                'Tax audit and assessment response',
                'Customs duty and tariff advisory',
                'Tax objection and appeal representation',
                'Withholding tax compliance review',
                'Transfer pricing and cross-border tax support',
                'Refund and rebate claim handling',
                'Documentation and reconciliation health check',
                'Penalty mitigation and settlement strategy',
                'Advance tax and installment advisory',
                'Tax tribunal litigation support'
            ],
            international: [
                'Visa and immigration compliance planning',
                'Work permit and expatriate onboarding',
                'Foreign investment entry structuring',
                'Cross-border contract drafting',
                'International trade compliance support',
                'Import-export documentation review',
                'Multi-jurisdiction dispute strategy',
                'Shipping and logistics legal support',
                'Overseas employment legal advisory',
                'International arbitration coordination',
                'Foreign remittance and repatriation compliance',
                'Cross-border tax and regulatory alignment'
            ],
            regulatory: [
                'Regulatory notice response and representation',
                'Licensing and permit defense strategy',
                'Administrative hearing submissions',
                'Judicial review and writ preparation',
                'Public procurement compliance advisory',
                'Sector regulator engagement support',
                'Compliance audit and corrective roadmap',
                'Environmental and operational approvals strategy',
                'Telecom and digital regulatory compliance',
                'Anti-corruption and governance advisory',
                'Statutory appeal filing and representation',
                'Policy impact and legal risk assessment'
            ]
        };

        const universalSubServiceFallback = [
            'Legal notice drafting and response',
            'Document review and legal opinion',
            'Evidence and records preparation',
            'Negotiation and settlement support',
            'Court filing and procedural representation',
            'Interim relief and urgent petition strategy',
            'Hearing management and case updates',
            'Appeal and revision planning',
            'Order or decree execution support',
            'Compliance and post-case advisory'
        ];

        const categoryBangladeshDefaults = {
            business: {
                regulators: ['RJSC', 'BIDA OSS', 'City Corporation/Local Authority', 'NBR'],
                approvals: ['Entity and tax onboarding documents', 'License/permit sequencing by activity', 'Post-registration compliance calendar'],
                riskFlags: ['Incorrect filing sequence delays approvals', 'Mismatch between activity and license scope', 'Tax onboarding gaps at launch'],
                escalation: ['Administrative representation', 'Appellate forum strategy', 'Writ remedy if process stalls'],
                readinessHint: 'Focus first on complete filing packs, source documents, and signing authority clarity.'
            },
            tax: {
                regulators: ['NBR (Income Tax/VAT)', 'Customs (where relevant)'],
                approvals: ['Tax registration/profile updates', 'Return and document trail checks', 'Notice response and hearing preparation'],
                riskFlags: ['Incomplete supporting records', 'Classification/valuation disagreements', 'Late or inconsistent submissions'],
                escalation: ['Departmental review', 'Tribunal/appeal pathway', 'Constitutional remedy where lawful'],
                readinessHint: 'Maintain reconciled records and notice-wise response bundles before hearings begin.'
            },
            property: {
                regulators: ['Sub-Registrar Office', 'Land Records/Revenue Office', 'Local Development Authority'],
                approvals: ['Title and mutation verification', 'Transfer/lease documentation checks', 'Possession and utility documentation alignment'],
                riskFlags: ['Title chain breaks', 'Unregistered interests/encumbrances', 'Possession-document mismatch'],
                escalation: ['Negotiated settlement route', 'Civil recovery/injunction strategy', 'Execution and enforcement support'],
                readinessHint: 'Verify title chain early and lock documentary consistency before transaction execution.'
            },
            criminal: {
                regulators: ['Police Investigation Wing', 'Criminal Courts', 'Sectoral Enforcement Bodies'],
                approvals: ['Immediate case document collection', 'Bail and hearing readiness bundle', 'Parallel civil/regulatory risk review'],
                riskFlags: ['Delayed evidence preservation', 'Uncoordinated case narrative', 'Ignoring parallel financial/regulatory exposure'],
                escalation: ['Interim protective applications', 'Revisional/appellate strategy', 'Constitutional challenge where required'],
                readinessHint: 'Prioritize timeline control, document preservation, and hearing strategy from day one.'
            },
            family: {
                regulators: ['Family Courts', 'Local Registration Authorities', 'Relevant Administrative Forums'],
                approvals: ['Case-specific affidavit/document preparation', 'Custody and maintenance evidence planning', 'Settlement and decree execution support'],
                riskFlags: ['Insufficient financial disclosure', 'Weak evidence chronology', 'Unstructured interim relief requests'],
                escalation: ['Mediation-first pathway', 'Court-led adjudication', 'Appeal/revision strategy'],
                readinessHint: 'Prepare financial and relationship records chronologically for stronger hearing outcomes.'
            },
            international: {
                regulators: ['BIDA/Relevant IPA', 'Immigration Authorities', 'NBR/Customs as applicable'],
                approvals: ['Entry and operational approvals roadmap', 'Cross-border contract and tax alignment', 'Ongoing reporting/compliance calendar'],
                riskFlags: ['Cross-border documentation inconsistency', 'Jurisdiction/conflict of law exposure', 'Permit expiry or renewal delays'],
                escalation: ['Agency-level resolution', 'Contractual dispute forum actions', 'Court intervention where justified'],
                readinessHint: 'Align immigration, tax, and contract tracks early to avoid downstream approval conflicts.'
            },
            regulatory: {
                regulators: ['Relevant Sector Regulator', 'Administrative Tribunal/Courts', 'Higher Judiciary'],
                approvals: ['Regulatory filing and representation sequence', 'Compliance defense documentation', 'Remedial petition planning'],
                riskFlags: ['Unanswered notices', 'Procedural non-compliance', 'Missed limitation windows'],
                escalation: ['Regulatory hearing', 'Statutory appeal', 'Judicial review/writ as appropriate'],
                readinessHint: 'Document every regulator communication and preserve procedural timelines rigorously.'
            }
        };

        const serviceBangladeshProfiles = {
            'company-formation': {
                regulators: ['RJSC', 'NBR', 'City Corporation Trade Licensing'],
                approvals: ['Name clearance and incorporation filing', 'TIN/VAT onboarding and bank account readiness', 'Trade license and activity-based local permits'],
                riskFlags: ['Objects clause not aligned with actual operations', 'Shareholding/governance mismatch in filings', 'Delayed post-incorporation compliance'],
                escalation: ['Corrective filing and representation', 'Regulatory hearing support', 'Judicial remedy for persistent administrative delay']
            },
            'business-setup': {
                regulators: ['BIDA OSS', 'City Corporation/Local Authority', 'NBR'],
                approvals: ['Approval checklist sequencing by business profile', 'Licenses/permits routing across agencies', 'Operational compliance calendar activation'],
                riskFlags: ['Starting operations before approvals are complete', 'Wrong agency routing for permit applications', 'Incomplete supporting documents'],
                escalation: ['Agency-level follow-up and representation', 'Appellate filing where refusal occurs', 'Court intervention for unreasonable delay']
            },
            'foreign-investment': {
                regulators: ['BIDA', 'Relevant IPA (BEZA/BEPZA/BHTPA/BSCIC/PPPA)', 'NBR'],
                approvals: ['Investment entry structuring and approvals', 'Entity, tax, and licensing synchronization', 'Aftercare compliance and reporting map'],
                riskFlags: ['Inconsistent cross-border investment documents', 'Delay in multi-agency clearance path', 'Contract and license scope misalignment'],
                escalation: ['Facilitated inter-agency representation', 'Contractual forum activation', 'Higher-court remedy in public law issues']
            },
            'taxation-systems': {
                regulators: ['NBR Income Tax Wing', 'NBR VAT Wing'],
                approvals: ['Tax profile setup and periodic filings', 'Audit response dossier building', 'Appeal readiness and representation'],
                riskFlags: ['Record-reconciliation gaps', 'Late responses to statutory notices', 'Inadequate hearing preparation'],
                escalation: ['Departmental review', 'Tax appellate forum', 'Judicial review where legal grounds exist']
            },
            'vat-tax': {
                regulators: ['NBR VAT', 'Bangladesh Customs'],
                approvals: ['VAT/eBIN compliance workflow', 'Customs classification and valuation support', 'Duty and indirect tax objection handling'],
                riskFlags: ['Misclassification and valuation disputes', 'Input-output reconciliation inconsistencies', 'Insufficient customs documentation trail'],
                escalation: ['Assessment objection stage', 'Tribunal/appellate representation', 'Constitutional remedy if required']
            },
            'labour-employment': {
                regulators: ['DIFE', 'Labour Court/Tribunal'],
                approvals: ['Employment documentation and policy checks', 'Inspection-readiness and compliance support', 'Dispute prevention and response protocol'],
                riskFlags: ['Non-compliant contracts or workplace documentation', 'Inspection findings not remediated in time', 'Escalation of employee disputes'],
                escalation: ['Administrative settlement', 'Labour forum representation', 'High court recourse on legal questions']
            },
            'real-estate': {
                regulators: ['Sub-Registrar', 'Land Records Office', 'Local Development Authority'],
                approvals: ['Title due diligence and mutation mapping', 'Transfer/lease execution checks', 'Possession, utility, and compliance alignment'],
                riskFlags: ['Title defects and hidden encumbrances', 'Developer handover non-compliance', 'Drafting gaps in transfer instruments'],
                escalation: ['Negotiated rectification', 'Civil injunction/recovery action', 'Decree enforcement steps']
            },
            'land-documentation': {
                regulators: ['Land Records Office', 'Sub-Registrar'],
                approvals: ['Chain-of-title verification', 'Mutation and record update support', 'Document authentication and defect cure'],
                riskFlags: ['Record inconsistencies between deed and land records', 'Missing predecessor documents', 'Boundary/ownership conflicts'],
                escalation: ['Administrative correction', 'Civil declaration and injunction', 'Appellate/judicial remedy']
            },
            'tenant-rights': {
                regulators: ['Civil Courts', 'Relevant Administrative Offices'],
                approvals: ['Lease review and compliance checklist', 'Rent/service charge dispute strategy', 'Possession and eviction defense protocol'],
                riskFlags: ['Unclear termination and escalation clauses', 'Improper notice service', 'Deposit and maintenance disputes'],
                escalation: ['Settlement and notice cure', 'Civil action for possession or defense', 'Appeal and enforcement support']
            },
            'intellectual-property': {
                regulators: ['DPDT and Relevant IP Authorities', 'Civil/Criminal Courts'],
                approvals: ['IP filing and ownership chain validation', 'Licensing and assignment documentation', 'Infringement response and enforcement planning'],
                riskFlags: ['Unclear ownership in employment/vendor arrangements', 'Delayed filing or renewal actions', 'Weak evidence preservation in infringement cases'],
                escalation: ['Notice-and-takedown actions', 'Civil injunction and damages claim', 'Criminal complaint support where applicable']
            },
            'telecommunication': {
                regulators: ['BTRC and Relevant Digital Regulators'],
                approvals: ['Telecom/digital compliance checklist', 'Technology contract and data governance review', 'Content/platform risk response strategy'],
                riskFlags: ['License scope overreach', 'Data governance control gaps', 'Contractual liability imbalance'],
                escalation: ['Regulatory engagement and clarification', 'Administrative appeal pathways', 'Judicial review where justified']
            },
            'international-trade': {
                regulators: ['Bangladesh Customs', 'NBR', 'Trade Facilitation Portals'],
                approvals: ['Import-export documentation sequencing', 'Tariff and rule-position support', 'Cross-border contract and dispute safeguards'],
                riskFlags: ['Classification and origin disputes', 'Incomplete documentary compliance', 'Forum mismatch in trade contracts'],
                escalation: ['Customs objection handling', 'Appeal/tribunal process', 'Court-led trade dispute resolution']
            },
            'writ-matters': {
                regulators: ['High Court Division', 'Concerned Public Authorities'],
                approvals: ['Maintainability and jurisdiction review', 'Urgent interim relief design', 'Rule hearing and compliance strategy'],
                riskFlags: ['Missed timeline or limitation concerns', 'Procedural defects in pleadings', 'Insufficient documentary basis against authority action'],
                escalation: ['Interim relief hearing', 'Rule disposal and follow-up', 'Further appellate strategy if needed']
            },
            'judicial-review': {
                regulators: ['High Court Division', 'Administrative Bodies'],
                approvals: ['Grounds review for jurisdictional error or procedural unfairness', 'Record compilation and affidavit support', 'Targeted relief framing'],
                riskFlags: ['Inadequate record of administrative process', 'Late challenge after limitation windows', 'Overbroad relief claims'],
                escalation: ['Administrative representation', 'Judicial review proceedings', 'Appellate/corrective relief if required']
            },
            'civil-litigation': {
                regulators: ['Civil Courts', 'Alternative Forums where applicable'],
                approvals: ['Pre-suit strategy and evidence preservation', 'Interim relief planning', 'Execution-readiness for final orders'],
                riskFlags: ['Weak documentary chronology', 'Delay in interim applications', 'Execution planning ignored until late stage'],
                escalation: ['Settlement and mediation track', 'Trial and decree pathway', 'Execution and enforcement actions']
            },
            'criminal-defense': {
                regulators: ['Criminal Courts', 'Investigative Authorities'],
                approvals: ['Immediate case assessment and bail planning', 'Evidence and witness protection strategy', 'Parallel exposure management'],
                riskFlags: ['Early statement inconsistency', 'Delayed legal intervention', 'Unmanaged parallel civil/regulatory risks'],
                escalation: ['Bail and interim relief', 'Trial strategy execution', 'Revision/appeal actions']
            }
        };

        const serviceMetadataOverrides = {
            'family-matters': {
                aliases: ['divorce', 'child custody', 'custody', 'maintenance', 'alimony', 'domestic violence'],
                keywords: ['family court', 'separation', 'guardianship'],
                urgencyLevel: 'High',
                expectedResponseTime: 'Within 30 minutes',
                category: 'family'
            },
            'criminal-defense': {
                aliases: ['bail', 'arrest', 'police case', 'fir', 'white collar crime'],
                keywords: ['criminal trial', 'remand', 'anticipatory bail'],
                urgencyLevel: 'Critical',
                expectedResponseTime: 'Within 15 minutes',
                category: 'criminal'
            },
            'company-formation': {
                aliases: ['rjsc', 'register company', 'startup setup', 'trade license'],
                keywords: ['incorporation', 'memorandum', 'articles'],
                urgencyLevel: 'Medium',
                expectedResponseTime: 'Within 1 hour',
                category: 'business'
            },
            'business-setup': {
                aliases: ['new business', 'open company', 'foreign business'],
                keywords: ['business license', 'joint venture'],
                urgencyLevel: 'Medium',
                expectedResponseTime: 'Within 1 hour',
                category: 'business'
            },
            'immigration-law': {
                aliases: ['immigration visa', 'visa', 'work permit', 'residency'],
                keywords: ['citizenship', 'entry permit'],
                urgencyLevel: 'High',
                expectedResponseTime: 'Within 45 minutes',
                category: 'international'
            },
            'intellectual-property': {
                aliases: ['trademark', 'copyright', 'patent', 'brand protection'],
                keywords: ['ip registration', 'infringement'],
                urgencyLevel: 'Medium',
                expectedResponseTime: 'Within 1 hour',
                category: 'business'
            },
            'real-estate': {
                aliases: ['land dispute', 'property issue', 'flat handover', 'real estate'],
                keywords: ['title verification', 'deed'],
                urgencyLevel: 'High',
                expectedResponseTime: 'Within 30 minutes',
                category: 'property'
            },
            'land-documentation': {
                aliases: ['land paper', 'mutation', 'khatian', 'registry'],
                keywords: ['land registration', 'title'],
                urgencyLevel: 'High',
                expectedResponseTime: 'Within 30 minutes',
                category: 'property'
            },
            'tenant-rights': {
                aliases: ['tenancy', 'tenant issue', 'rent dispute', 'eviction'],
                keywords: ['landlord tenant'],
                urgencyLevel: 'High',
                expectedResponseTime: 'Within 30 minutes',
                category: 'property'
            },
            'taxation-systems': {
                aliases: ['income tax', 'corporate tax', 'tax return'],
                keywords: ['tax planning', 'tax audit'],
                urgencyLevel: 'Medium',
                expectedResponseTime: 'Within 1 hour',
                category: 'tax'
            },
            'vat-tax': {
                aliases: ['vat', 'customs', 'import duty', 'export duty'],
                keywords: ['vat compliance', 'customs assessment'],
                urgencyLevel: 'Medium',
                expectedResponseTime: 'Within 1 hour',
                category: 'tax'
            }
        };

        const serviceIcons = {
            'civil-litigation': 'fa-gavel',
            'company-formation': 'fa-building',
            'criminal-defense': 'fa-shield-halved',
            'family-matters': 'fa-users',
            'intellectual-property': 'fa-lightbulb',
            'real-estate': 'fa-landmark',
            'immigration-law': 'fa-passport',
            'land-documentation': 'fa-file-signature',
            'taxation-systems': 'fa-receipt'
        };

        let serviceItems = Array.from(directoryContainer.querySelectorAll('.service-item'));
        let lastFocusedElement = null;
        let activeCategory = 'all';
        let currentSearchTerm = '';
        let lastVisibleMatches = [];
        let autocompleteResults = [];
        let activeSuggestionIndex = -1;
        let autocompleteCorpus = [];

        const categoryPriority = ['criminal', 'family', 'property', 'tax', 'international', 'business', 'regulatory'];
        const categoryMatchers = {
            criminal: /(criminal|bail|arrest|fraud|prosecution|defense)/,
            family: /(family|custody|divorce|marriage|domestic)/,
            property: /(land|property|tenant|real estate|mortgage|documentation)/,
            tax: /(tax|vat|customs|duty)/,
            international: /(international|foreign|immigration|global|trade|citizenship|shipping|marine|aviation)/,
            business: /(corporate|company|commercial|banking|contract|finance|equity|procurement|project|investment|intellectual property)/,
            regulatory: /(administrative|constitutional|judicial|writ|government|environmental|telecommunication|labour)/
        };

        function normalizeText(text) {
            return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
        }

        function uniqueList(items) {
            return Array.from(new Set(items.filter(Boolean).map(item => normalizeText(item)).filter(Boolean)));
        }

        function uniqueCaseList(items) {
            return Array.from(new Set(items.filter(Boolean).map(item => String(item).trim()).filter(Boolean)));
        }

        function getShortDescription(text) {
            const normalized = String(text || '').replace(/\s+/g, ' ').trim();
            if (!normalized) return '';

            const sentenceMatch = normalized.match(/^.*?[.!?](\s|$)/);
            const firstSentence = sentenceMatch ? sentenceMatch[0].trim() : normalized;

            if (firstSentence.length <= 180) {
                return firstSentence;
            }

            return `${firstSentence.slice(0, 177).trimEnd()}...`;
        }

        function levenshteinDistance(a, b) {
            const source = String(a || '');
            const target = String(b || '');
            if (!source.length) return target.length;
            if (!target.length) return source.length;

            const prev = new Array(target.length + 1);
            const curr = new Array(target.length + 1);

            for (let j = 0; j <= target.length; j += 1) {
                prev[j] = j;
            }

            for (let i = 1; i <= source.length; i += 1) {
                curr[0] = i;
                for (let j = 1; j <= target.length; j += 1) {
                    const cost = source[i - 1] === target[j - 1] ? 0 : 1;
                    curr[j] = Math.min(
                        prev[j] + 1,
                        curr[j - 1] + 1,
                        prev[j - 1] + cost
                    );
                }
                for (let j = 0; j <= target.length; j += 1) {
                    prev[j] = curr[j];
                }
            }

            return prev[target.length];
        }

        function maxAllowedDistance(termLength) {
            if (termLength <= 4) return 1;
            if (termLength <= 8) return 2;
            return 3;
        }

        function buildWhatsAppLink(phone, serviceTitle) {
            const normalizedPhone = String(phone || '').replace(/\D/g, '');
            const message = encodeURIComponent(`Hello, I need legal help regarding ${serviceTitle}.`);
            return `https://wa.me/${normalizedPhone}?text=${message}`;
        }

        function inferCategoryFromData(data) {
            const haystack = normalizeText(`${data.title} ${data.description} ${(data.services || []).join(' ')}`);
            for (const category of categoryPriority) {
                if (categoryMatchers[category].test(haystack)) return category;
            }
            return 'business';
        }

        function enrichServiceData() {
            Object.entries(serviceData).forEach(([key, data]) => {
                const override = serviceMetadataOverrides[key] || {};
                const category = override.category || inferCategoryFromData(data);
                const lawyerKey = serviceLawyerOverrides[key] || categoryLawyerMap[category] || 'kamal';
                const lawyer = lawyerDirectory[lawyerKey] || lawyerDirectory.kamal;

                data.category = category;
                data.categoryLabel = categoryLabelMap[category] || 'Legal Service';
                data.urgencyLevel = override.urgencyLevel || (category === 'criminal' ? 'Critical' : category === 'family' || category === 'property' ? 'High' : 'Medium');
                data.expectedResponseTime = override.expectedResponseTime || (data.urgencyLevel === 'Critical' ? 'Within 15 minutes' : data.urgencyLevel === 'High' ? 'Within 30 minutes' : 'Within 1 hour');

                data.keywords = uniqueList([
                    ...(data.keywords || []),
                    ...(override.keywords || []),
                    data.title,
                    data.categoryLabel,
                    ...data.services
                ]);

                data.aliases = uniqueList([
                    ...(data.aliases || []),
                    ...(override.aliases || []),
                    data.title
                ]);

                data.recommendedLawyer = lawyer.name;
                data.lawyerRole = lawyer.role;
                data.lawyerProfileUrl = lawyer.profileUrl;
                data.lawyerPhone = lawyer.phone;
                data.lawyerWhatsAppLink = buildWhatsAppLink(lawyer.phone, data.title);
                data.lawyerTrust = lawyer.trust;
            });
        }

        function getBangladeshProfileForService(serviceKey, data) {
            const categoryDefaults = categoryBangladeshDefaults[data.category] || categoryBangladeshDefaults.business;
            const serviceOverride = serviceBangladeshProfiles[serviceKey] || {};

            return {
                regulators: uniqueCaseList([...(serviceOverride.regulators || []), ...(categoryDefaults.regulators || [])]),
                approvals: uniqueCaseList([...(serviceOverride.approvals || []), ...(categoryDefaults.approvals || [])]),
                riskFlags: uniqueCaseList([...(serviceOverride.riskFlags || []), ...(categoryDefaults.riskFlags || [])]),
                escalation: uniqueCaseList([...(serviceOverride.escalation || []), ...(categoryDefaults.escalation || [])]),
                readinessHint: serviceOverride.readinessHint || categoryDefaults.readinessHint
            };
        }

        function getSubServiceEntriesForService(serviceKey, data) {
            const mappedEntries = Object.entries(subServiceLibrary)
                .filter(([, subService]) => (subService.parentServices || []).includes(serviceKey))
                .map(([id, subService]) => ({
                    id,
                    title: subService.title,
                    description: subService.description,
                    parentServices: subService.parentServices || [serviceKey]
                }));

            const fallbackEntries = (data.services || []).map((label, index) => ({
                id: `legacy-${serviceKey}-${index + 1}`,
                title: label,
                description: '',
                parentServices: [serviceKey]
            }));

            const categoryEntries = (categorySubServicePools[data.category] || []).map((title, index) => ({
                id: `category-${data.category}-${index + 1}`,
                title,
                description: '',
                parentServices: [serviceKey]
            }));

            const universalEntries = universalSubServiceFallback.map((title, index) => ({
                id: `universal-${serviceKey}-${index + 1}`,
                title,
                description: '',
                parentServices: [serviceKey]
            }));

            const deduped = new Map();
            [...mappedEntries, ...fallbackEntries, ...categoryEntries, ...universalEntries].forEach((entry) => {
                const key = normalizeText(entry.title);
                if (!deduped.has(key)) {
                    deduped.set(key, entry);
                }
            });

            return Array.from(deduped.values()).slice(0, MIN_MODAL_SUBSERVICES);
        }

        function applyBangladeshEnhancements() {
            Object.entries(serviceData).forEach(([serviceKey, data]) => {
                const profile = getBangladeshProfileForService(serviceKey, data);
                const subServices = getSubServiceEntriesForService(serviceKey, data);

                data.bangladeshProfile = profile;
                data.subServices = subServices;
                data.services = subServices.map((item) => item.title);

                data.keywords = uniqueList([
                    ...(data.keywords || []),
                    ...profile.regulators,
                    ...profile.approvals,
                    ...profile.riskFlags,
                    ...subServices.map((item) => item.title)
                ]);
            });
        }

        enrichServiceData();
        applyBangladeshEnhancements();

        function buildAutocompleteCorpus() {
            const corpus = [];

            Object.entries(serviceData).forEach(([serviceKey, data]) => {
                const localSeen = new Set();

                function pushEntry(queryText, type, baseWeight) {
                    const normalized = normalizeText(queryText);
                    if (!normalized || localSeen.has(normalized)) return;
                    localSeen.add(normalized);

                    corpus.push({
                        serviceKey,
                        serviceTitle: data.title,
                        categoryLabel: data.categoryLabel || 'Legal Service',
                        queryText: String(queryText || '').trim(),
                        normalized,
                        tokens: normalized.split(' ').filter(Boolean),
                        type,
                        baseWeight
                    });
                }

                pushEntry(data.title, 'service-title', 24);
                (data.services || []).forEach((servicePhrase) => {
                    pushEntry(servicePhrase, 'included-service', 12);
                });
            });

            autocompleteCorpus = corpus;
        }

        buildAutocompleteCorpus();

        function getIconForService(key) {
            return serviceIcons[key] || 'fa-gavel';
        }

        function readServiceClickCounts() {
            try {
                const raw = localStorage.getItem(SERVICE_CLICK_STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (error) {
                return {};
            }
        }

        function writeServiceClickCounts(counts) {
            try {
                localStorage.setItem(SERVICE_CLICK_STORAGE_KEY, JSON.stringify(counts));
            } catch (error) {
                // Ignore storage restrictions and keep runtime behavior.
            }
        }

        function incrementServiceClickCount(serviceKey) {
            if (!serviceData[serviceKey]) return;

            const counts = readServiceClickCounts();
            counts[serviceKey] = (Number(counts[serviceKey]) || 0) + 1;
            writeServiceClickCounts(counts);
        }

        function getPopularServiceKeys() {
            const counts = readServiceClickCounts();
            const validKeys = Object.keys(serviceData).filter((key) => !invalidServiceKeys.has(key));

            return validKeys
                .sort((a, b) => {
                    const aClicks = Number(counts[a]) || 0;
                    const bClicks = Number(counts[b]) || 0;

                    if (bClicks !== aClicks) {
                        return bClicks - aClicks;
                    }

                    const aSeed = defaultDemandSeed[a] || 0;
                    const bSeed = defaultDemandSeed[b] || 0;
                    if (bSeed !== aSeed) {
                        return bSeed - aSeed;
                    }

                    return String(serviceData[a]?.title || '').localeCompare(String(serviceData[b]?.title || ''));
                })
                .slice(0, POPULAR_SERVICE_LIMIT);
        }

        function buildSearchHaystack(data) {
            return normalizeText([
                data.title,
                data.description,
                data.categoryLabel,
                data.recommendedLawyer,
                ...(data.services || []),
                ...(data.keywords || []),
                ...(data.aliases || [])
            ].join(' '));
        }

        function getScoreForTerm(data, rawTerm) {
            const strictScore = getStrictScoreForTerm(data, rawTerm);
            const fuzzyScore = getFuzzyScoreForTerm(data, rawTerm);
            return strictScore + fuzzyScore;
        }

        function getStrictScoreForTerm(data, rawTerm) {
            if (!rawTerm) return 1;
            const term = normalizeText(rawTerm);
            if (!term) return 1;

            const haystack = buildSearchHaystack(data);
            const tokens = term.split(' ').filter(Boolean);
            let score = 0;

            if (haystack.includes(term)) score += 20;
            if (normalizeText(data.title).includes(term)) score += 30;

            tokens.forEach(token => {
                if (haystack.includes(token)) score += 6;
                if ((data.aliases || []).some(alias => alias.includes(token))) score += 8;
                if ((data.keywords || []).some(keyword => keyword.includes(token))) score += 5;
            });

            return score;
        }

        function getFuzzyScoreForTerm(data, rawTerm) {
            const term = normalizeText(rawTerm);
            if (!term || term.length < 3) return 0;

            const tokens = term.split(' ').filter(Boolean);
            if (!tokens.length) return 0;

            const candidatePool = uniqueList([
                data.title,
                ...(data.aliases || []),
                ...(data.keywords || [])
            ]);

            const candidateTokens = candidatePool
                .flatMap(value => value.split(' '))
                .filter(token => token.length >= 3);

            if (!candidateTokens.length) return 0;

            let score = 0;

            tokens.forEach((token) => {
                if (token.length < 3) return;
                const threshold = maxAllowedDistance(token.length);
                let bestDistance = Number.POSITIVE_INFINITY;

                candidateTokens.forEach((candidate) => {
                    if (Math.abs(candidate.length - token.length) > threshold + 1) return;
                    const distance = levenshteinDistance(token, candidate);
                    if (distance < bestDistance) bestDistance = distance;
                });

                if (Number.isFinite(bestDistance) && bestDistance <= threshold) {
                    score += Math.max(2, 10 - bestDistance * 3);
                }
            });

            return score;
        }

        function getRankedServiceKeys(term) {
            return Object.entries(serviceData)
                .map(([key, data]) => ({ key, score: getScoreForTerm(data, term) }))
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.key);
        }

        function getDidYouMeanKey(rawTerm) {
            const term = normalizeText(rawTerm);
            if (!term || term.length < 3) return null;

            const candidates = Object.entries(serviceData)
                .map(([key, data]) => {
                    const strict = getStrictScoreForTerm(data, term);
                    const fuzzy = getFuzzyScoreForTerm(data, term);
                    return { key, strict, fuzzy, total: strict + fuzzy };
                })
                .filter(item => item.fuzzy > 0)
                .sort((a, b) => {
                    if (b.fuzzy !== a.fuzzy) return b.fuzzy - a.fuzzy;
                    return b.total - a.total;
                });

            const best = candidates[0];
            if (!best) return null;

            if (best.strict > 0) {
                const exactTitle = normalizeText(serviceData[best.key]?.title || '');
                if (exactTitle === term) {
                    return null;
                }
            }

            return best.key;
        }

        function hideSuggestions() {
            if (!suggestionsList) return;
            suggestionsList.hidden = true;
            suggestionsList.innerHTML = '';
            activeSuggestionIndex = -1;
            autocompleteResults = [];
            searchInput?.setAttribute('aria-expanded', 'false');
            searchInput?.removeAttribute('aria-activedescendant');
        }

        function setActiveSuggestion(nextIndex) {
            if (!suggestionsList || !autocompleteResults.length) {
                activeSuggestionIndex = -1;
                return;
            }

            const total = autocompleteResults.length;
            activeSuggestionIndex = (nextIndex + total) % total;

            const options = Array.from(suggestionsList.querySelectorAll('.service-search-suggestion'));
            options.forEach((option, index) => {
                const isActive = index === activeSuggestionIndex;
                option.classList.toggle('active', isActive);
                option.setAttribute('aria-selected', isActive ? 'true' : 'false');
                if (isActive) {
                    searchInput?.setAttribute('aria-activedescendant', option.id);
                    option.scrollIntoView({ block: 'nearest' });
                }
            });
        }

        function applyAutocompleteSelection(selection, shouldOpenModal = false) {
            if (!searchInput) return;

            const selectedItem = typeof selection === 'string'
                ? {
                    serviceKey: selection,
                    queryText: serviceData[selection]?.title || selection
                }
                : selection;

            const serviceKey = selectedItem?.serviceKey;
            const queryText = String(selectedItem?.queryText || serviceData[serviceKey]?.title || '').trim();

            if (!queryText) return;

            searchInput.value = queryText;
            filterServices(queryText);
            hideSuggestions();

            if (shouldOpenModal && serviceKey) {
                openModal(serviceKey);
            }
        }

        function getAutocompleteResults(rawTerm, limit = 6) {
            const term = normalizeText(rawTerm);
            if (!term) return [];

            const queryTokens = term.split(' ').filter(Boolean);
            const scored = autocompleteCorpus
                .map((entry) => {
                    let score = 0;

                    if (entry.normalized.startsWith(term)) {
                        score += entry.type === 'service-title' ? 48 : 36;
                    }

                    if (entry.normalized.includes(term)) {
                        score += entry.type === 'service-title' ? 36 : 28;
                    }

                    queryTokens.forEach((token) => {
                        if (!token) return;

                        if (entry.normalized.includes(token)) {
                            score += entry.type === 'service-title' ? 10 : 8;
                        }

                        if (token.length >= 3) {
                            const threshold = maxAllowedDistance(token.length);
                            let bestDistance = Number.POSITIVE_INFINITY;

                            entry.tokens.forEach((candidateToken) => {
                                if (Math.abs(candidateToken.length - token.length) > threshold + 1) return;
                                const distance = levenshteinDistance(token, candidateToken);
                                if (distance < bestDistance) bestDistance = distance;
                            });

                            if (Number.isFinite(bestDistance) && bestDistance <= threshold) {
                                score += Math.max(1, 8 - bestDistance * 2);
                            }
                        }
                    });

                    if (score <= 0) return null;

                    return {
                        ...entry,
                        score: score + entry.baseWeight
                    };
                })
                .filter(Boolean);

            const deduped = new Map();
            scored.forEach((entry) => {
                const existing = deduped.get(entry.normalized);
                if (!existing || entry.score > existing.score) {
                    deduped.set(entry.normalized, entry);
                }
            });

            return Array.from(deduped.values())
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    if (a.type !== b.type) {
                        return a.type === 'service-title' ? -1 : 1;
                    }
                    if (a.queryText.length !== b.queryText.length) {
                        return a.queryText.length - b.queryText.length;
                    }
                    return a.queryText.localeCompare(b.queryText);
                })
                .slice(0, limit)
                .map((entry) => ({
                    serviceKey: entry.serviceKey,
                    queryText: entry.queryText,
                    categoryLabel: entry.categoryLabel,
                    serviceTitle: entry.serviceTitle,
                    type: entry.type
                }));
        }

        function renderSearchSuggestions(rawTerm) {
            if (!suggestionsList || !searchInput) return;

            const term = normalizeText(rawTerm);
            if (!term) {
                hideSuggestions();
                return;
            }

            autocompleteResults = getAutocompleteResults(term);
            activeSuggestionIndex = -1;

            if (!autocompleteResults.length) {
                hideSuggestions();
                return;
            }

            suggestionsList.innerHTML = '';

            autocompleteResults.forEach((result, index) => {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'service-search-suggestion';
                option.classList.add(result.type === 'service-title' ? 'is-service' : 'is-phrase');
                option.id = `serviceSuggestion-${index}`;
                option.setAttribute('role', 'option');
                option.setAttribute('aria-selected', 'false');
                option.dataset.service = result.serviceKey;

                const title = document.createElement('span');
                title.className = 'service-search-suggestion-title';
                title.textContent = result.queryText;

                const meta = document.createElement('span');
                meta.className = 'service-search-suggestion-meta';
                meta.textContent = result.type === 'service-title'
                    ? `${result.categoryLabel} service`
                    : `Includes in ${result.serviceTitle}`;

                option.appendChild(title);
                option.appendChild(meta);

                option.addEventListener('mouseenter', () => {
                    setActiveSuggestion(index);
                });

                option.addEventListener('click', () => {
                    applyAutocompleteSelection(result);
                });

                suggestionsList.appendChild(option);
            });

            suggestionsList.hidden = false;
            searchInput.setAttribute('aria-expanded', 'true');
        }

        function renderPopularServices() {
            if (!popularContainer) return;

            popularContainer.innerHTML = '';

            getPopularServiceKeys().forEach(key => {
                const data = serviceData[key];
                if (!data) return;

                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 d-flex';

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'service-item popular-service-card w-100';
                button.setAttribute('data-service', key);
                button.setAttribute('aria-label', `Open details for ${data.title}`);
                button.addEventListener('click', () => openModal(key));

                const icon = document.createElement('div');
                icon.className = 'service-item-icon';
                icon.innerHTML = `<i class="fas ${getIconForService(key)}"></i>`;

                const title = document.createElement('p');
                title.className = 'service-item-title';
                title.textContent = data.title;

                button.appendChild(icon);
                button.appendChild(title);

                col.appendChild(button);
                popularContainer.appendChild(col);
            });
        }

        function renderCategoryFilters() {
            if (!categoryFilters) return;

            const orderedCategories = ['all', 'business', 'family', 'criminal', 'property', 'tax', 'international', 'regulatory'];
            categoryFilters.innerHTML = '';

            orderedCategories.forEach(categoryKey => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'service-category-chip';
                button.dataset.category = categoryKey;
                button.textContent = categoryLabelMap[categoryKey] || categoryKey;
                button.setAttribute('aria-pressed', categoryKey === activeCategory ? 'true' : 'false');
                if (categoryKey === activeCategory) button.classList.add('active');

                button.addEventListener('click', () => {
                    activeCategory = categoryKey;
                    categoryFilters.querySelectorAll('.service-category-chip').forEach(chip => {
                        const isActive = chip.dataset.category === activeCategory;
                        chip.classList.toggle('active', isActive);
                        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                    });
                    filterServices(currentSearchTerm);
                });

                categoryFilters.appendChild(button);
            });
        }

        function updateContextualCta({ serviceKey = null, term = '', category = activeCategory, matchCount = 0 } = {}) {
            if (!ctaTitle || !ctaDescription || !ctaButton) return;

            if (serviceKey && serviceData[serviceKey]) {
                const service = serviceData[serviceKey];
                ctaTitle.textContent = `Need help with ${service.title}?`;
                ctaDescription.textContent = `${service.recommendedLawyer} can review your matter. Typical response: ${service.expectedResponseTime}.`;
                ctaButton.textContent = `Book ${service.categoryLabel} Consultation`;
                ctaButton.href = `consultation.html?service=${encodeURIComponent(serviceKey)}`;
                return;
            }

            if (term && matchCount > 0) {
                ctaTitle.textContent = `Found ${matchCount} matching legal services`;
                ctaDescription.textContent = 'Pick any matched service to connect with the right lawyer instantly.';
                ctaButton.textContent = 'Book a Guided Consultation';
                ctaButton.href = 'consultation.html';
                return;
            }

            if (category && category !== 'all') {
                ctaTitle.textContent = `Need a ${categoryLabelMap[category]} lawyer?`;
                ctaDescription.textContent = 'Tell us your issue and our team will connect you to the best-matched attorney quickly.';
                ctaButton.textContent = `Connect to ${categoryLabelMap[category]} Team`;
                ctaButton.href = `consultation.html?category=${encodeURIComponent(category)}`;
                return;
            }

            ctaTitle.textContent = 'Have a question?';
            ctaDescription.textContent = 'Our experienced attorneys are ready to review your case and guide you through every step.';
            ctaButton.textContent = 'Request a Consultation';
            ctaButton.href = 'consultation.html';
        }

        function renderRescuePanel(term, options = {}) {
            if (!rescueContainer) return;

            const suggestions = getRankedServiceKeys(term).slice(0, 3);
            const didYouMeanKey = options.didYouMeanKey || null;
            rescueContainer.hidden = false;
            rescueContainer.innerHTML = '';

            const title = document.createElement('h3');
            title.className = 'service-rescue-title';
            title.textContent = 'No exact match found, but we can help immediately';

            const body = document.createElement('p');
            body.className = 'service-rescue-text';
            body.textContent = 'Try one of these close matches or connect with our legal team now.';

            let didYouMeanNode = null;
            if (didYouMeanKey && serviceData[didYouMeanKey]) {
                const didYouMean = document.createElement('p');
                didYouMean.className = 'service-rescue-did-you-mean';
                const didYouMeanButton = document.createElement('button');
                didYouMeanButton.type = 'button';
                didYouMeanButton.className = 'service-rescue-suggestion';
                didYouMeanButton.textContent = serviceData[didYouMeanKey].title;
                didYouMeanButton.addEventListener('click', () => {
                    applyAutocompleteSelection(didYouMeanKey, true);
                });

                didYouMean.textContent = 'Did you mean: ';
                didYouMean.appendChild(didYouMeanButton);
                didYouMeanNode = didYouMean;
            }

            const suggestionWrap = document.createElement('div');
            suggestionWrap.className = 'service-rescue-suggestions';

            suggestions.forEach((key) => {
                const data = serviceData[key];
                if (!data) return;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'service-rescue-suggestion';
                btn.textContent = data.title;
                btn.addEventListener('click', () => openModal(key));
                suggestionWrap.appendChild(btn);
            });

            const actions = document.createElement('div');
            actions.className = 'service-rescue-actions';
            actions.innerHTML = `
                <button type="button" class="btn btn-primary service-rescue-action" data-action="open-chat">Open Legal Assistant</button>
                <a class="btn btn-outline-primary service-rescue-action" href="tel:+8801713456800">Call +880 1713 456 800</a>
                <a class="btn btn-primary service-rescue-action" href="consultation.html">Book Consultation</a>
            `;

            actions.querySelector('[data-action="open-chat"]')?.addEventListener('click', () => {
                const bubble = document.querySelector('.kamal-chatbot-bubble');
                if (bubble) {
                    bubble.click();
                }
            });

            rescueContainer.appendChild(title);
            rescueContainer.appendChild(body);
            if (didYouMeanNode) {
                rescueContainer.appendChild(didYouMeanNode);
            }
            rescueContainer.appendChild(suggestionWrap);
            rescueContainer.appendChild(actions);
        }

        function hideRescuePanel() {
            if (!rescueContainer) return;
            rescueContainer.hidden = true;
            rescueContainer.innerHTML = '';
        }

        const alphabetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        function initAlphabetNav() {
            const sections = Array.from(directoryContainer.querySelectorAll('.service-section'));
            const availableLetters = new Set(sections.map(s => s.id.replace('section-', '')));

            alphabetNav.innerHTML = '';

            alphabetLetters.forEach(letter => {
                const li = document.createElement('li');
                li.className = 'list-inline-item';

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'alphabet-link';
                button.textContent = letter;
                button.disabled = !availableLetters.has(letter);
                if (!availableLetters.has(letter)) {
                    button.classList.add('disabled');
                }

                button.addEventListener('click', () => {
                    const target = document.getElementById(`section-${letter}`);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        document.querySelectorAll('.alphabet-link').forEach(el => el.classList.remove('active'));
                        button.classList.add('active');
                    }
                });

                li.appendChild(button);
                alphabetNav.appendChild(li);
            });
        }

        function filterServices(query) {
            currentSearchTerm = String(query || '');
            const term = normalizeText(currentSearchTerm);
            const matches = [];
            const strictMatches = [];

            serviceItems.forEach(item => {
                const key = item.dataset.service;
                const data = serviceData[key] || {};
                const categoryMatch = activeCategory === 'all' || data.category === activeCategory;
                const strictScore = getStrictScoreForTerm(data, term);
                const fuzzyScore = getFuzzyScoreForTerm(data, term);
                const score = strictScore + fuzzyScore;
                const termMatch = term === '' || score > 0;
                const visible = categoryMatch && termMatch;

                item.style.display = visible ? '' : 'none';
                item.setAttribute('aria-hidden', visible ? 'false' : 'true');
                if (visible) {
                    matches.push({ key, score, strictScore, fuzzyScore });
                }
                if (visible && strictScore > 0) {
                    strictMatches.push({ key, score: strictScore });
                }
            });

            directoryContainer.querySelectorAll('.service-section').forEach(section => {
                const visibleItems = Array.from(section.querySelectorAll('.service-item')).filter(el => el.style.display !== 'none');
                section.style.display = visibleItems.length ? '' : 'none';
            });

            matches.sort((a, b) => b.score - a.score);
            lastVisibleMatches = matches;

            if (term !== '' && (!matches.length || !strictMatches.length)) {
                renderRescuePanel(term, { didYouMeanKey: getDidYouMeanKey(term) });
            } else {
                hideRescuePanel();
            }

            updateContextualCta({ term, category: activeCategory, matchCount: matches.length, serviceKey: matches[0]?.key || null });
        }

        function openModal(serviceKey) {
            const data = serviceData[serviceKey];
            if (!data) return;

            incrementServiceClickCount(serviceKey);
            renderPopularServices();

            lastFocusedElement = document.activeElement;

            modalTitle.textContent = data.title;
            modalDescription.textContent = getShortDescription(data.description);
            modalServices.innerHTML = '';

            const subServices = data.subServices || (data.services || []).map((serviceLabel, index) => ({
                id: `fallback-${serviceKey}-${index + 1}`,
                title: serviceLabel,
                description: '',
                parentServices: [serviceKey]
            }));

            subServices.forEach((subService) => {
                const li = document.createElement('li');
                li.className = 'service-modal-subservice-item';
                li.textContent = subService.title;

                modalServices.appendChild(li);
            });

            if (modalLawyerName) modalLawyerName.textContent = data.recommendedLawyer || 'Kamal & Associates Team';
            if (modalLawyerRole) modalLawyerRole.textContent = `${data.lawyerRole || 'Legal Counsel'} | ${data.categoryLabel || 'Legal Service'}`;
            if (modalLawyerTrust) modalLawyerTrust.textContent = `${data.lawyerTrust || ''} | ${data.expectedResponseTime || 'Fast response available'}`;
            if (modalLawyerProfile) modalLawyerProfile.href = data.lawyerProfileUrl || 'attorneys.html';
            if (modalCallNow) modalCallNow.href = `tel:${String(data.lawyerPhone || '+8801713456800').replace(/\s+/g, '')}`;
            if (modalWhatsAppNow) modalWhatsAppNow.href = data.lawyerWhatsAppLink || buildWhatsAppLink('+880 1713 456 800', data.title);
            if (modalBookConsultation) modalBookConsultation.href = `consultation.html?service=${encodeURIComponent(serviceKey)}`;
            if (modalContactFallback) modalContactFallback.href = `contact.html?service=${encodeURIComponent(serviceKey)}`;

            updateContextualCta({ serviceKey });

            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            closeButton.focus();
        }

        function closeModal() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }

        serviceItems.forEach(item => {
            item.addEventListener('click', () => openModal(item.dataset.service));
        });

        searchInput.addEventListener('input', e => filterServices(e.target.value));
        searchInput.addEventListener('input', e => renderSearchSuggestions(e.target.value));
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' && autocompleteResults.length) {
                event.preventDefault();
                setActiveSuggestion(activeSuggestionIndex + 1);
                return;
            }

            if (event.key === 'ArrowUp' && autocompleteResults.length) {
                event.preventDefault();
                setActiveSuggestion(activeSuggestionIndex - 1);
                return;
            }

            if (event.key === 'Escape') {
                hideSuggestions();
                return;
            }

            if (event.key === 'Enter' && autocompleteResults.length && activeSuggestionIndex >= 0) {
                event.preventDefault();
                const selected = autocompleteResults[activeSuggestionIndex];
                if (selected) {
                    applyAutocompleteSelection(selected);
                }
                return;
            }

            if (event.key === 'Enter' && lastVisibleMatches.length) {
                event.preventDefault();
                openModal(lastVisibleMatches[0].key);
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                renderSearchSuggestions(searchInput.value);
            }
        });

        searchInput.addEventListener('blur', () => {
            window.setTimeout(() => {
                hideSuggestions();
            }, 120);
        });

        closeButton.addEventListener('click', closeModal);

        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        let scrollTicking = false;
        function updateActiveLetterOnScroll() {
            const sections = document.querySelectorAll('.service-section');
            const offset = window.innerHeight * 0.35;
            let activeLetter = null;

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= offset && rect.bottom > offset) {
                    activeLetter = section.id.replace('section-', '');
                }
            });

            if (activeLetter) {
                document.querySelectorAll('.alphabet-link').forEach(btn => {
                    btn.classList.toggle('active', btn.textContent === activeLetter);
                });
            }
        }

        function updateAlphabetNavVisibility() {
            const firstSection = document.getElementById('section-A') || directoryContainer.querySelector('.service-section');
            const footer = document.querySelector('footer.footer-section, footer');

            if (!alphabetNavContainer || !firstSection) {
                return;
            }

            const showThreshold = Math.max(110, window.innerHeight * 0.22);
            const firstSectionVisible = firstSection.style.display !== 'none';
            const firstReached = firstSectionVisible && firstSection.getBoundingClientRect().top <= showThreshold;
            const reachedFooter = footer ? footer.getBoundingClientRect().top <= window.innerHeight : false;
            const shouldShow = firstReached && !reachedFooter;

            alphabetNavContainer.classList.toggle('is-hidden', !shouldShow);
            alphabetNavContainer.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        }

        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                scrollTicking = true;
                window.requestAnimationFrame(() => {
                    updateActiveLetterOnScroll();
                    updateAlphabetNavVisibility();
                    scrollTicking = false;
                });
            }
        });

        window.addEventListener('resize', () => {
            window.requestAnimationFrame(() => {
                updateAlphabetNavVisibility();
            });
        });

        modal.addEventListener('wheel', event => {
            if (modal.classList.contains('show')) {
                event.stopPropagation();
            }
        });

        modal.addEventListener('keydown', event => {
            if (event.key === 'Tab') {
                const focusableElements = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
                if (!focusableElements.length) return;
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });

        initAlphabetNav();
        renderCategoryFilters();
        renderPopularServices();
        filterServices('');
        updateActiveLetterOnScroll();
        updateAlphabetNavVisibility();
    })();

    // ===== Testimonials Carousel =====
    const testimonials = [
        {
            text: '"Kamal & Associates provided exceptional guidance during our merger. Their expertise in corporate law and attention to detail ensured a smooth transaction. Highly recommended for any business legal needs."',
            name: 'Rahman Industries Ltd.',
            role: 'Corporate Client',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
        },
        {
            text: '"During my property dispute, the team at Kamal & Associates showed remarkable dedication. They handled my case with professionalism and achieved the best outcome. I am forever grateful."',
            name: 'Fatima Begum',
            role: 'Individual Client',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        },
        {
            text: '"Outstanding intellectual property services. They helped us protect our innovations and navigate complex IP regulations with ease. Their expertise is unmatched in the industry."',
            name: 'Bangladesh Tech Solutions',
            role: 'Corporate Client',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        }
    ];

    let currentTestimonial = 0;
    const testimonialText = document.getElementById('testimonialText');
    const testimonialName = document.getElementById('testimonialName');
    const testimonialRole = document.getElementById('testimonialRole');
    const testimonialImg = document.getElementById('testimonialImg');
    const testimonialDots = document.querySelectorAll('#testimonialDots .dot');

    function updateTestimonial(index) {
        if (!testimonialText) return;

        currentTestimonial = index;
        const t = testimonials[index];

        testimonialText.textContent = t.text;
        testimonialName.textContent = t.name;
        testimonialRole.textContent = t.role;
        testimonialImg.src = t.image;

        testimonialDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Auto-rotate testimonials
    if (testimonialText) {
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            updateTestimonial(currentTestimonial);
        }, 5000);

        // Click on dots
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => updateTestimonial(index));
        });
    }

    if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.owlCarousel === 'function') {
        (function ($) {
            "use strict";

            $(document).ready(function () {

                /* =================================
                   TESTIMONIALS CAROUSEL INITIALIZATION
                   ================================= */
                $(".testimonial-carousel").owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: false,       /* No left/right arrows */
                    dots: true,       /* Show bottom dots */
                    autoplay: true,
                    autoplayTimeout: 4000,
                    smartSpeed: 700,
                    responsive: {
                        0: {
                            items: 1  /* Mobile: 1 card */
                        },
                        768: {
                            items: 2  /* Tablet: 2 cards */
                        },
                        992: {
                            items: 3  /* Desktop: 3 cards */
                        }
                    }
                });

            });

        })(jQuery);


        /* =================================
           CLIENT LOGO CAROUSEL INITIALIZATION
           ================================= */
        $(".logo-carousel").owlCarousel({
            rtl: true,       /* Right to Left */
            loop: true,
            margin: 30,
            nav: false,         /* No arrows */
            dots: false,        /* No dots needed for logos */
            autoplay: true,     /* Auto Scroll */
            autoplayTimeout: 2000, /* Speed of slide */
            autoplayHoverPause: true, /* Stops if user hovers to look closer */
            responsive: {
                0: {
                    items: 2    /* 2 logos on mobile */
                },
                600: {
                    items: 3    /* 3 logos on tablet */
                },
                1000: {
                    items: 5    /* 5 logos on desktop */
                }
            }
        });
    } else if (window.jQuery) {
        console.warn('Owl Carousel plugin is not available. Skipping carousel initialization.');
    }

    // ===== Video Modal =====
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('show.bs.modal', function () {
            document.getElementById('videoFrame').src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
        });

        videoModal.addEventListener('hide.bs.modal', function () {
            document.getElementById('videoFrame').src = '';
        });
    }

    // ===== Back to Top Button =====
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Newsletter Form =====
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert('Thank you for subscribing! We will send updates to: ' + email);
            this.reset();
        });
    }

    // ===== Contact Office Map =====
    const contactOfficeMap = document.getElementById('contactOfficeMap');
    if (contactOfficeMap && window.L) {
        const officeLocations = [
            {
                title: 'High Court Chamber',
                coords: [23.7308509, 90.4013854],
                address: 'Supreme Court Bar Association<br>Room No. 709, 6th Floor<br>Annex Extension Building, Ramna, Dhaka - 1000'
            },
            {
                title: 'Judge Court Chamber',
                coords: [23.7103044, 90.4108056],
                address: 'Dhaka Bar Association<br>Room No. 7018, 6th Floor<br>Annex Extension Building-2, Dhaka-1100'
            },
            {
                title: 'Evening Chamber',
                coords: [23.7749862, 90.4123816],
                address: 'House #13, Road #07, Block #C<br>Flat #1-A, Ground Floor<br>Niketan, Gulshan, Dhaka-1212'
            }
        ];

        const map = L.map(contactOfficeMap, {
            scrollWheelZoom: false,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const bounds = [];

        officeLocations.forEach((office) => {
            const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${office.coords[0]},${office.coords[1]}`;
            const marker = L.marker(office.coords, {
                icon: L.divIcon({
                    className: 'office-map-marker-wrapper',
                    html: '<div class="office-map-marker"><span class="office-map-marker__pulse"></span><span class="office-map-marker__dot"></span></div>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                    popupAnchor: [0, -12]
                })
            }).addTo(map);

            marker.bindPopup(`
                <div class="office-map-popup">
                    <h6>${office.title}</h6>
                    <p>${office.address}</p>
                    <a class="office-map-directions" href="${directionUrl}" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-location-arrow"></i>
                        Get Direction
                    </a>
                </div>
            `);

            bounds.push(office.coords);
        });

        if (bounds.length) {
            map.fitBounds(bounds, {
                padding: [40, 40]
            });
        }
    }

    // ===== Contact Form =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            if (!submitBtn) return;

            const originalText = submitBtn.innerHTML;
            const oldAlert = contactForm.querySelector('.contact-form-alert');
            if (oldAlert) oldAlert.remove();

            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            submitBtn.disabled = true;

            const showAlert = (type, message) => {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type} mt-3 contact-form-alert`;
                alertDiv.innerHTML = message;
                contactForm.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 7000);
            };

            try {
                const provider = String(contactForm.dataset.emailProvider || '').toLowerCase();

                if (provider === 'formsubmit' && contactForm.action) {
                    const payload = new FormData(contactForm);

                    const response = await fetch(contactForm.action, {
                        method: 'POST',
                        body: payload,
                        headers: {
                            Accept: 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Form submission failed');
                    }

                    showAlert('success', '<i class="fas fa-check-circle me-2"></i>Thank you for your message! We have received it and will get back to you shortly.');
                    contactForm.reset();
                } else {
                    showAlert('warning', '<i class="fas fa-exclamation-triangle me-2"></i>Email form provider is not configured.');
                }
            } catch (error) {
                showAlert('danger', '<i class="fas fa-times-circle me-2"></i>Sorry, your message could not be sent right now. Please call us directly.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== Flip Cards Touch Support =====
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('touchstart', function () {
            this.querySelector('.flip-card-inner').style.transform = 'rotateY(180deg)';
        });

        card.addEventListener('touchend', function () {
            setTimeout(() => {
                this.querySelector('.flip-card-inner').style.transform = '';
            }, 3000);
        });
    });

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ===== Active Nav Link =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ===== Practice Areas Modal Logic =====
    const practiceData = {
        'corporate-business': {
            title: "Corporate, Commercial and Business Setup",
            icon: "fas fa-briefcase",
            description: "We advise startups, SMEs, and established companies on business setup and commercial structuring in Bangladesh. Our team supports incorporation, contract architecture, procurement strategy, and operating-compliance planning so businesses can move with confidence. We also represent clients in commercial disputes and negotiation-heavy matters while protecting long-term business continuity.",
            services: [
                "Business Setup",
                "Company Formation and Registration",
                "Contracts",
                "Government Contracts and Litigation",
                "Procurement Bidding and Government Contracts",
                "Vetting of Documents"
            ],
            whyChoose: [
                { icon: "fas fa-sitemap", text: "End-to-End Business Structuring" },
                { icon: "fas fa-file-contract", text: "Commercially Practical Contracts" }
            ]
        },
        'banking-finance-insurance': {
            title: "Banking, Finance and Insurance",
            icon: "fas fa-university",
            description: "Our banking, finance, and insurance practice supports lenders, borrowers, and corporate clients in Bangladesh across financing lifecycles. We handle loan and security documentation, restructuring, insurance-recovery disputes, and enforcement strategy with practical risk control. We also represent clients in complex financial conflicts where litigation and settlement planning must run together.",
            services: [
                "Banking Litigation",
                "Insurance Recovery",
                "Private Equity Loan Syndication",
                "Project Finance Documentation",
                "Security Documentation"
            ],
            whyChoose: [
                { icon: "fas fa-chart-line", text: "Commercial Risk Control" },
                { icon: "fas fa-shield-halved", text: "Recovery and Defense Expertise" }
            ]
        },
        'tax-vat-customs': {
            title: "Tax, VAT and Customs",
            icon: "fas fa-calculator",
            description: "We provide tax advisory and dispute support for direct tax, VAT, and customs-linked matters in Bangladesh. Our team helps businesses manage filings, notice responses, audit preparation, and regulatory hearings before issues escalate. We also guide clients on structuring transactions to reduce risk while maintaining compliance with evolving revenue rules.",
            services: [
                "Taxation Systems",
                "VAT Tax and Customs Matters"
            ],
            whyChoose: [
                { icon: "fas fa-receipt", text: "Compliance-First Advisory" },
                { icon: "fas fa-gavel", text: "Dispute-Ready Representation" }
            ]
        },
        'realestate-land-tenancy': {
            title: "Real Estate, Land and Tenancy",
            icon: "fas fa-home",
            description: "Our property team handles real estate, land records, and tenancy matters across transactional and dispute contexts in Bangladesh. We support title verification, deed and lease documentation, mutation-linked record alignment, and possession-risk assessment. Where conflicts arise, we provide strategic representation to protect ownership, tenancy rights, and project viability.",
            services: [
                "Real Estate and Property Matters",
                "Land Related Documentation",
                "Tenant Rights in Bangladesh",
                "Verification and Land Documents"
            ],
            whyChoose: [
                { icon: "fas fa-map-marked-alt", text: "Land Record and Title Depth" },
                { icon: "fas fa-house-user", text: "Transaction to Dispute Continuity" }
            ]
        },
        'civil-commercial-adr': {
            title: "Civil, Commercial and ADR (Arbitration/Mediation)",
            icon: "fas fa-balance-scale",
            description: "We represent clients in civil and commercial disputes from early risk assessment to final resolution. Our approach combines litigation, arbitration, mediation, and settlement strategy so clients can choose the most effective forum at each stage. We focus on enforceable outcomes, procedural discipline, and efficient case progression in Bangladesh courts and ADR settings.",
            services: [
                "Civil Litigation",
                "Commercial Litigation",
                "Alternative Dispute Resolution",
                "Domestic and International Arbitration"
            ],
            whyChoose: [
                { icon: "fas fa-comments", text: "Settlement and Trial Balance" },
                { icon: "fas fa-scale-balanced", text: "Forum-Specific Strategy" }
            ]
        },
        'criminal-whitecollar': {
            title: "Criminal Defense and White-Collar Crime",
            icon: "fas fa-shield-alt",
            description: "Our defense team acts quickly in criminal investigations, arrest-risk situations, and prosecution matters in Bangladesh. We handle white-collar and financial-crime exposure with coordinated strategy covering evidence, hearings, and bail readiness. We also align criminal defense with related civil or regulatory risk so clients are protected on all fronts.",
            services: [
                "Criminal Prosecution and Defense",
                "Fraud and White Collar Crimes"
            ],
            whyChoose: [
                { icon: "fas fa-user-shield", text: "Rapid Case Response" },
                { icon: "fas fa-building-shield", text: "White-Collar Defense Focus" }
            ]
        },
        'constitutional-admin-writ': {
            title: "Constitutional, Administrative and Writ",
            icon: "fas fa-landmark",
            description: "We advise and represent clients in constitutional and administrative disputes involving public authorities in Bangladesh. Our team handles judicial review, writ remedies, and higher-forum litigation where rights, process, or jurisdiction are in question. We build clear relief strategy and procedural timelines so urgent matters can be presented effectively before the court.",
            services: [
                "Administrative Law in Bangladesh",
                "Constitutional Law",
                "Judicial Review of Administrative Action",
                "Writ and High Court Matters"
            ],
            whyChoose: [
                { icon: "fas fa-landmark-dome", text: "Public Law Strength" },
                { icon: "fas fa-scroll", text: "Rights and Remedy Orientation" }
            ]
        },
        'family-personal': {
            title: "Family Law and Personal Disputes",
            icon: "fas fa-heart",
            description: "We provide careful and discreet representation in family and personal disputes that require both legal precision and emotional sensitivity. Our work includes custody, maintenance, separation-related claims, and personal-rights protection in Bangladesh legal forums. We aim for durable resolutions through negotiation where possible and strong advocacy where litigation is necessary.",
            services: [
                "Family matters and child custody strategy",
                "Divorce and separation proceedings",
                "Child custody and visitation",
                "Maintenance and alimony matters",
                "Domestic relationship disputes"
            ],
            whyChoose: [
                { icon: "fas fa-hands-helping", text: "Sensitive Client Handling" },
                { icon: "fas fa-child-reaching", text: "Custody-Focused Advocacy" }
            ]
        },
        'labour-employment-immigration': {
            title: "Labour, Employment and Immigration",
            icon: "fas fa-users",
            description: "We support employers, employees, and families on labour, employment, and immigration matters in Bangladesh. Our services include contract and policy review, workplace dispute strategy, compliance readiness, and immigration pathway guidance. We focus on practical outcomes that protect rights, reduce operational risk, and keep organizations compliant.",
            services: [
                "Labour and Employment Matters",
                "Immigration Law in Bangladesh",
                "Global Investment and Citizenship"
            ],
            whyChoose: [
                { icon: "fas fa-people-group", text: "Employer and Employee Perspective" },
                { icon: "fas fa-passport", text: "Migration and Mobility Support" }
            ]
        },
        'intl-trade-maritime-aviation': {
            title: "International Trade, Maritime and Aviation",
            icon: "fas fa-globe",
            description: "Our cross-border practice supports international trade, maritime, and aviation stakeholders operating in and through Bangladesh. We advise on trade contracts, customs-sensitive flows, cargo and marine risk, and aviation-related regulatory or contractual issues. We also assist in dispute resolution and enforcement where global operations intersect with local legal requirements.",
            services: [
                "International Trade",
                "Admiralty and Shipping",
                "Marine Insurance",
                "Ship Building and Ship Breaking Matters",
                "Aviation Matters"
            ],
            whyChoose: [
                { icon: "fas fa-ship", text: "Maritime and Shipping Depth" },
                { icon: "fas fa-plane-departure", text: "Cross-Border Dispute Capability" }
            ]
        },
        'ip-tech-telecom': {
            title: "Intellectual Property, Technology and Telecom",
            icon: "fas fa-microchip",
            description: "We help businesses protect and commercialize intellectual property while meeting technology and telecom regulatory expectations in Bangladesh. Our team handles trademark and copyright strategy, licensing documentation, digital-platform risk, and telecom-linked compliance issues. We also support enforcement and dispute response when brand, content, or technology assets are threatened.",
            services: [
                "Intellectual Property (Trademark Patent Copyright)",
                "Telecommunication and IT Law",
                "Entertainment and Media Litigation"
            ],
            whyChoose: [
                { icon: "fas fa-lightbulb", text: "Innovation Protection" },
                { icon: "fas fa-network-wired", text: "Digital Regulatory Awareness" }
            ]
        },
        'energy-resources-infra': {
            title: "Energy, Natural Resources and Infrastructure",
            icon: "fas fa-industry",
            description: "We advise developers, investors, and operators on energy, natural-resources, and infrastructure matters in Bangladesh. Our work covers project documentation, compliance pathways, environmental-risk positioning, and contractual risk allocation across project phases. We also support dispute and regulatory response strategies for high-value, compliance-intensive developments.",
            services: [
                "Environmental Law",
                "Natural Resources",
                "Oil and Gas Law"
            ],
            whyChoose: [
                { icon: "fas fa-oil-can", text: "Sector-Focused Advisory" },
                { icon: "fas fa-hard-hat", text: "Project Lifecycle Support" }
            ]
        }
    };

    const commonStrategicServices = [
        "Regulatory compliance roadmap and filing calendar",
        "Legal risk assessment with actionable mitigation steps",
        "Authority and regulator representation strategy",
        "Dispute prevention and escalation planning"
    ];

    const practiceStrategicServices = {
        'corporate-business': [
            "RJSC name clearance and incorporation filing support",
            "BIDA OSS application and approval strategy",
            "Trade license and sector permit sequencing",
            "Joint venture, shareholder, and founders agreement drafting",
            "Government tender and bid documentation support",
            "Commercial policy and document vetting program"
        ],
        'banking-finance-insurance': [
            "Loan restructuring and workout strategy",
            "Security perfection and enforcement planning",
            "NPA recovery litigation and settlement support",
            "Insurance claim denial challenge and recovery roadmap",
            "Syndication and inter-creditor documentation review",
            "Financial fraud incident response and legal defense"
        ],
        'tax-vat-customs': [
            "Income tax filing strategy and audit defense",
            "VAT registration, return, and reconciliation support",
            "Customs classification and valuation review",
            "Tax and VAT notice response with hearing preparation",
            "Transfer pricing documentation and review support",
            "Tax appeal and tribunal representation planning"
        ],
        'realestate-land-tenancy': [
            "Title search and ownership chain verification",
            "Mutation and land record correction support",
            "Sale deed, lease, and transfer documentation drafting",
            "Tenancy dispute strategy and eviction defense",
            "Property due diligence for acquisition and investment",
            "Land possession and boundary dispute action plan"
        ],
        'civil-commercial-adr': [
            "Pre-litigation notice and legal recovery strategy",
            "Commercial arbitration filing and defense support",
            "Mediation-led settlement architecture",
            "Injunction and urgent interim relief applications",
            "Evidence matrix development and witness planning",
            "Decree execution and enforcement strategy"
        ],
        'criminal-whitecollar': [
            "Pre-arrest legal risk assessment and strategy",
            "Bail and anticipatory bail preparation",
            "FIR and complaint response planning",
            "White-collar investigation defense framework",
            "Digital and financial evidence management support",
            "Trial, revision, and appellate criminal representation"
        ],
        'constitutional-admin-writ': [
            "Writ petition drafting and filing strategy",
            "Judicial review challenge of administrative orders",
            "Fundamental rights remedy planning",
            "Interim relief and stay motion support",
            "Public law legal opinion and risk strategy",
            "Constitutional appellate briefing and representation"
        ],
        'family-personal': [
            "Divorce and separation proceedings management",
            "Child custody and visitation strategy",
            "Maintenance and alimony claim support",
            "Domestic violence protection and relief applications",
            "Family settlement deed drafting and negotiation",
            "Personal dispute mediation and resolution planning"
        ],
        'labour-employment-immigration': [
            "Employment contract and policy drafting",
            "Wrongful termination defense and claims support",
            "Labour compliance and inspection readiness",
            "Work permit and visa pathway support",
            "Expat onboarding and compliance advisory",
            "Immigration appeal and review representation"
        ],
        'intl-trade-maritime-aviation': [
            "Import-export contract advisory and structuring",
            "Trade and customs dispute response strategy",
            "Cargo claim and marine liability management",
            "Ship arrest, release, and maritime claim defense",
            "Aviation regulatory and aircraft lease legal support",
            "Cross-border sanctions and trade compliance review"
        ],
        'ip-tech-telecom': [
            "Trademark search, filing, and opposition support",
            "Copyright registration and enforcement strategy",
            "IP licensing and assignment agreement drafting",
            "Technology service and SaaS contract structuring",
            "Data protection and platform compliance advisory",
            "Telecom regulatory representation and compliance"
        ],
        'energy-resources-infra': [
            "Project development contract structuring",
            "Oil and gas services and concession advisory",
            "Environmental clearance and compliance support",
            "Infrastructure EPC and finance document review",
            "Natural resource licensing and permit strategy",
            "Regulatory dispute response and enforcement defense"
        ]
    };

    const fallbackStrategicServices = [
        "Stakeholder negotiation and structured settlement support",
        "Documentation and evidence readiness for hearings"
    ];

    Object.entries(practiceData).forEach(([practiceKey, data]) => {
        const mergedServices = [
            ...(data.services || []),
            ...(practiceStrategicServices[practiceKey] || []),
            ...commonStrategicServices,
            ...fallbackStrategicServices
        ];

        const uniqueServices = [];
        const seenServices = new Set();

        mergedServices.forEach((serviceText) => {
            const normalized = String(serviceText || '').trim().toLowerCase();
            if (!normalized || seenServices.has(normalized)) return;
            seenServices.add(normalized);
            uniqueServices.push(String(serviceText).trim());
        });

        data.services = uniqueServices.slice(0, 10);
    });

    const commonStrategicWhyChoose = [
        { icon: "fas fa-user-tie", text: "Senior-Led Strategy in Every Critical Decision" },
        { icon: "fas fa-stopwatch", text: "Fast Response and Clear Next-Step Guidance" },
        { icon: "fas fa-chess", text: "Outcome-Focused Strategy, Not Template Advice" },
        { icon: "fas fa-comments", text: "Transparent Communication and Regular Case Updates" }
    ];

    const practiceStrategicWhyChoose = {
        'corporate-business': [
            { icon: "fas fa-building", text: "Business Structuring That Supports Growth and Fundraising" },
            { icon: "fas fa-file-contract", text: "Negotiation-Ready Contracts With Risk-Control Clauses" },
            { icon: "fas fa-network-wired", text: "Integrated Setup Across Entity, License and Contract Tracks" },
            { icon: "fas fa-scale-balanced", text: "Dispute Prevention Built Into Commercial Documentation" },
            { icon: "fas fa-clipboard-check", text: "Governance and Compliance Designed for Long-Term Stability" },
            { icon: "fas fa-handshake", text: "Strong Counterparty Protection in Transactions and Tenders" }
        ],
        'banking-finance-insurance': [
            { icon: "fas fa-landmark", text: "Deep Familiarity With Financing and Recovery Documentation" },
            { icon: "fas fa-money-check-dollar", text: "Security Enforcement Strategy Aligned With Commercial Reality" },
            { icon: "fas fa-chart-line", text: "Finance-Risk Mapping Before Litigation Becomes Costly" },
            { icon: "fas fa-file-invoice-dollar", text: "Loan and Syndication Drafting That Reduces Ambiguity" },
            { icon: "fas fa-shield-halved", text: "Insurance Claim Positioning Backed by Evidence Discipline" },
            { icon: "fas fa-gavel", text: "Courtroom and Settlement Capability for Financial Disputes" }
        ],
        'tax-vat-customs': [
            { icon: "fas fa-receipt", text: "Structured Compliance Guidance for Tax, VAT and Customs" },
            { icon: "fas fa-file-circle-check", text: "Audit-Ready Documentation and Hearing Preparation" },
            { icon: "fas fa-magnifying-glass-dollar", text: "Early Risk Detection for Notices and Assessments" },
            { icon: "fas fa-balance-scale-right", text: "Appeal Strategy That Protects Business Continuity" },
            { icon: "fas fa-clipboard-list", text: "Practical Filing Calendars and Obligation Tracking" },
            { icon: "fas fa-route", text: "Clear Escalation Path From Representation to Appellate Forums" }
        ],
        'realestate-land-tenancy': [
            { icon: "fas fa-map-location-dot", text: "Title and Land Record Scrutiny Before Commitment" },
            { icon: "fas fa-file-signature", text: "Transaction Documents Drafted for Enforceability" },
            { icon: "fas fa-house", text: "Landlord-Tenant Strategy for Both Prevention and Dispute" },
            { icon: "fas fa-circle-exclamation", text: "Risk Flags Identified Early in Property Deals" },
            { icon: "fas fa-scale-balanced", text: "Court and Settlement Routes Mapped From Day One" },
            { icon: "fas fa-key", text: "Practical Advice From Acquisition to Possession and Use" }
        ],
        'civil-commercial-adr': [
            { icon: "fas fa-people-arrows", text: "Settlement-First Approach Without Sacrificing Litigation Strength" },
            { icon: "fas fa-gavel", text: "Strong Advocacy in Civil and Commercial Trial Forums" },
            { icon: "fas fa-file-contract", text: "Arbitration and Mediation Strategy Linked to Enforceable Outcomes" },
            { icon: "fas fa-clock-rotate-left", text: "Procedural Timeline Control to Avoid Tactical Delays" },
            { icon: "fas fa-folder-open", text: "Evidence Structuring That Supports Both ADR and Court Paths" },
            { icon: "fas fa-chess-queen", text: "Forum Selection and Relief Strategy Tailored to Case Goals" }
        ],
        'criminal-whitecollar': [
            { icon: "fas fa-shield", text: "Immediate Defense Strategy During Investigation Stage" },
            { icon: "fas fa-user-check", text: "Bail and Hearing Preparation With Timeline Discipline" },
            { icon: "fas fa-building-shield", text: "White-Collar Case Handling With Financial Exposure Awareness" },
            { icon: "fas fa-fingerprint", text: "Evidence and Narrative Control From the Earliest Stage" },
            { icon: "fas fa-scale-unbalanced-flip", text: "Courtroom Defense Backed by Procedural Precision" },
            { icon: "fas fa-link", text: "Coordination Across Criminal, Civil and Regulatory Risk" }
        ],
        'constitutional-admin-writ': [
            { icon: "fas fa-landmark-dome", text: "Targeted Constitutional and Public Law Remedy Planning" },
            { icon: "fas fa-scroll", text: "Writ and Judicial Review Pleadings Built for Maintainability" },
            { icon: "fas fa-sitemap", text: "Administrative Challenge Strategy With Clear Relief Objectives" },
            { icon: "fas fa-hourglass-half", text: "Urgent Interim Relief Positioning Where Delay Causes Harm" },
            { icon: "fas fa-book-open-reader", text: "Research-Driven Arguments Grounded in Public Law Principles" },
            { icon: "fas fa-flag-checkered", text: "End-to-End Support Through Rule Issuance and Disposal" }
        ],
        'family-personal': [
            { icon: "fas fa-heart", text: "Sensitive Handling of High-Stress Personal Disputes" },
            { icon: "fas fa-child-reaching", text: "Child-Centered Custody and Visitation Strategy" },
            { icon: "fas fa-hand-holding-heart", text: "Balanced Approach to Maintenance and Support Claims" },
            { icon: "fas fa-file-lines", text: "Clear Documentation Strategy for Personal and Family Proceedings" },
            { icon: "fas fa-people-roof", text: "Practical Resolution Pathways for Family Stability" },
            { icon: "fas fa-scale-balanced", text: "Strong Courtroom Advocacy Where Settlement Is Not Possible" }
        ],
        'labour-employment-immigration': [
            { icon: "fas fa-users-gear", text: "Integrated Employment and Workplace Compliance Strategy" },
            { icon: "fas fa-id-card", text: "Work-Permit and Status Support for Cross-Border Workforce Needs" },
            { icon: "fas fa-briefcase", text: "Contract and Policy Drafting That Reduces HR Disputes" },
            { icon: "fas fa-scale-balanced", text: "Representation in Employment Conflicts With Practical Outcomes" },
            { icon: "fas fa-globe", text: "Immigration Guidance Aligned With Business and Family Priorities" },
            { icon: "fas fa-check-double", text: "Compliance-Focused Advice for Long-Term Organizational Safety" }
        ],
        'intl-trade-maritime-aviation': [
            { icon: "fas fa-ship", text: "Maritime and Shipping Dispute Handling With Commercial Insight" },
            { icon: "fas fa-plane", text: "Aviation Matter Support Across Regulatory and Contractual Issues" },
            { icon: "fas fa-globe-asia", text: "Trade-Focused Advice for Cross-Border Operations" },
            { icon: "fas fa-anchor", text: "Cargo, Marine and Liability Risk Positioning" },
            { icon: "fas fa-route", text: "Customs-Linked Trade Issue Escalation Planning" },
            { icon: "fas fa-file-circle-check", text: "Documentation Quality for International Dispute Readiness" }
        ],
        'ip-tech-telecom': [
            { icon: "fas fa-lightbulb", text: "IP Protection Strategy for Brand, Content and Innovation" },
            { icon: "fas fa-network-wired", text: "Technology and Telecom Compliance With Business Practicality" },
            { icon: "fas fa-copyright", text: "Enforcement Planning for Infringement and Misuse Risks" },
            { icon: "fas fa-file-shield", text: "Licensing and IP Transfer Documents Built for Clarity" },
            { icon: "fas fa-laptop-code", text: "Digital Business Risk Mapping Before Disputes Emerge" },
            { icon: "fas fa-bullseye", text: "Commercially Focused Protection, Not Just Registration" }
        ],
        'energy-resources-infra': [
            { icon: "fas fa-industry", text: "Project-Focused Advice Across Energy and Resource Workflows" },
            { icon: "fas fa-oil-can", text: "Oil, Gas and Resource Matter Handling With Sector Context" },
            { icon: "fas fa-leaf", text: "Environmental Compliance Positioning for Approval and Operations" },
            { icon: "fas fa-diagram-project", text: "Infrastructure Documentation Strategy From Start to Close" },
            { icon: "fas fa-triangle-exclamation", text: "Risk Identification Early in Capital-Intensive Projects" },
            { icon: "fas fa-hard-hat", text: "Execution-Oriented Counsel for Long-Cycle Development Matters" }
        ]
    };

    const fallbackStrategicWhyChoose = [
        { icon: "fas fa-award", text: "Results-Oriented Representation With Strong Preparation" },
        { icon: "fas fa-file-circle-plus", text: "Clear Documentation and Case Organization Standards" },
        { icon: "fas fa-lightbulb", text: "Practical Legal Advice Tailored to Your Objectives" },
        { icon: "fas fa-people-group", text: "Collaborative Team Support Across Complex Matters" }
    ];

    Object.entries(practiceData).forEach(([practiceKey, data]) => {
        const merged = [
            ...(data.whyChoose || []),
            ...(practiceStrategicWhyChoose[practiceKey] || []),
            ...commonStrategicWhyChoose,
            ...fallbackStrategicWhyChoose
        ];

        const uniqueByText = [];
        const seen = new Set();

        merged.forEach((item) => {
            const textKey = String(item?.text || '').trim().toLowerCase();
            if (!textKey || seen.has(textKey)) return;
            seen.add(textKey);
            uniqueByText.push(item);
        });

        data.whyChoose = uniqueByText.slice(0, 10);
    });

    // Event Listeners for Modal Triggers
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"][data-practice]');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function () {
            const practiceKey = this.getAttribute('data-practice');
            const data = practiceData[practiceKey];

            if (data) {
                // Update Modal Content
                document.getElementById('modalTitle').textContent = data.title;
                document.getElementById('modalDescription').textContent = data.description;

                // Update Icon
                const iconContainer = document.getElementById('modalIcon');
                iconContainer.innerHTML = `<i class="${data.icon}"></i>`;

                // Update Services
                const servicesList = document.getElementById('modalServices');
                servicesList.innerHTML = data.services.map(service =>
                    `<li><i class="fas fa-check-circle text-accent me-2"></i>${service}</li>`
                ).join('');

                // Update Why Choose Us (simulated for now as we don't have this data yet)
                const whyChooseContainer = document.getElementById('modalWhyChoose');
                if (data.whyChoose) {
                    whyChooseContainer.innerHTML = data.whyChoose.map(item => `
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <div class="me-3" style="width: 40px; height: 40px; background: rgba(175, 169, 57, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                    <i class="${item.icon} text-accent"></i>
                                </div>
                                <span class="fw-medium text-light">${item.text}</span>
                            </div>
                        </div>
                     `).join('');
                }
            }
        });
    });

});

// ===== Page Header Animation =====
function initPageHeader() {
    const pageHeader = document.querySelector('.page-header');
    // ===== Attorney Card Click Handler =====
    const attorneyCards = document.querySelectorAll('.attorney-card-link');
    attorneyCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Prevent any carousel interference
            e.stopPropagation();
            // The link should work normally
        });
    });

    // ===== Smooth Scrolling for Anchor Links =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip social links

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    if (pageHeader) {
        pageHeader.style.opacity = '1';
    }
}

window.addEventListener('load', initPageHeader);
