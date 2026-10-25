import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE_URL,
  DEFAULT_IMAGE,
  ROUTE_META,
  ROUTE_PATH,
  SITE_NAME,
} from '../src/constants/route-meta.ts';
import { loadProjectEnv } from './project-env.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const { env, dataDir, assetsDir } = loadProjectEnv('production', projectRoot);
const indexHtmlPath = path.join(distDir, 'index.html');

const rawAssetsBase = env.VITE_ASSETS_BASE ?? '';
const assetsBase = rawAssetsBase
  ? new URL(
      rawAssetsBase.endsWith('/') ? rawAssetsBase : `${rawAssetsBase}/`,
      `${BASE_URL}/`,
    ).href
  : null;

const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };
const NOINDEX_PATHS = [ROUTE_PATH.account, ROUTE_PATH.moderation];

const DEFAULT_SOCIAL_IMAGE = {
  url: DEFAULT_IMAGE,
  alt: 'Dragon Traveler Wiki banner',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  cardType: 'summary_large_image',
};

export const LEGACY_ROUTE_ALIASES = new Map([
  ['/useful-links', '/toolbox/useful-links'],
  ...ROUTE_META.filter(({ pattern }) => pattern.startsWith('/toolbox/')).map(
    ({ pattern }) => [pattern.replace('/toolbox/', '/guides/'), pattern],
  ),
]);

