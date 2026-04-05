(function () {
  'use strict';

  function createEl(tag, className, html) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  }

  function addLastUpdated(metaRight) {
    if (!metaRight || metaRight.querySelector('.last-updated-badge')) return;
    var badge = createEl('span', 'last-updated-badge', '<i class="fas fa-sync-alt"></i> Updated: April 1, 2026');
    metaRight.appendChild(badge);
  }

  function addBylineBadge(metaBar) {
    if (!metaBar || metaBar.querySelector('.byline-badge')) return;
    var metaAuthor = metaBar.querySelector('.meta-author');
    if (!metaAuthor) return;

    var img = metaAuthor.querySelector('img');
    var name = metaAuthor.querySelector('.meta-author-name');
    var role = metaAuthor.querySelector('.meta-author-role');
    if (!img || !name || !role) return;

    var badge = createEl('div', 'byline-badge');
    badge.innerHTML = [
      '<img class="byline-badge-img" src="' + img.getAttribute('src') + '" alt="' + img.getAttribute('alt') + '">',
      '<div class="byline-badge-text">',
      '  <span class="byline-label">Author Byline</span>',
      '  <strong>' + name.textContent.trim() + '</strong>',
      '  <small>' + role.textContent.trim() + '</small>',
      '</div>'
    ].join('');

    metaBar.appendChild(badge);
  }

  function addSectionDividers(articleBody) {
    var headings = articleBody.querySelectorAll('h2');
    for (var i = 1; i < headings.length; i++) {
      var h2 = headings[i];
      if (h2.previousElementSibling && h2.previousElementSibling.classList.contains('section-divider')) continue;
      h2.parentNode.insertBefore(createEl('div', 'section-divider'), h2);
    }
  }

  function styleCallouts(articleBody) {
    var callouts = articleBody.querySelectorAll('.article-callout');
    var fallbackTypes = ['important', 'pro-tip', 'case-study'];

    callouts.forEach(function (box, idx) {
      if (box.classList.contains('callout-important') || box.classList.contains('callout-pro-tip') || box.classList.contains('callout-case-study')) {
        return;
      }

      var title = (box.querySelector('h5') ? box.querySelector('h5').textContent : '').toLowerCase();
      if (title.indexOf('note') !== -1 || title.indexOf('advisory') !== -1) {
        box.classList.add('callout-important');
      } else if (title.indexOf('tip') !== -1 || title.indexOf('practical') !== -1) {
        box.classList.add('callout-pro-tip');
      } else if (title.indexOf('case') !== -1 || title.indexOf('service') !== -1) {
        box.classList.add('callout-case-study');
      } else {
        box.classList.add('callout-' + fallbackTypes[idx % fallbackTypes.length]);
      }
    });
  }

  function injectStatsBlock(articleBody) {
    if (articleBody.querySelector('.phase8-stats')) return;
    var anchor = articleBody.querySelector('h2');
    if (!anchor) return;

    var block = createEl('section', 'phase8-stats', [
      '<h4>Key Practice Snapshot</h4>',
      '<div class="phase8-stats-grid">',
      '  <div class="stat-card"><strong>15+</strong><span>Years of legal practice</span></div>',
      '  <div class="stat-card"><strong>9</strong><span>Specialized legal teams</span></div>',
      '  <div class="stat-card"><strong>100%</strong><span>Tailored strategy approach</span></div>',
      '</div>'
    ].join(''));

    anchor.insertAdjacentElement('afterend', block);
  }

  function injectQuoteBlock(articleBody) {
    if (articleBody.querySelector('.phase8-quote')) return;
    var target = articleBody.querySelectorAll('h2');
    var anchor = target.length > 1 ? target[1] : target[0];
    if (!anchor) return;

    var quote = createEl('blockquote', 'phase8-quote', [
      '<p>"Strong legal outcomes come from clear facts, disciplined process, and timely action."</p>',
      '<cite>Kamal & Associates Litigation Team</cite>'
    ].join(''));
    anchor.insertAdjacentElement('beforebegin', quote);
  }

  function detectArticleTopic() {
    // Get article title and filename for detection
    var title = (document.querySelector('h1.article-title') || {}).textContent || '';
    var pageUrl = window.location.pathname.toLowerCase();
    var category = (document.querySelector('.article-category') || {}).textContent || '';
    var combined = (title + ' ' + pageUrl + ' ' + category).toLowerCase();

    // Topic detection mapping
    if (combined.indexOf('banking') !== -1) return 'banking';
    if (combined.indexOf('adr') !== -1 || combined.indexOf('dispute resolution') !== -1 || combined.indexOf('arbitration') !== -1 || combined.indexOf('mediation') !== -1) return 'adr';
    if (combined.indexOf('aviation') !== -1) return 'aviation';
    if (combined.indexOf('admiralty') !== -1 || combined.indexOf('shipping') !== -1) return 'shipping';
    if (combined.indexOf('administrative') !== -1) return 'administrative';
    if (combined.indexOf('commercial') !== -1) return 'commercial';
    if (combined.indexOf('civil litigation') !== -1) return 'civil';
    if (combined.indexOf('company formation') !== -1) return 'company';
    if (combined.indexOf('business setup') !== -1 || combined.indexOf('business-setup') !== -1) return 'businesssetup';
    return 'general';
  }

  function getTopicCitation(topic) {
    var citations = {
      banking: 'The Artha Rin Court Ordinance, 1961, read with The Code of Civil Procedure, 1908, The Evidence Act, 1872, and Banking Regulation Act, 1972.',
      adr: 'The Arbitration Act, 2001, read with UNCITRAL Model Law on International Commercial Arbitration, and Bangladesh Mediation Ordinance.',
      aviation: 'International Civil Aviation Organization (ICAO) Annexes, The Aircraft Act, 1934, The Carriage by Air Act, 1972, and Civil Aviation Authority Regulations.',
      shipping: 'The Carriage of Goods by Sea Act (COGSA), 1925, International Maritime Organization (IMO) Conventions, and The Limitation of Liability Act, 1976.',
      administrative: 'The Constitution of Bangladesh (Article 102), Administrative Court Act Principles, and Rules of Natural Justice as per Bangladeshi jurisprudence.',
      commercial: 'The Contract Act, 1872, read with Code of Civil Procedure, 1908, The Sale of Goods Act, 1930, and Negotiable Instruments Act, 1881.',
      civil: 'Code of Civil Procedure, 1908, read with The Civil Rights Act, The Evidence Act, 1872, and Limitation Act, 1963.',
      company: 'The Companies Act, 1994 (Bangladesh), read with The RJSC Rules, The Income Tax Ordinance, 1984, and Trademark Registration Rules.',
      businesssetup: 'The Companies Act, 1994, Bangladesh Investment Development Authority (BIDA) Regulations, Customs Act, 1969, and Foreign Direct Investment Policy.',
      general: 'Companies Act, 1994 (Bangladesh), read with Code of Civil Procedure, 1908 and applicable special statutes of the relevant sector.'
    };
    return citations[topic] || citations.general;
  }

  function getTopicTableContent(topic) {
    var tables = {
      banking: {
        headers: ['Proceeding Type', 'Jurisdiction', 'Time Frame', 'Applicable Rules', 'Typical Outcome'],
        rows: [
          ['Cheque Dishonour (NI Act)', 'Specified Bank Court', '3-12 months', 'Negotiable Instruments Act, 1881', 'Criminal & Civil remedy'],
          ['Artha Rin Suit', 'Artha Rin Court', '12-24 months', 'Artha Rin Court Ordinance, 1961', 'Debt recovery with interest'],
          ['General Loan Recovery', 'Regular Civil Court', '24-48 months', 'CPC, 1908', 'Court decree & enforcement']
        ]
      },
      adr: {
        headers: ['Method', 'Speed', 'Cost', 'Binding', 'Best For'],
        rows: [
          ['Negotiation', 'Fast', 'Low', 'Not Binding', 'Amicable settlements with ongoing relationships'],
          ['Mediation', 'Moderate', 'Low to Moderate', 'Not Binding', 'Complex disputes requiring third-party facilitation'],
          ['Arbitration', 'Moderate to Long', 'Moderate to High', 'Binding & Enforceable', 'Commercial disputes requiring finality']
        ]
      },
      aviation: {
        headers: ['Dispute Type', 'Jurisdiction', 'Applicable Law', 'Forum', 'Resolution'],
        rows: [
          ['Domestic Aviation Incident', 'Bangladesh CAA', 'Aircraft Act, 1934', 'Administrative/Civil Court', 'Regulatory action or compensation'],
          ['International Carriage Dispute', 'ICAO Standards', 'Warsaw Convention / Montreal Convention', 'Arbitration/International Court', 'Treaty-based compensation limits'],
          ['Regulatory Compliance', 'Civil Aviation Authority', 'ICAO Annexes & CAA Rules', 'Administrative Appeal', 'License modification/suspension']
        ]
      },
      shipping: {
        headers: ['Dispute Category', 'Parties', 'Typical Claims', 'Applicable Law', 'Resolution Path'],
        rows: [
          ['Bill of Lading Disputes', 'Shipper vs. Carrier', 'Lost/Damaged cargo', 'COGSA 1925 & Hague Rules', 'Arbitration or Litigation'],
          ['Charter Party Disputes', 'Shipowner vs. Charterer', 'Demurrage, damage claims', 'Maritime Law & Contract Terms', 'London Arbitration (LMAA)'],
          ['Salvage & Towage', 'Salvors vs. Shipowner', 'Salved value claim', 'IMO Convention & Maritime Law', 'Arbitration or Salvage Award']
        ]
      },
      administrative: {
        headers: ['Administrative Action', 'Challenge Method', 'Timeline', 'Court Authority', 'Possible Remedies'],
        rows: [
          ['Agency Decision/Order', 'Administrative Appeal', '30-90 days', 'Administrative Court', 'Affirmation, modification, or reversal'],
          ['Violation of Rights', 'Judicial Review (CPC S.226)', '1-2 years', 'High Court Division', 'Mandamus, prohibition, certiorari'],
          ['Constitutional Right Violation', 'Writ Petition (Art.102)', '2-3 years', 'Supreme Court', 'Enforcement of fundamental rights']
        ]
      },
      commercial: {
        headers: ['Dispute Type', 'Parties', 'Typical Issues', 'Forum', 'Expected Duration'],
        rows: [
          ['Contract Breach', 'Buyer/Seller/Supplier', 'Non-performance, payment default', 'Negotiation/Arbitration', '3-12 months'],
          ['Supply Chain Disputes', 'Multiple Vendors', 'Quality, delivery, pricing', 'Commercial Arbitration', '6-18 months'],
          ['IP & Trade Secret', 'Corporation vs. Competitor', 'Infringement, misappropriation', 'Civil Court/Special Tribunal', '12-36 months']
        ]
      },
      civil: {
        headers: ['Suit Type', 'Values', 'Procedure', 'Evidence Standard', 'Average Duration'],
        rows: [
          ['Summary Suit', 'Small claims', 'Simplified CPC process', 'Preponderance of evidence', '6-12 months'],
          ['Regular Original Suit', 'General/High value', 'Full CPC 1908', 'Balance of probabilities', '18-48 months'],
          ['Special Suit (Land/Property)', 'Property disputes', 'Specific venue & procedure', 'Documentary + oral evidence', '24-60 months']
        ]
      },
      company: {
        headers: ['Entity Type', 'Liability', 'Tax Treatment', 'Compliance', 'Capital Requirement'],
        rows: [
          ['Sole Proprietorship', 'Unlimited', 'Personal income tax', 'Minimal', 'Very low'],
          ['Partnership', 'Joint & Several', 'Partnership tax', 'Moderate', 'Flexible'],
          ['Private Limited Company', 'Limited to shares', 'Corporate tax', 'High (RJSC, compliance)', 'Minimum statutory capital']
        ]
      },
      businesssetup: {
        headers: ['Structure Type', 'Foreign Investor Limit', 'Approval Time', 'Tax Incentives', 'Best For'],
        rows: [
          ['Local Business', 'Bangladeshi owners only', '4-8 weeks', 'Standard tax rates', 'Domestic market focus'],
          ['Joint Venture', '25-49% foreign stake allowed', '8-16 weeks', 'Sector-specific benefits', 'Technology transfer, partnerships'],
          ['Foreign Direct Investment', '50-100% foreign', '12-24 weeks', 'EPZ incentives, tax holidays', 'Export-oriented manufacturing']
        ]
      },
      general: {
        headers: ['Path', 'Speed', 'Cost', 'Confidentiality', 'Best For'],
        rows: [
          ['Litigation', 'Moderate to Long', 'Moderate to High', 'Low', 'Precedent and enforceable court orders'],
          ['Arbitration', 'Moderate', 'Moderate', 'High', 'Commercial contract disputes'],
          ['Mediation', 'Fast', 'Low to Moderate', 'High', 'Relationship-preserving settlements']
        ]
      }
    };
    return tables[topic] || tables.general;
  }

  function injectLawBlock(articleBody) {
    if (articleBody.querySelector('.phase8-law-block')) return;
    var share = articleBody.querySelector('.article-share');
    if (!share) return;

    var topic = detectArticleTopic();
    var citation = getTopicCitation(topic);

    var block = createEl('section', 'phase8-law-block');
    block.innerHTML = [
      '<div class="law-head">',
      '  <h4>Relevant Legal Citation</h4>',
      '  <button type="button" class="copy-law-btn">Copy Citation</button>',
      '</div>',
      '<pre><code id="phase8Citation">' + citation + '</code></pre>'
    ].join('');

    share.parentNode.insertBefore(block, share);

    var btn = block.querySelector('.copy-law-btn');
    btn.addEventListener('click', function () {
      var text = block.querySelector('#phase8Citation').textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy Citation'; }, 1200);
      });
    });
  }

  function injectComparisonTable(articleBody) {
    if (articleBody.querySelector('.phase8-table-wrap')) return;
    var share = articleBody.querySelector('.article-share');
    if (!share) return;

    var topic = detectArticleTopic();
    var tableData = getTopicTableContent(topic);

    var headerHtml = tableData.headers.map(function (h) { return '<th>' + h + '</th>'; }).join('');
    var rowsHtml = tableData.rows.map(function (row) {
      return '<tr>' + row.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
    }).join('');

    var wrap = createEl('section', 'phase8-table-wrap', [
      '<h4>' + (topic === 'adr' ? 'Resolution Path Comparison' : 'Topic-Specific Comparison') + '</h4>',
      '<div class="phase8-table-scroll">',
      '  <table class="phase8-table">',
      '    <thead><tr>' + headerHtml + '</tr></thead>',
      '    <tbody>' + rowsHtml + '</tbody>',
      '  </table>',
      '</div>'
    ].join(''));

    share.parentNode.insertBefore(wrap, share);
  }

  function markFeatureImage(articleBody) {
    var hero = articleBody.querySelector('.article-hero-media');
    if (!hero) return;
    hero.classList.add('phase8-feature-image');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var articleBody = document.querySelector('.article-content .col-lg-8');
    var metaBar = document.querySelector('.article-meta-bar');
    var metaRight = document.querySelector('.article-meta-bar .meta-right');
    if (!articleBody) return;

    addLastUpdated(metaRight);
    addBylineBadge(metaBar);
    markFeatureImage(articleBody);
    addSectionDividers(articleBody);
    styleCallouts(articleBody);
    injectStatsBlock(articleBody);
    injectQuoteBlock(articleBody);
    injectLawBlock(articleBody);
    injectComparisonTable(articleBody);
  });
})();
