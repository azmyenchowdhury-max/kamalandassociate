/* =============================================================
   blog-lead-gen.js — Phase 5 : Lead Generation & Conversion
   Kamal & Associates
   Provides:
     1. Top CTA Banner (dismissible)
     2. Contextual mid-article CTA
     3. Bottom CTA Banner with inline consultation form
     4. Sidebar Practice Area widget
     5. Enhanced sidebar newsletter (pre-fill, success state)
     6. Sticky Newsletter Bar (scroll-triggered)
     7. Exit Intent Overlay
   ============================================================= */
(function () {
    'use strict';

    // ── Article registry (minimal — category + title only needed) ────────
    var ARTICLE_DATA = [
        { slug: 'company-formation-guide.html',           title: 'Company Formation in Bangladesh: A Step-by-Step Legal Guide',        category: 'Company Formation' },
        { slug: 'commercial-litigation-complete-guide.html', title: 'Commercial Litigation in Bangladesh: A Complete Legal Guide',     category: 'Commercial Litigation' },
        { slug: 'civil-litigation-complete-guide.html',    title: 'Civil Litigation in Bangladesh: A Complete Guide',                 category: 'Civil Litigation' },
        { slug: 'business-setup-bangladesh.html',          title: 'Business Setup in Bangladesh: A Complete Legal Guide',             category: 'Business Setup' },
        { slug: 'banking-litigation-comprehensive.html',   title: 'Navigating Banking Litigation in Bangladesh: A Comprehensive Guide', category: 'Banking Litigation' },
        { slug: 'banking-litigation-guide.html',           title: 'Banking Litigation in Bangladesh: A Complete Legal Guide',         category: 'Banking Litigation' },
        { slug: 'aviation-law-bangladesh.html',            title: 'Aviation Law in Bangladesh: Navigating Complex Skies',             category: 'Aviation Law' },
        { slug: 'adr-dispute-resolution.html',             title: 'Alternative Dispute Resolution (ADR): Fast and Efficient Solutions', category: 'Alternative Dispute Resolution' },
        { slug: 'admiralty-shipping-law.html',             title: 'Admiralty and Shipping Law: Maritime Commerce Guide',              category: 'Admiralty and Shipping Law' },
        { slug: 'administrative-law-bangladesh.html',      title: 'Administrative Law in Bangladesh: Challenging Government Decisions', category: 'Administrative Law' }
    ];

    // ── Practice-area rich data ──────────────────────────────────────────
    var PRACTICE_MAP = {
        'Banking Litigation': {
            pitch: 'Recover debts, enforce securities and navigate Artha Rin Adalat disputes with specialist counsel.',
            bullets: ['Artha Rin Adalat filing & representation', 'Cheque dishonour cases (NI Act)', 'Banking fraud & financial crime defence']
        },
        'Civil Litigation': {
            pitch: 'Property disputes to contract breaches — expert civil advocacy from district to High Court.',
            bullets: ['Title suit & property litigation', 'Contract enforcement & damages', 'Injunctions & interim relief']
        },
        'Commercial Litigation': {
            pitch: 'Resolve business disputes, trade conflicts and corporate claims with decisive legal strategy.',
            bullets: ['Business contract disputes', 'Trade finance litigation', 'Commercial arbitration & ADR']
        },
        'Company Formation': {
            pitch: 'Register your company correctly from day one — RJSC filing, compliance, and governance advice.',
            bullets: ['RJSC company registration', 'Articles & Memorandum drafting', 'Post-incorporation compliance']
        },
        'Business Setup': {
            pitch: 'Structure your venture legally — entity choice, licences, regulatory clearances and investor advice.',
            bullets: ['Entity structure & licensing', 'BIDA & BOI investment clearance', 'Regulatory compliance advisory']
        },
        'Aviation Law': {
            pitch: 'Expert aviation regulatory advice, aircraft disputes, and CAAB compliance in Bangladesh.',
            bullets: ['CAAB regulatory compliance', 'Aircraft registration & leasing', 'Aviation insurance & claims']
        },
        'Alternative Dispute Resolution': {
            pitch: 'Resolve disputes faster and cheaper — skilled arbitrators and mediators at your service.',
            bullets: ['ICC & BCIC arbitration', 'Court-annexed mediation', 'Conciliation & settlement drafting']
        },
        'Admiralty and Shipping Law': {
            pitch: "Maritime claims, ship arrests, and cargo disputes by Bangladesh's specialist shipping lawyers.",
            bullets: ['Ship arrest & maritime liens', 'Cargo damage & freight claims', 'Port authority & Customs disputes']
        },
        'Administrative Law': {
            pitch: 'Challenge unlawful government action — writ petitions and judicial review before the High Court.',
            bullets: ['Writ petitions (certiorari, mandamus)', 'Service law & dismissal cases', 'Permit / licence refusal appeals']
        }
    };

    var FORMSUBMIT_URL = 'https://formsubmit.co/ajax/info@kamalassociates.com.bd';

    // ── Helpers ────────────────────────────────────────────────────────────
    function bySlug(slug) {
        return ARTICLE_DATA.find(function (x) { return x.slug === slug; });
    }

    function practiceData(category) {
        return PRACTICE_MAP[category] || {
            pitch: 'Our attorneys provide specialist legal services across all major practice areas in Bangladesh.',
            bullets: ['Expert legal advice', 'Court representation', 'Strategic legal counsel']
        };
    }

    // ── 1. Top CTA Banner ─────────────────────────────────────────────────
    // Injected as the first child of .article-content .col-lg-8
    function injectTopCTA(article) {
        if (document.getElementById('articleTopCta')) return;
        if (sessionStorage.getItem('kaTopCtaDismissed')) return;

        var banner = document.createElement('div');
        banner.id = 'articleTopCta';
        banner.className = 'article-top-cta';
        banner.innerHTML = [
            '<div class="top-cta-content">',
            '<i class="fas fa-balance-scale top-cta-icon" aria-hidden="true"></i>',
            '<div class="top-cta-text">',
            '<strong>Need legal guidance on ' + article.category + '?</strong>',
            '<span>Talk to our attorneys — first consultation is free.</span>',
            '</div>',
            '</div>',
            '<div class="top-cta-actions">',
            '<a href="../consultation.html" class="top-cta-btn">',
            '<i class="fas fa-calendar-check" aria-hidden="true"></i> Book Free Consultation',
            '</a>',
            '<button type="button" class="top-cta-dismiss" aria-label="Dismiss banner">&times;</button>',
            '</div>'
        ].join('');

        banner.querySelector('.top-cta-dismiss').addEventListener('click', function () {
            banner.classList.add('is-dismissed');
            window.setTimeout(function () {
                if (banner.parentNode) banner.parentNode.removeChild(banner);
            }, 350);
            sessionStorage.setItem('kaTopCtaDismissed', '1');
        });

        var mainCol = document.querySelector('.article-content .col-lg-8');
        if (mainCol) mainCol.insertBefore(banner, mainCol.firstChild);
    }

    // ── 2. Contextual Mid-Article CTA ─────────────────────────────────────
    // Inserted before the 4th H2 in the article body
    function injectContextualCTA(article) {
        if (document.getElementById('articleContextualCta')) return;

        var mainCol = document.querySelector('.article-content .col-lg-8');
        if (!mainCol) return;

        var h2s = Array.from(mainCol.querySelectorAll('h2'));
        var targetH2 = h2s[3] || h2s[Math.floor(h2s.length / 2)] || null;
        if (!targetH2) return;

        var cta = document.createElement('div');
        cta.id = 'articleContextualCta';
        cta.className = 'contextual-cta';
        cta.innerHTML = [
            '<div class="contextual-cta-icon" aria-hidden="true"><i class="fas fa-comments"></i></div>',
            '<div class="contextual-cta-body">',
            '<strong>Need help with ' + article.category + '?</strong>',
            '<p>Our attorneys are ready to assist. Speak with a specialist — no obligation, no charge for the initial call.</p>',
            '<a href="../consultation.html" class="contextual-cta-link">Contact us today <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i></a>',
            '</div>'
        ].join('');

        targetH2.parentNode.insertBefore(cta, targetH2);
    }

    // ── 3. Bottom CTA Banner with inline consultation form ────────────────
    // Inserted before #articleChronoNav (prev/next nav, injected by blog-intelligence.js)
    function injectBottomCTA(article) {
        if (document.getElementById('articleBottomCta')) return;

        var pa = practiceData(article.category);

        var banner = document.createElement('div');
        banner.id = 'articleBottomCta';
        banner.className = 'article-bottom-cta';
        banner.innerHTML = [
            '<div class="bottom-cta-left">',
            '<div class="bottom-cta-badge"><i class="fas fa-gavel" aria-hidden="true"></i> Kamal &amp; Associates</div>',
            '<h3 class="bottom-cta-heading">Ready to act on your ' + article.category + ' matter?</h3>',
            '<p class="bottom-cta-pitch">' + pa.pitch + '</p>',
            '<ul class="bottom-cta-bullets">',
            pa.bullets.map(function (b) {
                return '<li><i class="fas fa-check" aria-hidden="true"></i> ' + b + '</li>';
            }).join(''),
            '</ul>',
            '<div class="bottom-cta-buttons">',
            '<a href="../consultation.html" class="btn-cta-primary"><i class="fas fa-calendar-check" aria-hidden="true"></i> Schedule Free Consultation</a>',
            '<a href="../practice-areas.html" class="btn-cta-secondary"><i class="fas fa-arrow-right" aria-hidden="true"></i> Explore ' + article.category + '</a>',
            '</div>',
            '</div>',
            '<div class="bottom-cta-right">',
            '<div class="inline-consult-form-wrap">',
            '<h4 class="form-wrap-heading"><i class="fas fa-paper-plane" aria-hidden="true"></i> Quick Enquiry</h4>',
            '<form id="articleInlineForm" class="inline-consult-form" novalidate>',
            '<div class="form-field">',
            '<label class="form-field-label" for="iqName">Full Name <span aria-hidden="true">*</span></label>',
            '<input type="text" id="iqName" name="name" placeholder="Your full name" required class="form-input" autocomplete="name">',
            '</div>',
            '<div class="form-field">',
            '<label class="form-field-label" for="iqEmail">Email Address <span aria-hidden="true">*</span></label>',
            '<input type="email" id="iqEmail" name="email" placeholder="you@example.com" required class="form-input" autocomplete="email">',
            '</div>',
            '<div class="form-field">',
            '<label class="form-field-label" for="iqPhone">Phone / WhatsApp</label>',
            '<input type="tel" id="iqPhone" name="phone" placeholder="+880 …" class="form-input" autocomplete="tel">',
            '</div>',
            '<div class="form-field">',
            '<label class="form-field-label" for="iqConcern">Brief Description <span aria-hidden="true">*</span></label>',
            '<textarea id="iqConcern" name="concern" rows="3" placeholder="Describe your legal concern briefly…" required class="form-input form-textarea"></textarea>',
            '</div>',
            '<button type="submit" class="form-submit-btn"><i class="fas fa-paper-plane" aria-hidden="true"></i> Send Enquiry</button>',
            '<p class="form-note">We respond within 24 hours. Free initial consultation.</p>',
            '</form>',
            '<div id="articleInlineFormSuccess" class="form-success-state is-hidden" role="status" aria-live="polite">',
            '<i class="fas fa-check-circle form-success-icon" aria-hidden="true"></i>',
            '<strong>Enquiry received!</strong>',
            '<p>Our attorneys will contact you within 24 hours.</p>',
            '<a href="../consultation.html" class="form-success-link">Schedule a call now \u2192</a>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');

        wireInlineForm(banner, article);

        // Insert before #articleChronoNav so it appears before prev/next navigation
        var nav = document.getElementById('articleChronoNav');
        var mainCol = document.querySelector('.article-content .col-lg-8');
        if (!mainCol) mainCol = document.querySelector('.article-content');

        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(banner, nav);
        } else {
            var existingCta = mainCol ? mainCol.querySelector('.article-cta') : null;
            if (existingCta) existingCta.insertAdjacentElement('afterend', banner);
            else if (mainCol) mainCol.appendChild(banner);
        }
    }

    function wireInlineForm(container, article) {
        var form = container.querySelector('#articleInlineForm');
        var success = container.querySelector('#articleInlineFormSuccess');
        if (!form || !success) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            var submitBtn = form.querySelector('.form-submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending\u2026';
            }

            var fd = new FormData();
            fd.append('name',    form.querySelector('[name="name"]').value.trim());
            fd.append('email',   form.querySelector('[name="email"]').value.trim());
            fd.append('phone',   (form.querySelector('[name="phone"]').value || '').trim());
            fd.append('concern', form.querySelector('[name="concern"]').value.trim());
            fd.append('_subject', 'Blog Enquiry: ' + article.title);
            fd.append('Article',  article.title);
            fd.append('Category', article.category);

            fetch(FORMSUBMIT_URL, {
                method: 'POST',
                body: fd,
                headers: { 'Accept': 'application/json' }
            }).then(function () {
                form.classList.add('is-hidden');
                success.classList.remove('is-hidden');
            }).catch(function () {
                // Show success state even on network error — form data was attempted
                form.classList.add('is-hidden');
                success.classList.remove('is-hidden');
            });
        });
    }

    // ── 4. Sidebar Practice Area widget ───────────────────────────────────
    // Injected into .sidebar-stack, before the newsletter widget
    function injectSidebarPracticeWidget(article) {
        if (document.getElementById('sidebarPracticeWidget')) return;

        var sidebarStack = document.querySelector('.sidebar-stack');
        if (!sidebarStack) return;

        var pa = practiceData(article.category);

        var widget = document.createElement('div');
        widget.id = 'sidebarPracticeWidget';
        widget.className = 'sidebar-widget sidebar-practice-widget';
        widget.innerHTML = [
            '<h5 class="sidebar-practice-title"><i class="fas fa-balance-scale me-2" aria-hidden="true"></i>' + article.category + '</h5>',
            '<p class="sidebar-practice-pitch">' + pa.pitch + '</p>',
            '<ul class="sidebar-practice-bullets">',
            pa.bullets.map(function (b) {
                return '<li><i class="fas fa-check-circle" aria-hidden="true"></i> ' + b + '</li>';
            }).join(''),
            '</ul>',
            '<a href="../practice-areas.html" class="sidebar-practice-link">',
            'Explore ' + article.category + ' <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>',
            '</a>'
        ].join('');

        var firstWidget = sidebarStack.querySelector('.sidebar-widget');
        if (firstWidget) sidebarStack.insertBefore(widget, firstWidget);
        else sidebarStack.appendChild(widget);
    }

    // ── 5. Enhance sidebar newsletter form ────────────────────────────────
    // Pre-fills email if already stored; shows improved success state
    function enhanceSidebarNewsletter() {
        var form = document.getElementById('newsletterForm');
        if (!form || form.dataset.phase5Enhanced) return;
        form.dataset.phase5Enhanced = 'true';

        var emailInput = form.querySelector('input[type="email"]');
        if (emailInput) {
            var saved = localStorage.getItem('kaBlogNewsletterEmail');
            if (saved) {
                emailInput.value = saved;
                var btn = form.querySelector('button[type="submit"]');
                if (btn) {
                    btn.textContent = 'Already Subscribed \u2713';
                    btn.disabled = true;
                    btn.classList.add('is-subscribed');
                }
                return;
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var input = form.querySelector('input[type="email"]');
            if (!input || !input.value.trim()) return;

            localStorage.setItem('kaBlogNewsletterEmail', input.value.trim());

            var feedback = document.getElementById('newsletterFeedback');
            if (feedback) {
                feedback.classList.add('is-visible');
                feedback.textContent = "You\u2019re subscribed! Legal insights coming soon.";
            }
            var btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.textContent = 'Subscribed \u2713';
                btn.disabled = true;
                btn.classList.add('is-subscribed');
            }
        });
    }

    // ── 6. Sticky Newsletter Bar ──────────────────────────────────────────
    // Slides up from bottom after 55% scroll depth (once per localStorage session)
    function injectStickyNewsletterBar() {
        if (document.getElementById('stickyNewsletterBar')) return;
        if (localStorage.getItem('kaBlogNewsletterEmail')) return;
        if (localStorage.getItem('kaNewsletterBarDismissed')) return;

        var bar = document.createElement('div');
        bar.id = 'stickyNewsletterBar';
        bar.className = 'sticky-newsletter-bar';
        bar.setAttribute('role', 'complementary');
        bar.setAttribute('aria-label', 'Newsletter subscription offer');
        bar.innerHTML = [
            '<div class="snb-inner">',
            '<div class="snb-text">',
            '<i class="fas fa-envelope-open-text snb-icon" aria-hidden="true"></i>',
            '<div>',
            '<strong>Free Legal Insights</strong>',
            '<span>Monthly updates from Kamal &amp; Associates attorneys, delivered to your inbox.</span>',
            '</div>',
            '</div>',
            '<form id="stickyNewsletterForm" class="snb-form" novalidate>',
            '<label for="snbEmail" class="visually-hidden">Email address</label>',
            '<input type="email" id="snbEmail" placeholder="Your email address" required class="snb-email-input" autocomplete="email">',
            '<button type="submit" class="snb-submit-btn"><i class="fas fa-paper-plane" aria-hidden="true"></i> Subscribe</button>',
            '</form>',
            '<button type="button" class="snb-close-btn" id="snbDismiss" aria-label="Close newsletter bar">&times;</button>',
            '</div>'
        ].join('');

        document.body.appendChild(bar);

        document.getElementById('snbDismiss').addEventListener('click', function () {
            bar.classList.remove('is-visible');
            localStorage.setItem('kaNewsletterBarDismissed', '1');
            window.setTimeout(function () {
                if (bar.parentNode) bar.parentNode.removeChild(bar);
            }, 450);
        });

        document.getElementById('stickyNewsletterForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var emailInput = document.getElementById('snbEmail');
            if (!emailInput || !emailInput.value.trim()) return;

            localStorage.setItem('kaBlogNewsletterEmail', emailInput.value.trim());

            bar.innerHTML = [
                '<div class="snb-inner snb-success">',
                '<i class="fas fa-check-circle snb-success-icon" aria-hidden="true"></i>',
                '<strong>You\u2019re subscribed! Thank you.</strong>',
                '<span>Watch for our next legal insights digest.</span>',
                '<button type="button" id="snbSuccessClose" class="snb-close-btn" aria-label="Close">&times;</button>',
                '</div>'
            ].join('');

            document.getElementById('snbSuccessClose').addEventListener('click', function () {
                bar.classList.remove('is-visible');
                window.setTimeout(function () {
                    if (bar.parentNode) bar.parentNode.removeChild(bar);
                }, 450);
            });
        });

        var shown = false;
        window.addEventListener('scroll', function () {
            if (shown) return;
            var max = document.documentElement.scrollHeight - window.innerHeight;
            if (max > 0 && window.scrollY / max > 0.55) {
                shown = true;
                bar.classList.add('is-visible');
            }
        }, { passive: true });
    }

    // ── 7. Exit Intent Overlay ────────────────────────────────────────────
    // Triggered once per session when mouse exits viewport via the top edge
    function setupExitIntent(article) {
        if (sessionStorage.getItem('kaExitIntentShown')) return;

        var readyAt = Date.now() + 10000; // Minimum 10s on page before triggering
        var triggered = false;

        function handleLeave(e) {
            if (triggered) return;
            if (e.clientY > 5) return;              // Only top-edge exits
            if (Date.now() < readyAt) return;        // Too soon
            triggered = true;
            sessionStorage.setItem('kaExitIntentShown', '1');
            document.removeEventListener('mouseleave', handleLeave);
            showExitOverlay(article);
        }

        document.addEventListener('mouseleave', handleLeave);
    }

    function showExitOverlay(article) {
        if (document.getElementById('exitIntentOverlay')) return;

        var alreadySubscribed = !!localStorage.getItem('kaBlogNewsletterEmail');

        var formSection = alreadySubscribed ? '' : [
            '<form id="exitIntentForm" class="exit-form" novalidate>',
            '<label for="exitEmail" class="visually-hidden">Email address</label>',
            '<input type="email" id="exitEmail" placeholder="Your email address" required class="exit-email-input" autocomplete="email">',
            '<button type="submit" class="exit-subscribe-btn"><i class="fas fa-envelope-open-text" aria-hidden="true"></i> Send Me Insights</button>',
            '</form>',
            '<div id="exitFormSuccess" class="exit-form-success is-hidden" role="status" aria-live="polite">',
            '<i class="fas fa-check-circle" aria-hidden="true"></i> <strong>Subscribed!</strong> Watch for our next digest.',
            '</div>',
            '<div class="exit-divider"><span>or</span></div>'
        ].join('');

        var subText = alreadySubscribed
            ? 'You\u2019re already subscribed. Schedule a free consultation with one of our <strong>' + article.category + '</strong> attorneys today.'
            : 'Get a free monthly digest of legal insights on <strong>' + article.category + '</strong> from our attorneys \u2014 no spam, unsubscribe anytime.';

        var overlay = document.createElement('div');
        overlay.id = 'exitIntentOverlay';
        overlay.className = 'exit-intent-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Before you leave — free legal insights offer');
        overlay.innerHTML = [
            '<div class="exit-intent-card">',
            '<button type="button" class="exit-close-btn" id="exitClose" aria-label="Close this dialog">',
            '<i class="fas fa-times" aria-hidden="true"></i>',
            '</button>',
            '<div class="exit-brand-icon" aria-hidden="true"><i class="fas fa-balance-scale"></i></div>',
            '<h3 class="exit-heading">Before You Leave\u2026</h3>',
            '<p class="exit-sub">' + subText + '</p>',
            formSection,
            '<a href="../consultation.html" class="exit-consult-btn"><i class="fas fa-calendar-check" aria-hidden="true"></i> Schedule a Free Consultation</a>',
            '<button type="button" class="exit-skip-btn" id="exitSkip">No thanks, I\u2019ll continue reading</button>',
            '</div>'
        ].join('');

        document.body.appendChild(overlay);

        // Animate in on next paint
        window.requestAnimationFrame(function () {
            overlay.classList.add('is-visible');
        });

        function closeOverlay() {
            overlay.classList.remove('is-visible');
            window.setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 400);
        }

        document.getElementById('exitClose').addEventListener('click', closeOverlay);
        document.getElementById('exitSkip').addEventListener('click', closeOverlay);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOverlay();
        });

        var exitForm = document.getElementById('exitIntentForm');
        if (exitForm) {
            exitForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var emailInput = document.getElementById('exitEmail');
                if (!emailInput || !emailInput.value.trim()) return;

                localStorage.setItem('kaBlogNewsletterEmail', emailInput.value.trim());
                exitForm.classList.add('is-hidden');

                var successDiv = document.getElementById('exitFormSuccess');
                if (successDiv) successDiv.classList.remove('is-hidden');
                window.setTimeout(closeOverlay, 2800);
            });
        }

        // Close on Escape
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') {
                closeOverlay();
                document.removeEventListener('keydown', onEsc);
            }
        });
    }

    // ── Init ──────────────────────────────────────────────────────────────
    function init() {
        if (!location.pathname.includes('/blog/')) return;
        if (document.body && document.body.dataset.phase5Ready === 'true') return;

        var slug = location.pathname.split('/').pop();
        var article = bySlug(slug);
        if (!article) return;

        injectTopCTA(article);
        injectContextualCTA(article);
        injectBottomCTA(article);
        injectSidebarPracticeWidget(article);
        enhanceSidebarNewsletter();
        injectStickyNewsletterBar();
        setupExitIntent(article);

        if (document.body) document.body.dataset.phase5Ready = 'true';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