export function normalizeTypeKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function humanizeKey(value) {
  return String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeQualityKey(quality) {
  return String(quality ?? '')
    .toLowerCase()
    .replace('+', '_plus');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toEntitySlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-\s]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function cleanGameText(value) {
  return String(value ?? '')
    .replace(/\{([^{}]+)\}/g, (_, key) => humanizeKey(key))
    .replace(/\[([^\[\]]+)\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value, maxLength = 200) {
  const text = cleanGameText(value);
  return text.length <= maxLength
    ? text
    : `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function readJsonArray(fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!existsSync(filePath)) return [];

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readAssetManifestPaths() {
  const manifestPath = path.join(assetsDir, 'manifest.json');
  if (!existsSync(manifestPath)) return new Set();

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return new Set(Object.keys(manifest.assets ?? {}));
}

const assetManifestPaths = readAssetManifestPaths();

export function hasAsset(
  relativePath,
  manifestPaths = assetManifestPaths,
  assetRoot = assetsDir,
) {
  const normalizedPath = relativePath.replaceAll(path.sep, '/');
  return (
    manifestPaths.has(normalizedPath) ||
    existsSync(path.join(assetRoot, relativePath))
  );
}

function getAssetImage(relativePath, options) {
  if (!assetsBase || !relativePath) return null;
  if (!hasAsset(relativePath)) return null;

  return {
    url: new URL(relativePath.replaceAll(path.sep, '/'), assetsBase).href,
    type: 'image/png',
    ...options,
  };
}

function getFirstAvailableAssetImage(candidates) {
  for (const [relativePath, options] of candidates) {
    const image = getAssetImage(relativePath, options);
    if (image) return image;
  }
  return null;
}

function upsertMeta(html, attr, key, value) {
  const pattern = new RegExp(
    `<meta\\s+${attr}=["']${escapeRegExp(key)}["']\\s+content=["'][^"']*["']\\s*\\/?>`,
    'i',
  );
  const replacement = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;

  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(/<\/head>/i, `    ${replacement}\n  </head>`);
}

function removeMeta(html, attr, key) {
  const pattern = new RegExp(
    `\\s*<meta\\s+${attr}=["']${escapeRegExp(key)}["']\\s+content=["'][^"']*["']\\s*\\/?>`,
    'i',
  );
  return html.replace(pattern, '');
}

function upsertCanonical(html, href) {
  const pattern = /\s*<link\s+rel=["']canonical["'][^>]*>/i;
  if (!href) return html.replace(pattern, '');

  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, (match) => match.replace(/<link[^>]*>/, tag));
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

export function buildFallbackBody(meta, links = [], separator = ' › ') {
  const nav = links.length
    ? `<nav>${links
        .map(
          ({ title, url }) =>
            `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`,
        )
        .join(separator)}</nav>`
    : '';
  return `<main><h1>${escapeHtml(meta.title)}</h1><p>${escapeHtml(meta.description)}</p>${nav}</main>`;
}

function buildJsonLdScript(data) {
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data });
  return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</script>`;
}

export function buildBreadcrumbJsonLd(items) {
  return buildJsonLdScript({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ title, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: title,
      item: url,
    })),
  });
}

export function buildHomeHtml(
  indexHtml,
  siteName,
  baseUrl,
  description,
  links,
) {
  const body = buildFallbackBody(
    { title: siteName, description },
    links,
    ' · ',
  );
  const jsonLd = buildJsonLdScript({
    '@type': 'WebSite',
    name: siteName,
    url: `${baseUrl}/`,
  });
  return indexHtml
    .replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`)
    .replace(/<\/head>/i, `    ${jsonLd}\n  </head>`);
}

export function buildSitemapXml(paths, baseUrl) {
  const urls = paths
    .map((routePath) => {
      const loc = escapeHtml(
        routePath === '/' ? `${baseUrl}/` : `${baseUrl}${routePath}`,
      );
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobotsTxt(disallowedPaths, baseUrl) {
  return [
    'User-agent: *',
    ...disallowedPaths.map((routePath) => `Disallow: ${routePath}`),
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

export function getParentRoute(pattern, routes = ROUTE_META) {
  const route = routes.find((entry) => entry.pattern === pattern);
  if (route?.navigationParent) {
    const parent = routes.find(({ id }) => id === route.navigationParent);
    if (parent) return { title: parent.meta.title, path: parent.pattern };
  }

  const sectionPath = `/${pattern.split('/')[1] ?? ''}`;
  if (sectionPath === pattern || sectionPath === '/') return null;
  const section = routes.find((entry) => entry.pattern === sectionPath);
  return section ? { title: section.meta.title, path: section.pattern } : null;
}

function writeHtmlForPath(routePath, html) {
  const normalized = routePath.replace(/^\//, '');
  const flatPath = path.join(distDir, `${normalized}.html`);
  const nestedDir = path.join(distDir, normalized);

  mkdirSync(path.dirname(flatPath), { recursive: true });
  mkdirSync(nestedDir, { recursive: true });
  writeFileSync(flatPath, html, 'utf-8');
  writeFileSync(path.join(nestedDir, 'index.html'), html, 'utf-8');
}

export function buildRouteHtml(
  indexHtml,
  routePath,
  meta,
  siteName,
  baseUrl,
  image = DEFAULT_SOCIAL_IMAGE,
  { canonicalPath = routePath, parent = null } = {},
) {
  const pageTitle =
    meta.title === siteName ? siteName : `${meta.title} | ${siteName}`;
  const pageUrl = `${baseUrl}${canonicalPath ?? routePath}`;
  const breadcrumbs = [
    { title: siteName, url: `${baseUrl}/` },
    ...(parent
      ? [{ title: parent.title, url: `${baseUrl}${parent.path}` }]
      : []),
  ];

  let html = indexHtml.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(pageTitle)}</title>`,
  );
  html = upsertCanonical(html, canonicalPath ? pageUrl : null);
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${buildFallbackBody(meta, breadcrumbs)}</div>`,
  );
  if (canonicalPath) {
    html = html.replace(
      /<\/head>/i,
      `    ${buildBreadcrumbJsonLd([...breadcrumbs, { title: meta.title, url: pageUrl }])}\n  </head>`,
    );
  }
  html = upsertMeta(html, 'name', 'description', meta.description);
  html = upsertMeta(html, 'property', 'og:title', pageTitle);
  html = upsertMeta(html, 'property', 'og:description', meta.description);
  html = upsertMeta(html, 'property', 'og:url', pageUrl);
  html = upsertMeta(html, 'property', 'og:type', 'website');
  html = upsertMeta(html, 'property', 'og:site_name', siteName);
  html = upsertMeta(html, 'name', 'twitter:title', pageTitle);
  html = upsertMeta(html, 'name', 'twitter:description', meta.description);

  if (!image) {
    for (const key of [
      'og:image',
      'og:image:secure_url',
      'og:image:width',
      'og:image:height',
      'og:image:type',
      'og:image:alt',
    ]) {
      html = removeMeta(html, 'property', key);
    }
    html = removeMeta(html, 'name', 'twitter:image');
    html = removeMeta(html, 'name', 'twitter:image:alt');
    return upsertMeta(html, 'name', 'twitter:card', 'summary');
  }

  html = upsertMeta(html, 'property', 'og:image', image.url);
  if (image.url.startsWith('https://')) {
    html = upsertMeta(html, 'property', 'og:image:secure_url', image.url);
  } else {
    html = removeMeta(html, 'property', 'og:image:secure_url');
  }
  if (image.width && image.height) {
    html = upsertMeta(html, 'property', 'og:image:width', String(image.width));
    html = upsertMeta(
      html,
      'property',
      'og:image:height',
      String(image.height),
    );
  } else {
    html = removeMeta(html, 'property', 'og:image:width');
    html = removeMeta(html, 'property', 'og:image:height');
  }
  html = upsertMeta(html, 'property', 'og:image:type', image.type);
  html = upsertMeta(html, 'property', 'og:image:alt', image.alt);
  html = upsertMeta(html, 'name', 'twitter:image', image.url);
  html = upsertMeta(html, 'name', 'twitter:image:alt', image.alt);
  return upsertMeta(html, 'name', 'twitter:card', image.cardType);
}

function makeSquareImage(relativePath, alt) {
  return getAssetImage(relativePath, {
    alt,
    cardType: 'summary',
  });
}

function makeSocialImageCandidate(relativeDir, alt) {
  return [
    `${relativeDir}/social.jpg`,
    {
      alt,
      ...SOCIAL_IMAGE_SIZE,
      type: 'image/jpeg',
      cardType: 'summary_large_image',
    },
  ];
}

function makeCharacterImage(item) {
  const assetSlugs = [
    ...new Set([item.slug, item.legacy_slug].filter(Boolean)),
  ];
  const sceneOptions = {
    alt: `${item.name} default scene illustration`,
    cardType: 'summary_large_image',
  };
  const portraitOptions = {
    alt: `${item.name} portrait`,
    cardType: 'summary',
  };
  return getFirstAvailableAssetImage([
    ...assetSlugs.map((slug) =>
      makeSocialImageCandidate(
        `character/${slug}/skins/default`,
        sceneOptions.alt,
      ),
    ),
    ...assetSlugs.map((slug) => [
      `character/${slug}/skins/default/scene.png`,
      sceneOptions,
    ]),
    ...assetSlugs.map((slug) => [
      `character/${slug}/skins/default/portrait.png`,
      portraitOptions,
    ]),
  ]);
}

function makeWyrmImage(item) {
  const base = `wyrm/${item.slug}`;
  return getFirstAvailableAssetImage([
    makeSocialImageCandidate(base, `${item.name} illustration`),
    [
      `${base}/illustration.png`,
      {
        alt: `${item.name} illustration`,
        width: 2048,
        height: 1024,
        cardType: 'summary_large_image',
      },
    ],
    [
      `${base}/portrait.png`,
      {
        alt: `${item.name} portrait`,
        cardType: 'summary',
      },
    ],
  ]);
}

export function findFirstAvailableHowlkinMember(
  memberSlugs,
  qualityBySlug,
  imageExists,
) {
  return (memberSlugs ?? []).find((slug) => {
    const quality = qualityBySlug.get(slug);
    return quality && imageExists(`howlkin/${quality}/${slug}.png`);
  });
}

export function getOracleScrollReference(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    typeof value.name !== 'string' ||
    typeof value.slug !== 'string'
  ) {
    return null;
  }

  return {
    name: value.name,
    slug: value.slug,
  };
}

export function writeRoutePages() {
  if (!existsSync(indexHtmlPath)) {
    throw new Error(
      'dist/index.html not found. Run vite build before generating route pages.',
    );
  }

  const indexHtml = readFileSync(indexHtmlPath, 'utf-8');
  const routeMetaByPattern = new Map(
    ROUTE_META.map((route) => [route.pattern, route.meta]),
  );
  const writtenPaths = new Set();
  const sitemapPaths = ['/'];
  const writePage = (
    routePath,
    meta,
    image = null,
    { pattern = routePath, canonicalPath = routePath } = {},
  ) => {
    if (!routePath || routePath === '/' || writtenPaths.has(routePath)) return;
    writeHtmlForPath(
      routePath,
      buildRouteHtml(indexHtml, routePath, meta, SITE_NAME, BASE_URL, image, {
        canonicalPath,
        parent: getParentRoute(pattern),
      }),
    );
    writtenPaths.add(routePath);
    if (canonicalPath === routePath && !NOINDEX_PATHS.includes(routePath)) {
      sitemapPaths.push(routePath);
    }
  };

  for (const route of ROUTE_META) {
    if (
      route.pattern !== '/' &&
      route.pattern !== '*' &&
      !route.pattern.includes(':')
    ) {
      writePage(route.pattern, route.meta);
    }
  }

  for (const [aliasPath, targetPath] of LEGACY_ROUTE_ALIASES) {
    const targetMeta = routeMetaByPattern.get(targetPath);
    if (targetMeta) {
      writePage(aliasPath, targetMeta, null, {
        pattern: targetPath,
        canonicalPath: targetPath,
      });
    }
  }

  const characterItems = readJsonArray('enUS/characters.json');
  const charSlugToName = new Map();
  for (const character of characterItems) {
    if (character.slug) charSlugToName.set(character.slug, character.name);
    if (character.legacy_slug) {
      charSlugToName.set(character.legacy_slug, character.name);
    }
  }
  const howlkinItems = readJsonArray('enUS/howlkins.json');
  const howlkinQualityMap = new Map(
    howlkinItems
      .filter((item) => item.slug && item.quality)
      .map((item) => [item.slug, normalizeQualityKey(item.quality)]),
  );
  const howlkinNameMap = new Map(
    howlkinItems
      .filter((item) => item.slug)
      .map((item) => [item.slug, item.name]),
  );

  const dynamicRouteConfigs = [
    {
      pattern: ROUTE_PATH.characterDetail,
      file: 'enUS/characters.json',
      getImage: makeCharacterImage,
      getDescription: (item, fallback) =>
        truncateText(
          item.summary ||
            `${item.name}, ${item.title ?? item.quality}. ${fallback}`,
        ),
    },
    {
      pattern: ROUTE_PATH.artifactDetail,
      file: 'enUS/artifacts.json',
      getImage: (item) =>
        makeSquareImage(
          `artifacts/${item.slug}/artifact.png`,
          `${item.name} artifact`,
        ),
      getDescription: (item, fallback) =>
        truncateText(
          `${item.quality ? `${item.quality} artifact. ` : ''}${item.lore || fallback}`,
        ),
    },
    {
      pattern: ROUTE_PATH.noblePhantasmDetail,
      file: 'enUS/noble-phantasm.json',
      getImage: (item) =>
        makeSquareImage(
          `noble_phantasm/${item.slug}.png`,
          `${item.name} Noble Phantasm`,
        ),
      getDescription: (item, fallback) => {
        const owner = charSlugToName.get(item.character_slug);
        const effect =
          item.effects?.[0]?.description ?? item.skills?.[0]?.description;
        return truncateText(
          `${owner ? `${owner}'s Noble Phantasm. ` : 'Noble Phantasm. '}${effect || fallback}`,
        );
      },
    },
    {
      pattern: ROUTE_PATH.gearSetDetail,
      file: 'enUS/gear-sets.json',
      getDescription: (item, fallback) =>
        truncateText(
          item.set_bonus?.description
            ? `${item.set_bonus.quantity}-piece bonus: ${item.set_bonus.description}`
            : fallback,
        ),
    },
    {
      pattern: ROUTE_PATH.wyrmDetail,
      file: 'enUS/wyrms.json',
      getImage: makeWyrmImage,
      getDescription: (item, fallback) =>
        truncateText(
          `${item.quality ?? ''} ${item.phase ?? ''} ${humanizeKey(item.faction)} Wyrm. ${item.description || fallback}`,
        ),
    },
    {
      pattern: ROUTE_PATH.wyrmspellDetail,
      file: 'enUS/wyrmspells.json',
      getImage: (item) =>
        makeSquareImage(
          `wyrmspell/${normalizeTypeKey(item.type)}/${item.slug}.png`,
          `${item.name} Wyrmspell`,
        ),
      getDescription: (item, fallback) => {
        const maxEffect = item.qualities?.at(-1)?.effect;
        return truncateText(
          `${item.type ? `${item.type} Wyrmspell. ` : ''}${maxEffect || fallback}`,
        );
      },
    },
    {
      pattern: ROUTE_PATH.howlkinDetail,
      file: 'enUS/golden-alliances.json',
      getImage: (item) => {
        const memberSlug = findFirstAvailableHowlkinMember(
          item.howlkins,
          howlkinQualityMap,
          hasAsset,
        );
        const quality = howlkinQualityMap.get(memberSlug);
        return memberSlug && quality
          ? makeSquareImage(
              `howlkin/${quality}/${memberSlug}.png`,
              `${howlkinNameMap.get(memberSlug) ?? item.name} Howlkin`,
            )
          : null;
      },
      getDescription: (item, fallback) => {
        const members = (item.howlkins ?? [])
          .slice(0, 4)
          .map((slug) => howlkinNameMap.get(slug) ?? slug)
          .join(', ');
        const remainder = Math.max(0, (item.howlkins?.length ?? 0) - 4);
        return truncateText(
          members
            ? `Golden Alliance members: ${members}${remainder ? `, and ${remainder} more` : ''}.`
            : fallback,
        );
      },
    },
  ];

  for (const config of dynamicRouteConfigs) {
    const fallbackMeta = routeMetaByPattern.get(config.pattern);
    if (!fallbackMeta) continue;

    for (const item of readJsonArray(config.file)) {
      const slug = item.slug ?? toEntitySlug(item.name);
      if (!slug) continue;
      const meta = {
        title: String(item.name ?? fallbackMeta.title),
        description: config.getDescription(item, fallbackMeta.description),
      };
      const image = config.getImage?.(item) ?? null;
      const routePath = config.pattern.replace(/:[^/]+$/, slug);
      writePage(routePath, meta, image, { pattern: config.pattern });
      if (item.legacy_slug && item.legacy_slug !== slug) {
        writePage(
          config.pattern.replace(/:[^/]+$/, item.legacy_slug),
          meta,
          image,
          { pattern: config.pattern, canonicalPath: routePath },
        );
      }
    }
  }

  const oracleMeta = routeMetaByPattern.get(ROUTE_PATH.oracleScrollDetail);
  if (oracleMeta) {
    const scrollsSeen = new Set();
    for (const item of readJsonArray('enUS/relic.json')) {
      const scroll = getOracleScrollReference(item.oracle_scroll);
      if (!scroll || scrollsSeen.has(scroll.slug)) continue;
      scrollsSeen.add(scroll.slug);
      writePage(
        `/oracle-scrolls/${scroll.slug}`,
        {
          title: scroll.name,
          description: truncateText(
            `${scroll.name} Oracle Scroll. ${oracleMeta.description}`,
          ),
        },
        null,
        { pattern: ROUTE_PATH.oracleScrollDetail },
      );
    }
  }

  const fallbackMeta = routeMetaByPattern.get('*') ?? {
    title: 'Page Not Found',
    description: 'The requested page could not be found.',
  };
  writeFileSync(
    path.join(distDir, '404.html'),
    buildRouteHtml(
      indexHtml,
      '/404',
      fallbackMeta,
      SITE_NAME,
      BASE_URL,
      DEFAULT_SOCIAL_IMAGE,
      { canonicalPath: null },
    ),
    'utf-8',
  );

  const homeMeta = routeMetaByPattern.get(ROUTE_PATH.home);
  const sectionLinks = ROUTE_META.filter(
    ({ pattern }) =>
      /^\/[^/:*]+$/.test(pattern) && !NOINDEX_PATHS.includes(pattern),
  ).map(({ meta, pattern }) => ({
    title: meta.title,
    url: `${BASE_URL}${pattern}`,
  }));
  writeFileSync(
    indexHtmlPath,
    buildHomeHtml(
      indexHtml,
      SITE_NAME,
      BASE_URL,
      homeMeta.description,
      sectionLinks,
    ),
    'utf-8',
  );
  writeFileSync(
    path.join(distDir, 'sitemap.xml'),
    buildSitemapXml(sitemapPaths, BASE_URL),
    'utf-8',
  );
  writeFileSync(
    path.join(distDir, 'robots.txt'),
    buildRobotsTxt(NOINDEX_PATHS, BASE_URL),
    'utf-8',
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  writeRoutePages();
}
