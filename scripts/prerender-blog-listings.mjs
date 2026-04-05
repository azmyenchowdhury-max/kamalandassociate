import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'blog');

const POSTS = [
  {
    slug: 'company-formation-guide.html',
    title: 'Company Formation in Bangladesh: A Step-by-Step Legal Guide',
    excerpt: 'Entity structure, RJSC process, and compliance sequencing.',
    category: 'Company Formation',
    categorySlug: 'company-formation',
    author: 'Adv. Mohammad Mostofa Kamal',
    authorSlug: 'mohammad-mostofa-kamal',
    date: '2026-01-10',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=450&fit=crop',
    tags: ['company formation', 'rjsc', 'corporate compliance', 'incorporation']
  },
  {
    slug: 'commercial-litigation-complete-guide.html',
    title: 'Commercial Litigation in Bangladesh: A Complete Guide',
    excerpt: 'Contract claims, injunctions, and evidence strategy.',
    category: 'Commercial Litigation',
    categorySlug: 'commercial-litigation',
    author: 'Adv. Mohammad Kabir',
    authorSlug: 'mohammad-kabir',
    date: '2026-01-09',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
    tags: ['commercial litigation', 'contracts', 'injunction', 'shareholder dispute']
  },
  {
    slug: 'civil-litigation-complete-guide.html',
    title: 'Civil Litigation in Bangladesh: A Complete Guide',
    excerpt: 'Procedure, injunctions, and decree enforcement essentials.',
    category: 'Civil Litigation',
    categorySlug: 'civil-litigation',
    author: 'Adv. Mohammad Kabir',
    authorSlug: 'mohammad-kabir',
    date: '2026-01-08',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop',
    tags: ['civil litigation', 'decree', 'court procedure', 'property claim']
  },
  {
    slug: 'business-setup-bangladesh.html',
    title: 'Business Setup in Bangladesh: A Complete Legal Guide',
    excerpt: 'Entity planning, registration flow, and launch compliance.',
    category: 'Business Setup',
    categorySlug: 'business-setup',
    author: 'Adv. Mohammad Mostofa Kamal',
    authorSlug: 'mohammad-mostofa-kamal',
    date: '2026-01-07',
    image: 'https://images.unsplash.com/photo-1462899006636-339e08d1844e?w=800&h=450&fit=crop',
    tags: ['business setup', 'investment', 'rjsc', 'trade license']
  },
  {
    slug: 'banking-litigation-comprehensive.html',
    title: 'Banking Litigation in Bangladesh: A Comprehensive Guide',
    excerpt: 'Artha Rin defense, cheque disputes, and recovery strategy.',
    category: 'Banking Litigation',
    categorySlug: 'banking-litigation',
    author: 'Adv. Mustafa Kamal Chowdhury',
    authorSlug: 'mustafa-kamal-chowdhury',
    date: '2026-01-06',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&h=450&fit=crop',
    tags: ['banking litigation', 'artha rin', 'loan recovery', 'cheque dishonour']
  },
  {
    slug: 'banking-litigation-guide.html',
    title: 'Banking Litigation in Bangladesh: A Complete Legal Guide',
    excerpt: 'Debt recovery and borrower defense practical framework.',
    category: 'Banking Litigation',
    categorySlug: 'banking-litigation',
    author: 'Adv. Mohammad Mostofa Kamal',
    authorSlug: 'mohammad-mostofa-kamal',
    date: '2026-01-05',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
    tags: ['banking litigation', 'debt recovery', 'borrower defense', 'finance disputes']
  },
  {
    slug: 'aviation-law-bangladesh.html',
    title: 'Aviation Law in Bangladesh: Navigating Complex Skies',
    excerpt: 'Regulation, operation, and liability for aviation sector.',
    category: 'Aviation Law',
    categorySlug: 'aviation-law',
    author: 'Adv. Mohammad Mostofa Kamal',
    authorSlug: 'mohammad-mostofa-kamal',
    date: '2026-01-04',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=450&fit=crop',
    tags: ['aviation law', 'aircraft regulation', 'airline liability', 'civil aviation']
  },
  {
    slug: 'adr-dispute-resolution.html',
    title: 'Alternative Dispute Resolution (ADR) in Bangladesh',
    excerpt: 'Mediation, arbitration, and faster dispute pathways.',
    category: 'ADR',
    categorySlug: 'adr',
    author: 'Adv. Nasrin Akter',
    authorSlug: 'nasrin-akter',
    date: '2026-01-03',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=450&fit=crop',
    tags: ['adr', 'mediation', 'arbitration', 'negotiation']
  },
  {
    slug: 'admiralty-shipping-law.html',
    title: 'Admiralty & Shipping Law in Bangladesh',
    excerpt: 'Maritime contracts, cargo disputes, and vessel liability.',
    category: 'Admiralty & Shipping',
    categorySlug: 'admiralty-shipping',
    author: 'Adv. Harun Rayhan',
    authorSlug: 'harun-rayhan',
    date: '2026-01-02',
    image: 'https://images.unsplash.com/photo-1545243424-0ce743321e11?w=800&h=450&fit=crop',
    tags: ['admiralty law', 'shipping law', 'cargo dispute', 'maritime contracts']
  },
  {
    slug: 'administrative-law-bangladesh.html',
    title: 'Administrative Law in Bangladesh: Complete Legal Guide',
    excerpt: 'Writ remedies, due process, and public law accountability.',
    category: 'Administrative Law',
    categorySlug: 'administrative-law',
    author: 'Adv. Mohammad Mostofa Kamal',
    authorSlug: 'mohammad-mostofa-kamal',
    date: '2026-01-01',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
    tags: ['administrative law', 'writ petition', 'government decisions', 'judicial review']
  }
].sort((a, b) => (a.date < b.date ? 1 : -1));

