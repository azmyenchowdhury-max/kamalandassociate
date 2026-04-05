import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const blogDir = join(root, 'blog');
const baseUrl = 'https://kamalassociates.com.bd';

// Archive page metadata configuration
const archiveMetadata = {
  'search.html': {
    title: 'Search Results | Kamal & Associates',
    description: 'Search legal articles and insights from Kamal & Associates on litigation, corporate law, banking, maritime, and administrative law.',
    image: 'https://kamalassociates.com.bd/images/og-blog-archive.jpg',
    type: 'website'
  },
  'category': {
    'company-formation': {
      title: 'Company Formation Legal Articles',
      description: 'Expert guidance on company formation, RJSC registration, and business incorporation in Bangladesh.',
      keywords: 'company formation, RJSC registration, business incorporation',
      image: 'https://kamalassociates.com.bd/images/og-company-formation.jpg'
    },
    'business-setup': {
      title: 'Business Setup Legal Resources',
      description: 'Complete legal guidance for setting up and establishing your business in Bangladesh.',
      keywords: 'business setup, startup legal setup, business registration',
      image: 'https://kamalassociates.com.bd/images/og-business-setup.jpg'
    },
    'commercial-litigation': {
      title: 'Commercial Litigation Insights',
      description: 'In-depth analysis of commercial litigation, contract disputes, and business protection strategies.',
      keywords: 'commercial litigation, contract disputes, business law',
      image: 'https://kamalassociates.com.bd/images/og-commercial-litigation.jpg'
    },
    'civil-litigation': {
      title: 'Civil Litigation Legal Guides',
      description: 'Comprehensive civil litigation strategies and court procedures from experienced attorneys.',
      keywords: 'civil litigation, civil procedure, court strategy',
      image: 'https://kamalassociates.com.bd/images/og-civil-litigation.jpg'
    },
    'banking-litigation': {
      title: 'Banking Litigation & Recovery',
      description: 'Expert analysis of banking disputes, loan recovery, and financial law in Bangladesh.',
      keywords: 'banking litigation, loan recovery, Artha Rin Act',
      image: 'https://kamalassociates.com.bd/images/og-banking-litigation.jpg'
    },
    'aviation-law': {
      title: 'Aviation Law Resources',
      description: 'Legal insights into aviation law, aircraft disputes, and aerospace regulations in Bangladesh.',
      keywords: 'aviation law, aircraft law, aerospace regulations',
      image: 'https://kamalassociates.com.bd/images/og-aviation-law.jpg'
    },
    'adr': {
      title: 'Alternative Dispute Resolution (ADR)',
      description: 'Mediation, arbitration, and alternative dispute resolution strategies for efficient case resolution.',
      keywords: 'arbitration, mediation, dispute resolution, ADR',
      image: 'https://kamalassociates.com.bd/images/og-adr.jpg'
    },
    'admiralty-shipping': {
      title: 'Admiralty & Shipping Law',
      description: 'Maritime law expertise covering shipping, admiralty, and international maritime disputes.',
      keywords: 'maritime law, shipping law, admiralty',
      image: 'https://kamalassociates.com.bd/images/og-admiralty-shipping.jpg'
    },
    'administrative-law': {
      title: 'Administrative Law Guidance',
      description: 'Administrative law resources covering government regulations and compliance in Bangladesh.',
      keywords: 'administrative law, government compliance, regulatory law',
      image: 'https://kamalassociates.com.bd/images/og-administrative-law.jpg'
    }
  },
  'author': {
    'mohammad-mostofa-kamal': {
      title: 'Articles by Adv. Mohammad Mostofa Kamal',
      description: 'Legal insights and case analysis from Senior Partner Adv. Mohammad Mostofa Kamal at Kamal & Associates.',
      image: 'https://kamalassociates.com.bd/images/og-author-kamal.jpg'
    },
    'mohammad-kabir': {
      title: 'Articles by Adv. Mohammad Kabir',
      description: 'Expert legal analysis from Adv. Mohammad Kabir covering commercial and banking law.',
      image: 'https://kamalassociates.com.bd/images/og-author-kabir.jpg'
    },
    'mustafa-kamal-chowdhury': {
      title: 'Articles by Adv. Mustafa Kamal Chowdhury',
      description: 'Legal guidance on civil litigation and administrative law from Adv. Mustafa Kamal Chowdhury.',
      image: 'https://kamalassociates.com.bd/images/og-author-chowdhury.jpg'
    },
    'nasrin-akter': {
      title: 'Articles by Adv. Nasrin Akter',
      description: 'Insights on maritime and shipping law from Adv. Nasrin Akter at Kamal & Associates.',
      image: 'https://kamalassociates.com.bd/images/og-author-nasrin.jpg'
    },
    'harun-rayhan': {
      title: 'Articles by Adv. Harun Rayhan',
      description: 'ADR and dispute resolution expertise from Adv. Harun Rayhan.',
      image: 'https://kamalassociates.com.bd/images/og-author-harun.jpg'
    }
  },
  'archive': {
    '2026': {
      title: '2026 Blog Archives | Kamal & Associates',
      description: 'All legal articles published in 2026 by Kamal & Associates.',
      image: 'https://kamalassociates.com.bd/images/og-blog-archive.jpg',
      type: 'website'
    },
    '2026-01': {
      title: 'January 2026 Blog Archives',
      description: 'Legal articles from January 2026 covering corporate law, litigation, and maritime law.',
      image: 'https://kamalassociates.com.bd/images/og-blog-archive.jpg',
      type: 'website'
    }
  }
};

