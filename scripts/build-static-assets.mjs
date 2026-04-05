import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'assets');

async function run() {
  await mkdir(outDir, { recursive: true });

  // Minify and combine key blog JS into one delivery file.
  const jsFiles = [
    join(root, 'js', 'blog-intelligence.js'),
    join(root, 'js', 'blog-social-actions.js'),
    join(root, 'js', 'blog-lead-gen.js'),
    join(root, 'js', 'blog-seo-performance.js')
  ];

  const jsSources = await Promise.all(jsFiles.map((path) => readFile(path, 'utf8')));
  const jsCombinedSource = jsSources.join('\n;\n');

  await build({
    stdin: {
      contents: jsCombinedSource,
      resolveDir: root,
      loader: 'js',
      sourcefile: 'blog-combined.js'
    },
    outfile: join(outDir, 'blog-combined.min.js'),
    format: 'iife',
    minify: true,
    target: ['es2018'],
    legalComments: 'none'
  });

  // Minify and combine Phase 7 discovery scripts for archive/search pages
  const discoveryJsFiles = [
    join(root, 'js', 'blog-catalog.js'),
    join(root, 'js', 'blog-management.js')
  ];

  const discoveryJsSources = await Promise.all(discoveryJsFiles.map((path) => readFile(path, 'utf8')));
  const discoveryJsCombinedSource = discoveryJsSources.join('\n;\n');

  await build({
    stdin: {
      contents: discoveryJsCombinedSource,
      resolveDir: root,
      loader: 'js',
      sourcefile: 'blog-discovery-bundle.js'
    },
    outfile: join(outDir, 'blog-discovery-bundle.min.js'),
    format: 'iife',
    minify: true,
    target: ['es2018'],
    legalComments: 'none'
  });

  // Minify primary stylesheet.
  const cssPath = join(root, 'css', 'style.css');
  const cssRaw = await readFile(cssPath, 'utf8');
  const cssMin = await transform(cssRaw, {
    loader: 'css',
    minify: true,
    sourcemap: false
  });

  const outputCss = cssMin.code;
  await writeFile(join(outDir, 'style.min.css'), outputCss, 'utf8');

  console.log('Built static assets:');
  console.log('- public/assets/blog-combined.min.js (article scripts)');
  console.log('- public/assets/blog-discovery-bundle.min.js (Phase 7 discovery scripts)');
  console.log('- public/assets/style.min.css');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