function monthKey(date) {
  return date.slice(0, 7);
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getBlogRootPrefix(filePath) {
  const rel = filePath.replace(BLOG_DIR, '').replace(/^[/\\]+/, '');
  const dir = dirname(rel).replace(/\\/g, '/');
  if (!dir || dir === '.') return '';
  const depth = dir.split('/').filter(Boolean).length;
  return '../'.repeat(depth);
}

function applyModeFilter(posts, mode, presetCategory, presetAuthor, presetYear, presetMonth) {
  if (mode === 'category' && presetCategory) {
    return posts.filter((p) => p.categorySlug === presetCategory);
  }
  if (mode === 'author' && presetAuthor) {
    return posts.filter((p) => p.authorSlug === presetAuthor);
  }
  if (mode === 'archive-year' && presetYear) {
    return posts.filter((p) => p.date.startsWith(`${presetYear}-`));
  }
  if (mode === 'archive-month' && presetYear && presetMonth) {
    return posts.filter((p) => p.date.startsWith(`${presetYear}-${presetMonth}-`));
  }
  return posts;
}

function renderCard(post, prefix) {
  const articleHref = `${prefix}${post.slug}`;
  const authorHref = `${prefix}author/${post.authorSlug}.html`;
  const img = /^https?:\/\//i.test(post.image) ? post.image : `/${post.image.replace(/^\/+/, '')}`;

  return [
    '<div class="col-md-6 article-item">',
    '  <article class="glass-card">',
    '    <div class="card-media">',
    `      <span class="badge-soft">${post.category}</span>`,
    `      <img class="card-media-img" src="${img}" alt="${post.title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='/images/blog/company-formation-guide-thumb.webp';">`,
    '    </div>',
    '    <div class="card-bodyx">',
    `      <div class="meta-row">${formatDate(post.date)} | <a href="${authorHref}">${post.author}</a></div>`,
    `      <h3 class="card-titlex"><a href="${articleHref}">${post.title}</a></h3>`,
    `      <p class="mb-2 text-secondary">${post.excerpt}</p>`,
    `      <div class="card-tags">${(post.tags || []).slice(0, 3).map((tag) => `<span class="tag-chip">${tag}</span>`).join('')}</div>`,
    `      <a class="read-link" href="${articleHref}">Read article <i class="fas fa-arrow-right ms-1"></i></a>`,
    '    </div>',
    '  </article>',
    '</div>'
  ].join('\n');
}

function parseAppConfig(html) {
  const match = html.match(/id="blogArchiveApp"[^>]*>/i);
  if (!match) return null;
  const tag = match[0];
  const get = (name) => {
    const m = tag.match(new RegExp(`${name}="([^"]*)"`, 'i'));
    return m ? m[1] : '';
  };
  return {
    mode: get('data-mode') || 'home',
    category: get('data-category') || '',
    author: get('data-author') || '',
    year: get('data-year') || '',
    month: get('data-month') || ''
  };
}

function findMatchingDivEnd(html, openStart) {
  const openToken = '<div';
  const closeToken = '</div>';

  let index = openStart;
  let depth = 0;

  while (index < html.length) {
    const nextOpen = html.indexOf(openToken, index);
    const nextClose = html.indexOf(closeToken, index);

    if (nextClose === -1) return -1;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + openToken.length;
      continue;
    }

    depth -= 1;
    index = nextClose + closeToken.length;

    if (depth === 0) {
      return index;
    }
  }

  return -1;
}

async function updateFile(filePath) {
  let html = await readFile(filePath, 'utf8');
  const app = parseAppConfig(html);
  if (!app) return false;

  const prefix = getBlogRootPrefix(filePath);
  const filtered = applyModeFilter(POSTS, app.mode, app.category, app.author, app.year, app.month);
  const cards = filtered.map((post) => renderCard(post, prefix)).join('\n');

  const gridOpenPattern = /<div class="row g-4" id="blogGrid">/i;
  const gridOpenMatch = gridOpenPattern.exec(html);
  if (!gridOpenMatch) return false;

  const gridStart = gridOpenMatch.index;
  const gridOpenEnd = gridStart + gridOpenMatch[0].length;
  const gridEnd = findMatchingDivEnd(html, gridStart);
  if (gridEnd === -1) return false;

  const newGrid = `<div class="row g-4" id="blogGrid">\n${cards}\n</div>`;
  html = `${html.slice(0, gridStart)}${newGrid}${html.slice(gridEnd)}`;

  const noun = filtered.length === 1 ? 'article' : 'articles';
  html = html.replace(/(<p class="results-summary mb-0" id="resultsSummary">)[\s\S]*?(<\/p>)/i, `$1Showing ${filtered.length} ${noun}$2`);

  await writeFile(filePath, html, 'utf8');
  return true;
}

async function collectTargets() {
  const top = [join(ROOT, 'blog.html')];

  const addFolder = async (folder, recursive = false) => {
    const entries = await readdir(folder, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(folder, entry.name);
      if (entry.isDirectory() && recursive) {
        await addFolder(full, true);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        top.push(full);
      }
    }
  };

  await addFolder(join(BLOG_DIR, 'author'));
  await addFolder(join(BLOG_DIR, 'category'));
  await addFolder(join(BLOG_DIR, 'archive'), true);

  return top;
}

async function run() {
  const files = await collectTargets();
  let count = 0;

  for (const file of files) {
    const changed = await updateFile(file);
    if (changed) count += 1;
  }

  console.log(`Prerendered listing grids in ${count} files.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
