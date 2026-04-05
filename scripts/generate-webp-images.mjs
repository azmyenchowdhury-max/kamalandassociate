import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, 'images');
const BLOG_DIR = join(ROOT, 'blog');

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function isRaster(path) {
  const ext = extname(path).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
}

async function convertLocalImages() {
  const files = await walk(IMAGES_DIR);
  let converted = 0;

  for (const file of files) {
    if (!isRaster(file)) continue;
    const out = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    await sharp(file).webp({ quality: 80 }).toFile(out);
    converted++;
  }

  return converted;
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function extractHeroSources() {
  const entries = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.html'));
  const articleFiles = entries.filter((f) => !/^category-|^author-|blog-post-template\.html$/i.test(f));
  const out = [];

  for (const file of articleFiles) {
    const html = await readFile(join(BLOG_DIR, file), 'utf8');
    const m = html.match(/<img[^>]*class=["'][^"']*article-hero-media[^"']*["'][^>]*src=["']([^"']+)["']/i)
      || html.match(/<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*article-hero-media[^"']*["']/i);
    if (m && /^https?:\/\//i.test(m[1])) {
      out.push({ file, url: m[1] });
    }
  }

  return out;
}

async function downloadAndGenerateBlogWebp() {
  const targets = await extractHeroSources();
  const blogOutDir = join(IMAGES_DIR, 'blog');
  await mkdir(blogOutDir, { recursive: true });

  let generated = 0;

  for (const t of targets) {
    const base = t.file.replace(/\.html$/i, '');
    const webpPath = join(blogOutDir, `${base}-hero.webp`);
    try {
      const buf = await fetchBuffer(t.url);
      await sharp(buf).resize({ width: 1600 }).webp({ quality: 78 }).toFile(webpPath);
      generated++;
    } catch (error) {
      console.warn(`WARN: Could not fetch ${t.url} (${error.message})`);
    }
  }

  return { generated, total: targets.length };
}

async function updateBlogIntelligenceThumbs() {
  const path = join(ROOT, 'js', 'blog-intelligence.js');
  let src = await readFile(path, 'utf8');

  const pairs = [
    ['company-formation-guide.html', '../images/blog/company-formation-guide-thumb.webp'],
    ['commercial-litigation-complete-guide.html', '../images/blog/commercial-litigation-complete-guide-thumb.webp'],
    ['civil-litigation-complete-guide.html', '../images/blog/civil-litigation-complete-guide-thumb.webp'],
    ['business-setup-bangladesh.html', '../images/blog/business-setup-bangladesh-thumb.webp'],
    ['banking-litigation-comprehensive.html', '../images/blog/banking-litigation-comprehensive-thumb.webp'],
    ['banking-litigation-guide.html', '../images/blog/banking-litigation-guide-thumb.webp'],
    ['aviation-law-bangladesh.html', '../images/blog/aviation-law-bangladesh-thumb.webp'],
    ['adr-dispute-resolution.html', '../images/blog/adr-dispute-resolution-thumb.webp'],
    ['admiralty-shipping-law.html', '../images/blog/admiralty-shipping-law-thumb.webp'],
    ['administrative-law-bangladesh.html', '../images/blog/administrative-law-bangladesh-thumb.webp']
  ];

  for (const [slug, localThumb] of pairs) {
    const rx = new RegExp(`(slug: '${slug}'[\\s\\S]*?image: )'[^']+'`);
    src = src.replace(rx, `$1'${localThumb}'`);
  }

  await writeFile(path, src, 'utf8');
}

async function saveBlogThumbWebpFromHero() {
  const heroDir = join(IMAGES_DIR, 'blog');
  const files = await readdir(heroDir);
  let count = 0;

  for (const file of files) {
    if (!file.endsWith('-hero.webp')) continue;
    const inPath = join(heroDir, file);
    const thumbPath = join(heroDir, file.replace('-hero.webp', '-thumb.webp'));
    await sharp(inPath).resize({ width: 480, height: 320, fit: 'cover' }).webp({ quality: 76 }).toFile(thumbPath);
    count++;
  }

  return count;
}

async function main() {
  const local = await convertLocalImages();
  const remote = await downloadAndGenerateBlogWebp();
  const thumbs = await saveBlogThumbWebpFromHero();
  await updateBlogIntelligenceThumbs();

  console.log(`Local images converted to WebP: ${local}`);
  console.log(`Blog hero WebP generated: ${remote.generated}/${remote.total}`);
  console.log(`Blog thumb WebP generated: ${thumbs}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