function generateCanonicalUrl(filePath) {
  // Extract just the blog path from the full file path
  // filePath needs to be converted from absolute to a blog-relative path
  const normalizedPath = filePath.replace(/\\/g, '/');
  const blogIndex = normalizedPath.indexOf('/blog/');
  const relativePath = blogIndex !== -1 ? normalizedPath.substring(blogIndex + 1) : 'blog/' + filePath;
  return `${baseUrl}/${relativePath}`;
}

function generateOgMetaTags(metadata) {
  const tags = [
    `    <meta property="og:title" content="${escapeHtml(metadata.title)}">`,
    `    <meta property="og:description" content="${escapeHtml(metadata.description)}">`,
    `    <meta property="og:image" content="${metadata.image}">`,
    `    <meta property="og:type" content="${metadata.type || 'website'}">`,
    `    <meta property="og:url" content="${metadata.canonical}">`
  ];
  return tags.join('\n');
}

function generateTwitterCardTags(metadata) {
  const tags = [
    `    <meta name="twitter:card" content="summary_large_image">`,
    `    <meta name="twitter:title" content="${escapeHtml(metadata.title)}">`,
    `    <meta name="twitter:description" content="${escapeHtml(metadata.description)}">`,
    `    <meta name="twitter:image" content="${metadata.image}">`
  ];
  return tags.join('\n');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

async function injectMetadata(filePath, metadata) {
  let content = await readFile(filePath, 'utf8');

  // Remove ALL existing SEO/OG metadata blocks (including duplicates)
  content = content.replace(/\s*<!-- SEO Meta Tags -->[\s\S]*?(?=<\/head>)/g, '');
  content = content.replace(/\s*<!-- Open Graph Tags -->[\s\S]*?(?=<!-- Twitter Card|<!-- Canonical|<\/head>)/g, '');
  content = content.replace(/\s*<!-- Twitter Card -->[\s\S]*?(?=<!-- Canonical|<\/head>)/g, '');
  content = content.replace(/\s*<!-- Canonical URL -->[\s\S]*?(?=<\/head>)/g, '');

  // Clean up any leftover orphan meta tags that may have been left
  content = content.replace(/<meta property="og:.*?>/g, '');
  content = content.replace(/<meta name="twitter:.*?>/g, '');
  content = content.replace(/<link rel="canonical".*?>/g, '');

  // Also ensure we don't have duplicate titles/descriptions in head
  const titleMatches = content.match(/<title>.*?<\/title>/g);
  if (titleMatches && titleMatches.length > 1) {
    // Keep only the first title
    let titleRemoved = false;
    content = content.replace(/<title>.*?<\/title>/g, (match) => {
      if (!titleRemoved) {
        titleRemoved = true;
        return match;
      }
      return '';
    });
  }

  // Create new metadata section
  const canonical = generateCanonicalUrl(filePath);
  metadata.canonical = canonical;

  const title = `    <title>${escapeHtml(metadata.title)}</title>`;
  const description = `    <meta name="description" content="${escapeHtml(metadata.description)}">`;
  const keywords = metadata.keywords ? `    <meta name="keywords" content="${escapeHtml(metadata.keywords)}">` : '';
  const ogTags = generateOgMetaTags(metadata);
  const twitterTags = generateTwitterCardTags(metadata);
  const canonical_ = `    <!-- Canonical URL -->\n    <link rel="canonical" href="${canonical}">`;

  // Find </head> and inject before it
  const headIndex = content.indexOf('</head>');
  if (headIndex !== -1) {
    const injection = [
      '',
      '    <!-- SEO Meta Tags -->',
      title,
      description,
      keywords,
      '',
      '    <!-- Open Graph Tags -->',
      ogTags,
      '',
      '    <!-- Twitter Card -->',
      twitterTags,
      '',
      canonical_
    ].filter(Boolean).join('\n');

    content = content.slice(0, headIndex) + injection + '\n    ' + content.slice(headIndex);
  }

  await writeFile(filePath, content, 'utf8');
}

async function processArchivePages() {
  // Process search.html
  const searchPath = join(blogDir, 'search.html');
  try {
    await injectMetadata(searchPath, archiveMetadata['search.html']);
    console.log('✓ Injected metadata into search.html');
  } catch (error) {
    console.warn(`⚠ Could not process search.html: ${error.message}`);
  }

  // Process category pages
  const categoryDir = join(blogDir, 'category');
  try {
    const categoryFiles = await readdir(categoryDir);
    for (const file of categoryFiles) {
      const slug = file.replace('.html', '');
      if (archiveMetadata.category[slug]) {
        const filePath = join(categoryDir, file);
        await injectMetadata(filePath, archiveMetadata.category[slug]);
        console.log(`✓ Injected metadata into category/${file}`);
      }
    }
  } catch (error) {
    console.warn(`⚠ Could not process category pages: ${error.message}`);
  }

  // Process author pages
  const authorDir = join(blogDir, 'author');
  try {
    const authorFiles = await readdir(authorDir);
    for (const file of authorFiles) {
      const slug = file.replace('.html', '');
      if (archiveMetadata.author[slug]) {
        const filePath = join(authorDir, file);
        await injectMetadata(filePath, archiveMetadata.author[slug]);
        console.log(`✓ Injected metadata into author/${file}`);
      }
    }
  } catch (error) {
    console.warn(`⚠ Could not process author pages: ${error.message}`);
  }

  // Process archive pages
  const archiveDir = join(blogDir, 'archive');
  try {
    const archiveEntries = await readdir(archiveDir, { withFileTypes: true });
    for (const entry of archiveEntries) {
      if (entry.isDirectory()) {
        // Year directory with month files
        const subdirPath = join(archiveDir, entry.name);
        const monthFiles = await readdir(subdirPath, { withFileTypes: true });
        for (const monthFile of monthFiles.filter(f => f.isFile() && f.name.endsWith('.html'))) {
          const key = `${entry.name}-${monthFile.name.replace('.html', '')}`;
          if (archiveMetadata.archive[key]) {
            const filePath = join(subdirPath, monthFile.name);
            await injectMetadata(filePath, archiveMetadata.archive[key]);
            console.log(`✓ Injected metadata into archive/${entry.name}/${monthFile.name}`);
          }
        }
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        // Year-level file
        const yearKey = entry.name.replace('.html', '');
        if (archiveMetadata.archive[yearKey]) {
          const filePath = join(archiveDir, entry.name);
          await injectMetadata(filePath, archiveMetadata.archive[yearKey]);
          console.log(`✓ Injected metadata into archive/${entry.name}`);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠ Could not process archive pages: ${error.message}`);
  }
}

async function run() {
  console.log('Injecting OG metadata into archive pages...');
  await processArchivePages();
  console.log('\nOG metadata injection complete!');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
