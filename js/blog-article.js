(function () {
    'use strict';

    // Reading progress bar + optional floating consult button visibility
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        const bar = document.getElementById('readingProgress');
        if (bar) bar.style.width = scrollPercent + '%';
        const consultBtn = document.getElementById('stickyConsultBtn');
        if (consultBtn) consultBtn.classList.toggle('is-visible', scrollTop > 420);
    }, { passive: true });

    function calculateReadingTime() {
        const content = document.querySelector('.article-content');
        const el = document.getElementById('readingTime');
        if (!content || !el) return;
        const wordCount = content.innerText.trim().split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));
        el.textContent = readingTime + ' min';
    }

    function generateTableOfContents() {
        const headings = document.querySelectorAll('.article-content h2, .article-content h3');
        const toc = document.getElementById('tableOfContents');
        if (!toc) return;
        toc.innerHTML = '';
        headings.forEach((heading, index) => {
            heading.id = `section-${index + 1}`;
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#section-${index + 1}`;
            link.textContent = heading.textContent;
            li.classList.toggle('toc-h3', heading.tagName === 'H3');
            li.appendChild(link);
            toc.appendChild(li);
        });
        setupActiveTocHighlighting(headings, toc);
    }

    // Highlights the TOC entry for whichever section is currently in view.
    function setupActiveTocHighlighting(headings, toc) {
        if (!headings.length || !('IntersectionObserver' in window)) return;
        const links = toc.querySelectorAll('a');
        const linkByHeadingId = new Map();
        headings.forEach((heading, index) => linkByHeadingId.set(heading.id, links[index]));

        const setActive = (link) => {
            links.forEach((a) => a.classList.remove('active'));
            if (link) link.classList.add('active');
        };

        const observer = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting);
            if (!visible.length) return;
            // Prefer the entry closest to the top of the viewport among those intersecting.
            visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            setActive(linkByHeadingId.get(visible[0].target.id));
        }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

        headings.forEach((heading) => observer.observe(heading));
    }

    function shareArticle(platform) {
        const title = window.__ARTICLE_TITLE__ || document.title;
        const url = window.location.href;
        const text = `Check out this article: ${title}`;
        const shareUrls = {
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
        };
        if (platform === 'email') {
            window.location.href = shareUrls.email;
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
        return false;
    }
    window.shareArticle = shareArticle;

    document.addEventListener('DOMContentLoaded', () => {
        calculateReadingTime();
        generateTableOfContents();
    });
})();
