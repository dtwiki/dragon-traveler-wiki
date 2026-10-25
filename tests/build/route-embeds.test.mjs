import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHomeHtml,
  buildRobotsTxt,
  buildRouteHtml,
  buildSitemapXml,
  cleanGameText,
  findFirstAvailableHowlkinMember,
  getOracleScrollReference,
  getParentRoute,
  hasAsset,
  normalizeTypeKey,
} from '../../scripts/generate-route-pages.mjs';

const BASE_HTML = `<!doctype html>
<html>
  <head>
    <title>Dragon Traveler Wiki</title>
    <meta name="description" content="Default description" />
    <meta property="og:title" content="Dragon Traveler Wiki" />
    <meta property="og:description" content="Default description" />
    <meta property="og:url" content="https://dtwiki.org" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Dragon Traveler Wiki" />
    <meta property="og:image" content="https://dtwiki.org/default.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Default" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Dragon Traveler Wiki" />
    <meta name="twitter:description" content="Default description" />
    <meta name="twitter:image" content="https://dtwiki.org/default.jpg" />
    <meta name="twitter:image:alt" content="Default" />
  </head>
  <body><div id="root"></div></body>
</html>`;

test('wide entity embeds do not claim dimensions that vary by asset', () => {
  const image = {
    url: 'https://dtwiki.org/assets/character/athena/scene.png',
    alt: 'Athena default scene illustration',
    type: 'image/png',
    cardType: 'summary_large_image',
  };
  const html = buildRouteHtml(
    BASE_HTML,
    '/characters/athena',
    { title: 'Athena', description: 'Frontline Guardian.' },
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    image,
  );

  assert.match(html, /<title>Athena \| Dragon Traveler Wiki<\/title>/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/dtwiki\.org\/assets\/character\/athena\/scene\.png"/,
  );
  assert.match(html, /property="og:image:secure_url"/);
  assert.doesNotMatch(html, /property="og:image:width"/);
  assert.doesNotMatch(html, /property="og:image:height"/);
  assert.match(html, /property="og:image:type" content="image\/png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(
    html,
    /name="twitter:image:alt" content="Athena default scene illustration"/,
  );
});

test('square entity embeds use summary cards without inaccurate dimensions', () => {
  const html = buildRouteHtml(
    BASE_HTML,
    '/artifacts/example',
    { title: 'Example', description: 'Example artifact.' },
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    {
      url: 'https://dtwiki.org/assets/artifacts/example/artifact.png',
      alt: 'Example artifact',
      type: 'image/png',
      cardType: 'summary',
    },
  );

  assert.match(html, /name="twitter:card" content="summary"/);
  assert.doesNotMatch(html, /property="og:image:width"/);
  assert.doesNotMatch(html, /property="og:image:height"/);
});

test('embed text and asset keys are normalized for game data', () => {
  assert.equal(normalizeTypeKey("Dragon's Call"), 'dragons_call');
  assert.equal(
    cleanGameText('Applies {stun} after [Martial Verdict].'),
    'Applies Stun after Martial Verdict.',
  );
});

