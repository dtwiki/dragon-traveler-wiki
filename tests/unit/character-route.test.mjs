import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCharacterByIdentityMap,
  buildPreferredCharacterByNameMap,
  getCharacterBaseSlug,
  getCharacterByReferenceKey,
  getCharacterIdentityKey,
  getCharacterRoutePath,
  resolveCharacterByNameAndQuality,
  resolveCharacterReferenceKey,
  resolveCharacterRoute,
} from '../../src/features/characters/utils/character-route.ts';

function makeCharacter(overrides = {}) {
  return {
    slug: 'athena_ssr',
    legacy_slug: null,
    name: 'Athena',
    quality: 'SSR',
    character_class: 'mage',
    factions: [],
    is_global: true,
    subclasses: [],
    skills: [],
    recommended_noble_phantasm: [],
    skins: [],
    last_updated: 0,
    ...overrides,
  };
}

test('getCharacterIdentityKey and getCharacterBaseSlug read from the character slug', () => {
  const character = makeCharacter();
  assert.equal(getCharacterIdentityKey(character), 'athena_ssr');
  assert.equal(getCharacterBaseSlug(character), 'athena_ssr');
  assert.equal(getCharacterBaseSlug('Athena'), 'athena');
  assert.equal(getCharacterRoutePath(character), '/characters/athena_ssr');
});

test('buildCharacterByIdentityMap indexes by slug and legacy slug', () => {
  const character = makeCharacter({ legacy_slug: 'old_athena' });
  const map = buildCharacterByIdentityMap([character]);
  assert.equal(map.get('athena_ssr'), character);
  assert.equal(map.get('old_athena'), character);
});

test('buildPreferredCharacterByNameMap prefers the higher-rarity variant for a shared name', () => {
  const ssr = makeCharacter({ slug: 'athena_ssr', quality: 'SSR' });
  const ur = makeCharacter({
    slug: 'athena_ur',
    quality: 'UR',
    last_updated: 1,
  });
  const map = buildPreferredCharacterByNameMap([ssr, ur]);
  assert.equal(map.get('Athena'), ur);
  assert.equal(map.get('athena'), ur);
});

test('buildPreferredCharacterByNameMap breaks same-rarity ties by most recently updated', () => {
  const older = makeCharacter({ slug: 'athena_a', last_updated: 1 });
  const newer = makeCharacter({ slug: 'athena_b', last_updated: 2 });
  const map = buildPreferredCharacterByNameMap([older, newer]);
  assert.equal(map.get('Athena'), newer);
});

test('resolveCharacterByNameAndQuality resolves by slug, then quality+name, then name', () => {
  const ssr = makeCharacter({ slug: 'athena_ssr', quality: 'SSR' });
  const ur = makeCharacter({ slug: 'athena_ur', quality: 'UR' });
  const byIdentity = buildCharacterByIdentityMap([ssr, ur]);
  const preferredByName = buildPreferredCharacterByNameMap([ssr, ur]);

  assert.equal(
    resolveCharacterByNameAndQuality(
      'athena_ur',
      null,
      preferredByName,
      byIdentity,
    ),
    ur,
  );
  assert.equal(
    resolveCharacterByNameAndQuality(
      'Athena',
      'SSR',
      preferredByName,
      byIdentity,
    ),
    ssr,
  );
  assert.equal(
    resolveCharacterByNameAndQuality(
      'Athena',
      null,
      preferredByName,
      byIdentity,
    ),
    ur,
  );
  assert.equal(
    resolveCharacterByNameAndQuality(
      'nonexistent',
      null,
      preferredByName,
      byIdentity,
    ),
    null,
  );
});

test('resolveCharacterReferenceKey and getCharacterByReferenceKey round-trip through a slug', () => {
  const character = makeCharacter();
  const characters = [character];
  const byIdentity = buildCharacterByIdentityMap(characters);
  const preferredByName = buildPreferredCharacterByNameMap(characters);

  const key = resolveCharacterReferenceKey(
    'Athena',
    null,
    characters,
    preferredByName,
    byIdentity,
  );
  assert.equal(key, 'athena_ssr');
  assert.equal(
    getCharacterByReferenceKey(key, preferredByName, byIdentity),
    character,
  );
});

test('resolveCharacterRoute matches by exact slug and reports name-sharing variants', () => {
  const ssr = makeCharacter({ slug: 'athena_ssr', quality: 'SSR' });
  const ur = makeCharacter({ slug: 'athena_ur', quality: 'UR' });
  const characters = [ssr, ur];

  const match = resolveCharacterRoute(characters, 'athena_ssr');
  assert.equal(match.character, ssr);
  assert.deepEqual(
    match.variants.sort((a, b) => a.slug.localeCompare(b.slug)),
    [ssr, ur],
  );
});

test('resolveCharacterRoute returns a null character for an empty param', () => {
  const match = resolveCharacterRoute([makeCharacter()], undefined);
  assert.equal(match.character, null);
  assert.equal(match.baseSlug, null);
});

test('resolveCharacterRoute falls back to a legacy name-derived slug for old bookmarks', () => {
  const character = makeCharacter({ slug: 'athena_ssr_2024' });
  const match = resolveCharacterRoute([character], 'Athena');
  assert.equal(match.character, character);
  assert.equal(match.baseSlug, 'athena');
});

test('Chinese names never match other characters through an empty slug', () => {
  const anubis = makeCharacter({
    slug: 'anubis_ssr_plus',
    name: '阿努比斯',
    quality: 'SSR+',
  });
  const marie = makeCharacter({
    slug: 'ma_li_luo_si_ssr_plus',
    name: '瑪莉·蘿絲',
    quality: 'SSR+',
  });
  const characters = [anubis, marie];
  const byIdentity = buildCharacterByIdentityMap(characters);
  const preferredByName = buildPreferredCharacterByNameMap(characters);

  assert.equal(
    resolveCharacterByNameAndQuality(
      '瑪莉·蘿絲',
      'SSR+',
      preferredByName,
      byIdentity,
    ),
    marie,
  );
  assert.equal(
    resolveCharacterByNameAndQuality(
      '不存在',
      'SSR+',
      preferredByName,
      byIdentity,
    ),
    null,
  );
  const route = resolveCharacterRoute(characters, '不存在');
  assert.equal(route.character, null);
  assert.deepEqual(route.variants, []);
});
