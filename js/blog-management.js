(function () {
    'use strict';

    const POSTS = Array.isArray(window.KABlogCatalog) ? window.KABlogCatalog.slice() : [];
    if (!POSTS.length) return;

    POSTS.sort((a, b) => (a.date < b.date ? 1 : -1));

    const app = document.getElementById('blogArchiveApp');
    if (!app) return;

    const mode = app.getAttribute('data-mode') || 'home';
    const presetCategory = app.getAttribute('data-category') || '';
    const presetAuthor = app.getAttribute('data-author') || '';
    const presetYear = app.getAttribute('data-year') || '';
    const presetMonth = app.getAttribute('data-month') || '';

    // Use simple absolute paths - works from any page location
    const blogPrefix = './';  // For articles/archives in same folder or accessible via ./
    const ROOT = '/';  // Root of website

    const el = {
        topSearch: document.getElementById('blogSearchInput'),
        sideSearch: document.getElementById('blogSearchInputSide'),
        categorySelect: document.getElementById('categoryFilter'),
        authorSelect: document.getElementById('authorFilter'),
        fromDate: document.getElementById('dateFromFilter'),
        toDate: document.getElementById('dateToFilter'),
        grid: document.getElementById('blogGrid'),
        summary: document.getElementById('resultsSummary'),
        pills: document.getElementById('activeFilterPills'),
        clearButton: document.getElementById('clearFiltersBtn'),
        tagCloud: document.getElementById('tagCloud'),
        dateArchive: document.getElementById('dateArchiveList'),
        categoryList: document.getElementById('categoryList'),
        authorList: document.getElementById('authorList')
    };

    const searchParams = new URLSearchParams(window.location.search || '');
    const state = {
        q: (searchParams.get('q') || '').trim().toLowerCase(),
        category: presetCategory || (searchParams.get('category') || '').trim().toLowerCase(),
        author: presetAuthor || (searchParams.get('author') || '').trim().toLowerCase(),
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        tags: []
    };

    function nestedBlogPrefix() {
        const path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
        const marker = '/blog/';
        const markerIndex = path.indexOf(marker);

        if (markerIndex === -1) {
            return null;
        }

        const remainder = path.slice(markerIndex + marker.length);
        const parts = remainder.split('/').filter(Boolean);

        // Example: /blog/author/harun-rayhan.html -> depth 1 -> ../
        // Example: /blog/archive/2026/01.html -> depth 2 -> ../../
        const depth = Math.max(0, parts.length - 1);
        return '../'.repeat(depth);
    }

    function articleHref(slug) {
        const prefix = nestedBlogPrefix();
        return prefix !== null ? prefix + slug : 'blog/' + slug;
    }

    function categoryHref(slug) {
        const prefix = nestedBlogPrefix();
        return prefix !== null ? prefix + 'category/' + slug + '.html' : 'blog/category/' + slug + '.html';
    }

    function authorHref(slug) {
        const prefix = nestedBlogPrefix();
        return prefix !== null ? prefix + 'author/' + slug + '.html' : 'blog/author/' + slug + '.html';
    }

    function archiveHref(year, month) {
        const prefix = nestedBlogPrefix();
        if (prefix !== null) {
            if (month) return prefix + 'archive/' + year + '/' + month + '.html';
            return prefix + 'archive/' + year + '.html';
        }
        if (month) return 'blog/archive/' + year + '/' + month + '.html';
        return 'blog/archive/' + year + '.html';
    }

    function searchHref(query) {
        const prefix = nestedBlogPrefix();
        if (prefix !== null) {
            return prefix + 'search.html?q=' + encodeURIComponent(query || '');
        }
        return 'blog/search.html?q=' + encodeURIComponent(query || '');
    }

    function imageSrc(imagePath) {
        if (/^https?:\/\//i.test(imagePath)) return imagePath;
        // Images are always at /images/ from root
        return imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    }

    function titleCaseMonth(monthIndex) {
        return new Date(2026, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
    }

    function fullText(post) {
        return [post.title, post.excerpt, post.author, post.category].concat(post.tags || []).join(' ').toLowerCase();
    }

    function inDateRange(post) {
        if (!state.from && !state.to) return true;
        if (state.from && post.date < state.from) return false;
        if (state.to && post.date > state.to) return false;
        return true;
    }

    function applyModePreset(list) {
        if (mode === 'category' && presetCategory) {
            return list.filter((p) => p.categorySlug === presetCategory);
        }
        if (mode === 'author' && presetAuthor) {
            return list.filter((p) => p.authorSlug === presetAuthor);
        }
        if (mode === 'archive-year' && presetYear) {
            return list.filter((p) => p.date.startsWith(presetYear + '-'));
        }
        if (mode === 'archive-month' && presetYear && presetMonth) {
            return list.filter((p) => p.date.startsWith(presetYear + '-' + presetMonth + '-'));
        }
        return list;
    }

    function filterPosts() {
        return applyModePreset(POSTS).filter((post) => {
            if (state.category && post.categorySlug !== state.category) return false;
            if (state.author && post.authorSlug !== state.author) return false;
            if (state.q && !fullText(post).includes(state.q)) return false;
            if (state.tags.length && !state.tags.every((tag) => (post.tags || []).includes(tag))) return false;
            if (!inDateRange(post)) return false;
            return true;
        });
    }

    function renderCard(post) {
        return [
            '<div class="col-md-6 article-item">',
            '  <article class="glass-card">',
            '    <div class="card-media">',
            '      <span class="badge-soft">' + post.category + '</span>',
            '      <img class="card-media-img" src="' + imageSrc(post.image) + '" alt="' + post.title + '" onerror="this.onerror=null;this.src=\'/images/blog/company-formation-guide-thumb.webp\';">',
            '    </div>',
            '    <div class="card-bodyx">',
            '      <div class="meta-row">' + new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' | <a href="' + authorHref(post.authorSlug) + '">' + post.author + '</a></div>',
            '      <h3 class="card-titlex"><a href="' + articleHref(post.slug) + '">' + post.title + '</a></h3>',
            '      <p class="mb-2 text-secondary">' + post.excerpt + '</p>',
            '      <div class="card-tags">' + (post.tags || []).slice(0, 3).map((tag) => '<button type="button" class="tag-chip" data-tag="' + tag + '">' + tag + '</button>').join('') + '</div>',
            '      <a class="read-link" href="' + articleHref(post.slug) + '">Read article <i class="fas fa-arrow-right ms-1"></i></a>',
            '    </div>',
            '  </article>',
            '</div>'
        ].join('');
    }

    function updateSummary(count) {
        if (!el.summary) return;
        const noun = count === 1 ? 'article' : 'articles';
        el.summary.textContent = 'Showing ' + count + ' ' + noun;
    }

    function filterPill(label, key, value) {
        return '<button type="button" class="filter-pill" data-filter-key="' + key + '" data-filter-value="' + value + '">' + label + ' <span aria-hidden="true">x</span></button>';
    }

    function renderPills() {
        if (!el.pills) return;
        const pills = [];
        if (state.q) pills.push(filterPill('Search: ' + state.q, 'q', ''));
        if (state.category) {
            const foundCategory = POSTS.find((p) => p.categorySlug === state.category);
            pills.push(filterPill('Category: ' + (foundCategory ? foundCategory.category : state.category), 'category', ''));
        }
        if (state.author) {
            const foundAuthor = POSTS.find((p) => p.authorSlug === state.author);
            pills.push(filterPill('Author: ' + (foundAuthor ? foundAuthor.author : state.author), 'author', ''));
        }
        if (state.from || state.to) {
            const fromStr = state.from ? new Date(state.from + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            const toStr = state.to ? new Date(state.to + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            const dateLabel = state.from && state.to ? fromStr + ' - ' + toStr : (state.from ? 'From ' + fromStr : 'Until ' + toStr);
            pills.push(filterPill('Date: ' + dateLabel, 'from', ''));
        }
        el.pills.innerHTML = pills.join('');
    }

    function aggregateBy(arr, keyFn) {
        const counts = arr.reduce((m, item) => {
            const key = keyFn(item);
            m.set(key, (m.get(key) || 0) + 1);
            return m;
        }, new Map());
        return [...counts.entries()];
    }

    function archiveLabel(key) {
        const [year, month] = key.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        return titleCaseMonth(monthIndex) + ' ' + year;
    }

    function renderSideData() {
        if (el.categoryList) {
            const items = aggregateBy(POSTS, (p) => p.categorySlug).map(([slug, count]) => {
                const found = POSTS.find((p) => p.categorySlug === slug);
                return '<li><a href="' + categoryHref(slug) + '"><span>' + found.category + '</span><span>' + count + '</span></a></li>';
            });
            el.categoryList.innerHTML = items.join('');
        }

        if (el.authorList) {
            const items = aggregateBy(POSTS, (p) => p.authorSlug).map(([slug, count]) => {
                const found = POSTS.find((p) => p.authorSlug === slug);
                return '<li><a href="' + authorHref(slug) + '"><span>' + found.author + '</span><span>' + count + '</span></a></li>';
            });
            el.authorList.innerHTML = items.join('');
        }

        if (el.tagCloud) {
            const tags = aggregateBy(POSTS, (p) => (p.tags || []).join(','))
                .map(([key]) => key.split(',').filter(Boolean))
                .flat()
                .reduce((m, tag) => m.set(tag, (m.get(tag) || 0) + 1), new Map());
            const max = Math.max(...[...tags.values()]);
            const rendered = [...tags.entries()].map(([tag, count]) => {
                const bucket = Math.max(1, Math.min(5, Math.round((count / max) * 4) + 1));
                return '<button type="button" class="tag-cloud-item tag-size-' + bucket + '" data-tag="' + tag + '">' + tag + '</button>';
            });
            el.tagCloud.innerHTML = rendered.join('');
        }

        if (el.dateArchive) {
            const monthBuckets = aggregateBy(POSTS, (p) => p.date.slice(0, 7));
            const yearBuckets = aggregateBy(POSTS, (p) => p.date.slice(0, 4));
            const monthItems = monthBuckets
                .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                .map(([key, count]) => '<li><a href="' + archiveHref(key.slice(0, 4), key.slice(5, 7)) + '"><span>' + archiveLabel(key) + '</span><span>' + count + '</span></a></li>');
            const yearItems = yearBuckets
                .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                .map(([key, count]) => '<li><a href="' + archiveHref(key) + '"><span>' + key + '</span><span>' + count + '</span></a></li>');
            el.dateArchive.innerHTML = monthItems.concat(yearItems).join('');
        }
    }

    function syncInputs() {
        if (el.topSearch) el.topSearch.value = state.q;
        if (el.sideSearch) el.sideSearch.value = state.q;
        if (el.categorySelect) el.categorySelect.value = state.category;
        if (el.authorSelect) el.authorSelect.value = state.author;
        if (el.fromDate) el.fromDate.value = state.from;
        if (el.toDate) el.toDate.value = state.to;
    }

    function updateQueryString() {
        if (mode !== 'home' && mode !== 'search') return;
        const params = new URLSearchParams();
        if (state.q) params.set('q', state.q);
        if (state.category) params.set('category', state.category);
        if (state.author) params.set('author', state.author);
        if (state.from) params.set('from', state.from);
        if (state.to) params.set('to', state.to);
        const query = params.toString();
        const nextUrl = window.location.pathname + (query ? '?' + query : '');
        window.history.replaceState({}, '', nextUrl);
    }

    function render() {
        const filtered = filterPosts();
        if (el.grid) {
            el.grid.innerHTML = filtered.map(renderCard).join('');
        }
        updateSummary(filtered.length);
        renderPills();
        updateQueryString();
    }

    function fillSelectOptions() {
        if (el.categorySelect) {
            const options = aggregateBy(POSTS, (p) => p.categorySlug)
                .map(([slug]) => {
                    const found = POSTS.find((p) => p.categorySlug === slug);
                    return '<option value="' + slug + '">' + found.category + '</option>';
                });
            el.categorySelect.innerHTML = '<option value="">All categories</option>' + options.join('');
        }
        if (el.authorSelect) {
            const options = aggregateBy(POSTS, (p) => p.authorSlug)
                .map(([slug]) => {
                    const found = POSTS.find((p) => p.authorSlug === slug);
                    return '<option value="' + slug + '">' + found.author + '</option>';
                });
            el.authorSelect.innerHTML = '<option value="">All authors</option>' + options.join('');
        }
    }

    function bindEvents() {
        if (el.topSearch) {
            el.topSearch.addEventListener('input', function () {
                state.q = el.topSearch.value.trim().toLowerCase();
                if (el.sideSearch) el.sideSearch.value = el.topSearch.value;
                render();
            });
        }

        if (el.sideSearch) {
            el.sideSearch.addEventListener('input', function () {
                state.q = el.sideSearch.value.trim().toLowerCase();
                if (el.topSearch) el.topSearch.value = el.sideSearch.value;
                render();
            });
        }

        if (el.categorySelect) {
            el.categorySelect.addEventListener('change', function () {
                state.category = el.categorySelect.value;
                render();
            });
        }

        if (el.authorSelect) {
            el.authorSelect.addEventListener('change', function () {
                state.author = el.authorSelect.value;
                render();
            });
        }

        if (el.fromDate) {
            el.fromDate.addEventListener('change', function () {
                state.from = el.fromDate.value;
                render();
            });
        }

        if (el.toDate) {
            el.toDate.addEventListener('change', function () {
                state.to = el.toDate.value;
                render();
            });
        }

        if (el.clearButton) {
            el.clearButton.addEventListener('click', function () {
                state.q = '';
                state.category = '';
                state.author = '';
                state.from = '';
                state.to = '';
                state.tags = [];
                syncInputs();
                render();
            });
        }

        if (el.pills) {
            el.pills.addEventListener('click', function (event) {
                const target = event.target.closest('.filter-pill');
                if (!target) return;
                const key = target.getAttribute('data-filter-key');
                const value = target.getAttribute('data-filter-value');
                if (key === 'q') state.q = '';
                if (key === 'category') state.category = '';
                if (key === 'author') state.author = '';
                if (key === 'from') state.from = state.to = '';
                if (key === 'tag') state.tags = state.tags.filter((tag) => tag !== value);
                syncInputs();
                render();
            });
        }

        document.addEventListener('click', function (event) {
            const tagButton = event.target.closest('[data-tag]');
            if (!tagButton) return;
            const tag = tagButton.getAttribute('data-tag');
            if (!tag) return;
            if (!state.tags.includes(tag)) state.tags.push(tag);
            render();
        });

        const searchForm = document.getElementById('searchJumpForm');
        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const q = (state.q || '').trim();
                window.location.href = searchHref(q);
            });
        }
    }

    function hydratePageTitle() {
        const heading = document.getElementById('archiveHeading');
        const subtitle = document.getElementById('archiveSubtitle');
        if (!heading || !subtitle) return;

        if (mode === 'category' && presetCategory) {
            const found = POSTS.find((p) => p.categorySlug === presetCategory);
            if (found) {
                heading.textContent = found.category + ' Articles';
                subtitle.textContent = 'Focused legal insights and case-driven guidance in ' + found.category + '.';
            }
        }

        if (mode === 'author' && presetAuthor) {
            const found = POSTS.find((p) => p.authorSlug === presetAuthor);
            if (found) {
                heading.textContent = 'Articles by ' + found.author;
                subtitle.textContent = 'Explore legal analysis and practice insights from ' + found.author + '.';
            }
        }

        if (mode === 'archive-year' && presetYear) {
            heading.textContent = 'Archive: ' + presetYear;
            subtitle.textContent = 'All published articles from ' + presetYear + '.';
        }

        if (mode === 'archive-month' && presetYear && presetMonth) {
            heading.textContent = 'Archive: ' + titleCaseMonth(Number(presetMonth) - 1) + ' ' + presetYear;
            subtitle.textContent = 'All articles published in this month.';
        }

        if (mode === 'search') {
            const query = (searchParams.get('q') || '').trim();
            heading.textContent = query ? 'Search Results for "' + query + '"' : 'Search Results';
            subtitle.textContent = query ? 'Refine by category, author, date range, and tags.' : 'Use filters to discover relevant legal insights.';
        }
    }

    function wireNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');
        const feedback = document.getElementById('newsletterFeedback');
        if (!newsletterForm || !feedback) return;

        newsletterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) return;
            localStorage.setItem('kaBlogNewsletterEmail', email);
            feedback.style.display = 'block';
            newsletterForm.reset();
        });
    }

    fillSelectOptions();
    hydratePageTitle();
    renderSideData();
    syncInputs();
    bindEvents();
    wireNewsletter();
    render();
})();