test('routes without a related image omit image metadata', () => {
  const html = buildRouteHtml(
    BASE_HTML,
    '/gear',
    { title: 'Gear', description: 'Browse gear.' },
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    null,
  );

  assert.doesNotMatch(html, /property="og:image/);
  assert.doesNotMatch(html, /name="twitter:image/);
  assert.match(html, /name="twitter:card" content="summary"/);
});

test('R2-only assets are recognized through the asset manifest', () => {
  const assetPath = 'character/tamamo_no_mae_ssr_plus/skins/default/scene.png';

  assert.equal(
    hasAsset(assetPath, new Set([assetPath]), 'missing-assets'),
    true,
  );
  assert.equal(hasAsset(assetPath, new Set(), 'missing-assets'), false);
});

test('Howlkin embeds select the first member with an available icon', () => {
  const qualityBySlug = new Map([
    ['missing_member', 'sr'],
    ['available_member', 'ssr'],
  ]);

  assert.equal(
    findFirstAvailableHowlkinMember(
      ['missing_member', 'available_member'],
      qualityBySlug,
      (assetPath) => assetPath === 'howlkin/ssr/available_member.png',
    ),
    'available_member',
  );
});

test('Oracle Scroll references use their explicit name and slug', () => {
  assert.deepEqual(
    getOracleScrollReference({
      name: "Cleopatra's Leisure Time",
      slug: 'cleopatras_leisure_time',
    }),
    {
      name: "Cleopatra's Leisure Time",
      slug: 'cleopatras_leisure_time',
    },
  );
  assert.equal(getOracleScrollReference('Cleopatra'), null);
});

function getJsonLd(html) {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  return match ? JSON.parse(match[1]) : null;
}

test('route pages declare a canonical URL that og:url matches', () => {
  const html = buildRouteHtml(
    BASE_HTML,
    '/characters/old_slug',
    { title: 'Athena', description: 'Frontline Guardian.' },
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    null,
    { canonicalPath: '/characters/athena' },
  );

  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/dtwiki\.org\/characters\/athena" \/>/,
  );
  assert.match(
    html,
    /property="og:url" content="https:\/\/dtwiki\.org\/characters\/athena"/,
  );
});

test('the 404 page omits canonical and breadcrumb metadata', () => {
  const html = buildRouteHtml(
    `${BASE_HTML.replace('</head>', '<link rel="canonical" href="https://dtwiki.org/" /></head>')}`,
    '/404',
    { title: 'Page Not Found', description: 'Missing.' },
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    null,
    { canonicalPath: null },
  );

  assert.doesNotMatch(html, /rel="canonical"/);
  assert.equal(getJsonLd(html), null);
});

test('route pages include escaped fallback content and breadcrumbs', () => {
  const html = buildRouteHtml(
    BASE_HTML,
    '/characters/athena',
    { title: 'Athena <SSR>', description: 'Tank & support.' },
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    null,
    { parent: { title: 'Characters', path: '/characters' } },
  );

  assert.match(
    html,
    /<div id="root"><main><h1>Athena &lt;SSR&gt;<\/h1><p>Tank &amp; support\.<\/p><nav><a href="https:\/\/dtwiki\.org\/">Dragon Traveler Wiki<\/a> › <a href="https:\/\/dtwiki\.org\/characters">Characters<\/a><\/nav><\/main><\/div>/,
  );
  assert.doesNotMatch(html, /"name":"Athena <SSR>"/);
  assert.deepEqual(
    getJsonLd(html).itemListElement.map(({ name, item }) => [name, item]),
    [
      ['Dragon Traveler Wiki', 'https://dtwiki.org/'],
      ['Characters', 'https://dtwiki.org/characters'],
      ['Athena <SSR>', 'https://dtwiki.org/characters/athena'],
    ],
  );
});

test('the home page gets section links and WebSite structured data', () => {
  const html = buildHomeHtml(
    BASE_HTML,
    'Dragon Traveler Wiki',
    'https://dtwiki.org',
    'Your hub.',
    [{ title: 'Characters', url: 'https://dtwiki.org/characters' }],
  );

  assert.match(html, /<h1>Dragon Traveler Wiki<\/h1><p>Your hub\.<\/p>/);
  assert.match(html, /<a href="https:\/\/dtwiki\.org\/characters">/);
  assert.deepEqual(getJsonLd(html), {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dragon Traveler Wiki',
    url: 'https://dtwiki.org/',
  });
});

test('detail routes resolve their section parent', () => {
  assert.deepEqual(getParentRoute('/characters/:name'), {
    title: 'Characters',
    path: '/characters',
  });
  assert.deepEqual(getParentRoute('/gear-sets/:setName'), {
    title: 'Gear',
    path: '/gear',
  });
  assert.deepEqual(getParentRoute('/oracle-scrolls/:scrollName'), {
    title: 'Relics',
    path: '/relics',
  });
  assert.equal(getParentRoute('/characters'), null);
  assert.equal(getParentRoute('/toolbox/faq'), null);
});

test('sitemap and robots point crawlers at canonical pages', () => {
  assert.equal(
    buildSitemapXml(['/', '/characters', '/a&b'], 'https://dtwiki.org'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://dtwiki.org/</loc></url>
  <url><loc>https://dtwiki.org/characters</loc></url>
  <url><loc>https://dtwiki.org/a&amp;b</loc></url>
</urlset>
`,
  );
  assert.equal(
    buildRobotsTxt(['/account'], 'https://dtwiki.org'),
    'User-agent: *\nDisallow: /account\n\nSitemap: https://dtwiki.org/sitemap.xml\n',
  );
});
