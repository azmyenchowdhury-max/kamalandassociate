import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE_URL = 'https://kamalassociates.com.bd';
const ROOT = process.cwd();

const SKIP_ROOT = new Set([
  'index.html',
  '404.html'
]);

const BLOG_SKIP = new Set([
  'blog-post-template.html'
]);

async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.html'))
    .map((e) => e.name);
}

function urlFor(pathname) {
  return `${SITE_URL}/${pathname.replace(/\\/g, '/')}`;
}

async function getLastMod(filePath) {
  const content = await readFile(filePath, 'utf8');
  const m = content.match(/<meta\s+name=["']publish_date["']\s+content=["']([^"']+)["']/i);
  if (m) return m[1];
  return new Date().toISOString().slice(0, 10);
}

async function build() {
  const rootHtml = (await listHtml(ROOT)).filter((f) => !SKIP_ROOT.has(f));
  const blogDir = join(ROOT, 'blog');
  const blogHtml = (await listHtml(blogDir)).filter((f) => !BLOG_SKIP.has(f));

  const urls = [];

  for (const file of rootHtml) {
    const abs = join(ROOT, file);
    urls.push({
      loc: urlFor(file),
      lastmod: await getLastMod(abs),
      changefreq: file === 'blog.html' ? 'daily' : 'monthly',
      priority: file === 'blog.html' ? '0.9' : '0.8'
    });
  }

  for (const file of blogHtml) {
    const abs = join(blogDir, file);
    const isArticle = /(guide|litigation|law|resolution|formation|setup)/i.test(file) && !/^category-|^author-/i.test(file);
    urls.push({
      loc: urlFor(`blog/${file}`),
      lastmod: await getLastMod(abs),
      changefreq: isArticle ? 'monthly' : 'weekly',
      priority: isArticle ? '0.85' : '0.7'
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => [
      '  <url>',
      `    <loc>${u.loc}</loc>`,
      `    <lastmod>${u.lastmod}</lastmod>`,
      `    <changefreq>${u.changefreq}</changefreq>`,
      `    <priority>${u.priority}</priority>`,
      '  </url>'
    ].join('\n')),
    '</urlset>',
    ''
  ].join('\n');

  await writeFile(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8');
  await writeFile(join(ROOT, 'sitemap.xml'), xml, 'utf8');

  console.log(`Generated sitemap with ${urls.length} URLs.`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
