import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'blog');

const requiredMeta = [
  'description',
  'keywords',
  'author',
  'twitter:card'
];

const requiredOg = [
  'og:title',
  'og:description',
  'og:image',
  'og:type',
  'og:url'
];

const requiredIncludes = [
  '../js/blog-seo-performance.js'
];

function hasMetaByName(html, name) {
  const rx = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["'][^"']+["'][^>]*>`, 'i');
  return rx.test(html);
}

function hasMetaByProperty(html, property) {
  const rx = new RegExp(`<meta\\s+[^>]*property=["']${property}["'][^>]*content=["'][^"']+["'][^>]*>`, 'i');
  return rx.test(html);
}

function hasCanonical(html) {
  return /<link\s+[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["'][^>]*>/i.test(html);
}

function hasJsonLdArticle(html) {
  return /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*"@type"\s*:\s*"Article"[\s\S]*<\/script>/i.test(html);
}

function headingCheck(html) {
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  return h1Count === 1;
}

async function main() {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.html'));
  const target = files.filter((f) => !/^category-|^author-|blog-post-template\.html$|search\.html$/i.test(f));

  const issues = [];

  for (const file of target) {
    const full = join(BLOG_DIR, file);
    const html = await readFile(full, 'utf8');

    for (const m of requiredMeta) {
      if (!hasMetaByName(html, m)) issues.push(`${file}: missing meta name=${m}`);
    }

    for (const p of requiredOg) {
      if (!hasMetaByProperty(html, p)) issues.push(`${file}: missing meta property=${p}`);
    }

    if (!hasCanonical(html)) issues.push(`${file}: missing canonical`);
    if (!hasJsonLdArticle(html)) issues.push(`${file}: missing JSON-LD Article`);
    if (!headingCheck(html)) issues.push(`${file}: expected exactly one H1`);

    for (const include of requiredIncludes) {
      if (!html.includes(include)) issues.push(`${file}: missing include ${include}`);
    }
  }

  if (issues.length) {
    console.error('SEO/Schema quality gate failed:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`SEO/Schema quality gate passed for ${target.length} blog pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
