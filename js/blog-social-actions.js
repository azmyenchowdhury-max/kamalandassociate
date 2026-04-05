(function () {
    'use strict';

    function articleTitle() {
        const og = document.querySelector('meta[property="og:title"]');
        if (og && og.content) return og.content.trim();
        const h1 = document.querySelector('.article-title');
        if (h1 && h1.textContent) return h1.textContent.trim();
        return document.title.replace(/\s*\|\s*Kamal.*$/i, '').trim();
    }

    function articleUrl() {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.href) return canonical.href;
        return window.location.href;
    }

    function articleSummary() {
        const desc = document.querySelector('meta[name="description"]');
        if (desc && desc.content) return desc.content.trim();
        const firstParagraph = document.querySelector('.article-content p');
        if (firstParagraph && firstParagraph.textContent) return firstParagraph.textContent.trim().slice(0, 180);
        return 'Insight from Kamal and Associates.';
    }

    function socialLinks() {
        const title = articleTitle();
        const url = articleUrl();
        const summary = articleSummary();
        const text = 'Read: ' + title;

        return {
            linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
            twitter: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
            facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
            whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text + ' - ' + url),
            email: 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(summary + '\n\n' + url)
        };
    }

    function ensureShareButtons() {
        const share = document.querySelector('.article-share');
        if (!share) return;

        share.classList.add('phase4-share');
        share.innerHTML = [
            '<span class="share-label">Share Article:</span>',
            '<a href="#" class="share-button" data-platform="linkedin" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>',
            '<a href="#" class="share-button" data-platform="twitter" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>',
            '<a href="#" class="share-button" data-platform="facebook" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>',
            '<a href="#" class="share-button" data-platform="whatsapp" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>',
            '<a href="#" class="share-button" data-platform="email" aria-label="Share by Email"><i class="fas fa-envelope"></i></a>'
        ].join('');

        share.addEventListener('click', function (event) {
            const target = event.target.closest('[data-platform]');
            if (!target) return;
            event.preventDefault();
            openPlatform(target.getAttribute('data-platform'));
        });
    }

    function openPlatform(platform) {
        const links = socialLinks();
        if (platform === 'email') {
            window.location.href = links.email;
            return;
        }
        const url = links[platform];
        if (!url) return;
        window.open(url, '_blank', 'width=640,height=520');
    }

    function ensureActions() {
        const share = document.querySelector('.article-share');
        const container = document.querySelector('.article-content .col-lg-8');
        if (!container) return;

        let box = document.getElementById('contentActionBar');
        if (!box) {
            box = document.createElement('div');
            box.id = 'contentActionBar';
            box.className = 'content-action-bar';
            const html = [
                '<button type="button" class="action-btn" data-action="copy-link"><i class="fas fa-link"></i> Copy Link</button>',
                '<button type="button" class="action-btn" data-action="email"><i class="fas fa-paper-plane"></i> Email Article</button>',
                '<button type="button" class="action-btn" data-action="print"><i class="fas fa-print"></i> Print</button>',
                '<button type="button" class="action-btn" data-action="pdf"><i class="fas fa-file-pdf"></i> PDF Download</button>',
                '<button type="button" class="action-btn" data-action="bookmark" id="bookmarkBtn"><i class="fas fa-bookmark"></i> Bookmark</button>',
                '<button type="button" class="action-btn" data-action="reading-list"><i class="fas fa-book-reader"></i> Reading List</button>'
            ].join('');
            box.innerHTML = html;

            if (share) share.insertAdjacentElement('afterend', box);
            else container.appendChild(box);
        }

        box.addEventListener('click', function (event) {
            const btn = event.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            if (action === 'copy-link') copyLink(btn);
            if (action === 'email') openPlatform('email');
            if (action === 'print') window.print();
            if (action === 'pdf') window.print();
            if (action === 'bookmark') toggleBookmark(btn);
            if (action === 'reading-list') window.location.href = '../reading-list.html';
        });

        syncBookmarkState();
    }

    function copyLink(button) {
        const url = articleUrl();
        const done = function () {
            button.classList.add('is-success');
            const old = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied';
            window.setTimeout(function () {
                button.classList.remove('is-success');
                button.innerHTML = old;
            }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done);
            return;
        }

        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
        done();
    }

    function bookmarkStore() {
        const key = 'kaBlogReadingList';
        let data = [];
        try {
            data = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(data)) data = [];
        } catch (error) {
            data = [];
        }
        return { key: key, data: data };
    }

    function currentSlug() {
        return window.location.pathname.split('/').pop();
    }

    function syncBookmarkState() {
        const btn = document.getElementById('bookmarkBtn');
        if (!btn) return;
        const store = bookmarkStore();
        const saved = store.data.includes(currentSlug());
        btn.classList.toggle('is-bookmarked', saved);
        btn.innerHTML = saved
            ? '<i class="fas fa-bookmark"></i> Saved to Reading List'
            : '<i class="far fa-bookmark"></i> Bookmark';
    }

    function toggleBookmark() {
        const store = bookmarkStore();
        const slug = currentSlug();
        const index = store.data.indexOf(slug);
        if (index >= 0) store.data.splice(index, 1);
        else store.data.push(slug);
        localStorage.setItem(store.key, JSON.stringify(store.data));
        syncBookmarkState();
    }

    function ensureQuoteShareWidget() {
        const content = document.querySelector('.article-content');
        if (!content) return;

        let widget = document.getElementById('quoteShareWidget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'quoteShareWidget';
            widget.className = 'quote-share-widget';
            widget.innerHTML = [
                '<button type="button" data-quote="copy"><i class="fas fa-copy"></i> Copy Quote</button>',
                '<button type="button" data-quote="twitter"><i class="fab fa-twitter"></i> Share Quote</button>'
            ].join('');
            document.body.appendChild(widget);
        }

        let selectedQuote = '';

        const hideWidget = function () {
            widget.classList.remove('is-visible');
            selectedQuote = '';
        };

        const formatQuote = function () {
            const title = articleTitle();
            const url = articleUrl();
            return '"' + selectedQuote + '"\n\n— ' + title + ' | Kamal & Associates\n' + url;
        };

        content.addEventListener('mouseup', function () {
            const selection = window.getSelection();
            const text = selection ? selection.toString().trim() : '';
            if (!text || text.length < 20) {
                hideWidget();
                return;
            }

            selectedQuote = text.slice(0, 260);
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            widget.style.top = String(window.scrollY + rect.top - 50) + 'px';
            widget.style.left = String(window.scrollX + rect.left) + 'px';
            widget.classList.add('is-visible');
        });

        widget.addEventListener('click', function (event) {
            const btn = event.target.closest('[data-quote]');
            if (!btn || !selectedQuote) return;
            const mode = btn.getAttribute('data-quote');
            const text = formatQuote();

            if (mode === 'copy') {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text);
                }
                hideWidget();
                return;
            }

            if (mode === 'twitter') {
                const shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
                window.open(shareUrl, '_blank', 'width=640,height=520');
                hideWidget();
            }
        });

        window.addEventListener('scroll', hideWidget, { passive: true });
        document.addEventListener('mousedown', function (event) {
            if (!event.target.closest('#quoteShareWidget')) hideWidget();
        });
    }

    function init() {
        if (!window.location.pathname.includes('/blog/')) return;
        if (document.body.dataset.phase4Ready === 'true') return;
        ensureShareButtons();
        ensureActions();
        ensureQuoteShareWidget();
        document.body.dataset.phase4Ready = 'true';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
