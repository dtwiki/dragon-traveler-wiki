import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const distDir = path.join(projectRoot, 'dist');
const expectedBuildId = process.env.EXPECTED_BUILD_ID?.trim();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function findFiles(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(entryPath, extension);
    return entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

assert(
  existsSync(distDir),
  'dist does not exist; run the production build first',
);
assert(
  readFileSync(path.join(distDir, 'CNAME'), 'utf8').trim() === 'dtwiki.org',
  'dist/CNAME does not contain the production domain',
);

const version = JSON.parse(
  readFileSync(path.join(distDir, 'version.json'), 'utf8'),
);
assert(
  typeof version.buildId === 'string' && version.buildId.length > 0,
  'dist/version.json does not contain a build ID',
);
if (expectedBuildId) {
  assert(
    version.buildId === expectedBuildId,
    `Expected build ID ${expectedBuildId}, received ${version.buildId}`,
  );
}

const manifestPath = path.join(distDir, 'assets', 'manifest.json');
assert(existsSync(manifestPath), 'The R2 asset manifest is missing');
JSON.parse(readFileSync(manifestPath, 'utf8'));

const dataDir = path.join(distDir, 'data');
assert(
  existsSync(dataDir) && statSync(dataDir).isDirectory(),
  'The production data directory is missing',
);
assert(findFiles(dataDir, '.json').length > 0, 'No production data was copied');

const sitemapPath = path.join(distDir, 'sitemap.xml');
assert(existsSync(sitemapPath), 'dist/sitemap.xml is missing');
assert(
  readFileSync(sitemapPath, 'utf8').includes('<loc>https://dtwiki.org/</loc>'),
  'dist/sitemap.xml does not list the home page',
);
assert(
  readFileSync(path.join(distDir, 'robots.txt'), 'utf8').includes(
    'Sitemap: https://dtwiki.org/sitemap.xml',
  ),
  'dist/robots.txt does not reference the sitemap',
);

const htmlFiles = findFiles(distDir, '.html');
assert(htmlFiles.length > 0, 'No HTML pages were generated');

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, 'utf8');
  const relativePath = path.relative(distDir, htmlPath);
  assert(
    !/__DT_(BUILD_ID|APP_BASE)__/.test(html),
    `${relativePath} contains an unreplaced build placeholder`,
  );
  assert(
    html.includes(JSON.stringify(version.buildId)),
    `${relativePath} does not contain the current build ID`,
  );
  assert(
    html.includes("window.addEventListener('vite:preloadError'"),
    `${relativePath} does not contain stale-build recovery`,
  );

  for (const match of html.matchAll(
    /(?:src|href)="(\/assets\/[^"?]+)[^"]*"/g,
  )) {
    const assetPath = path.join(distDir, match[1].slice(1));
    assert(
      existsSync(assetPath),
      `${relativePath} references missing build asset ${match[1]}`,
    );
  }
}

console.log(
  `Validated Pages build ${version.buildId}: ${htmlFiles.length} HTML pages`,
);
