import type { Character } from '@/features/characters/types';
import {
  safeDecodeURIComponent,
  toEntitySlug,
} from '../../../utils/entity-slug.ts';
import { getQualityRank } from '../../../utils/quality.ts';

function normalizeCharacterNameKey(value: string): string {
  return value.trim().toLowerCase();
}

function shouldPreferCandidate(
  existing: Character,
  candidate: Character,
): boolean {
  const existingRank = getQualityRank(existing.quality);
  const candidateRank = getQualityRank(candidate.quality);

  if (candidateRank < existingRank) {
    return true;
  }

  if (candidateRank === existingRank) {
    const existingUpdated = existing.last_updated ?? 0;
    const candidateUpdated = candidate.last_updated ?? 0;
    return candidateUpdated > existingUpdated;
  }

  return false;
}

function getPreferredCharacterByName(
  name: string,
  preferredByName: Map<string, Character>,
): Character | undefined {
  const exact = preferredByName.get(name);
  if (exact) return exact;

  const trimmed = name.trim();
  if (trimmed !== name) {
    const trimmedMatch = preferredByName.get(trimmed);
    if (trimmedMatch) return trimmedMatch;
  }

  const normalized = normalizeCharacterNameKey(trimmed);
  if (!normalized) return undefined;

  return preferredByName.get(normalized);
}

function getCharacterByLegacyNameAndQuality(
  nameOrSlug: string,
  quality: string | null | undefined,
  candidates: Iterable<Character>,
): Character | undefined {
  if (!quality) return undefined;

  const normalizedName = normalizeCharacterNameKey(nameOrSlug);
  const normalizedSlug = toEntitySlug(nameOrSlug);
  if (!normalizedName && !normalizedSlug) return undefined;

  for (const character of candidates) {
    if (character.quality !== quality) continue;
    if (character.slug === nameOrSlug) return character;
    if (normalizeCharacterNameKey(character.name) === normalizedName) {
      return character;
    }
    // Non-Latin names (e.g. zh locales) slug to '', which would match every such name.
    if (normalizedSlug && toEntitySlug(character.name) === normalizedSlug) {
      return character;
    }
  }

  return undefined;
}

/** Returns the stable identity key for a character (its slug, which always embeds quality). */
export function getCharacterIdentityKey(character: Character): string {
  return character.slug;
}

/** Returns the route base slug for a character (the character's data slug). */
export function getCharacterBaseSlug(character: Character): string;
export function getCharacterBaseSlug(name: string): string;
export function getCharacterBaseSlug(
  characterOrName: Character | string,
): string {
  if (typeof characterOrName === 'string') {
    return toEntitySlug(characterOrName);
  }
  return characterOrName.slug;
}

export function getCharacterRouteSlug(character: Character): string {
  return character.slug;
}

export function getCharacterRoutePath(character: Character): string {
  return `/characters/${getCharacterRouteSlug(character)}`;
}

/** Builds a route path by name only (legacy; prefers slug-based lookup instead). */
export function getCharacterRoutePathByName(name: string): string {
  return `/characters/${toEntitySlug(name)}`;
}

export function buildPreferredCharacterByNameMap(
  characters: Character[],
): Map<string, Character> {
  const map = new Map<string, Character>();

  for (const candidate of characters) {
    const keys = new Set([
      candidate.name,
      normalizeCharacterNameKey(candidate.name),
      toEntitySlug(candidate.name),
    ]);

    for (const key of keys) {
      if (!key) continue;
      const existing = map.get(key);
      if (!existing || shouldPreferCandidate(existing, candidate)) {
        map.set(key, candidate);
      }
    }
  }

  return map;
}

export function buildCharacterByIdentityMap(
  characters: Character[],
): Map<string, Character> {
  const map = new Map<string, Character>();
  for (const character of characters) {
    map.set(getCharacterIdentityKey(character), character);
    if (character.legacy_slug) {
      map.set(character.legacy_slug, character);
    }
  }
  return map;
}

export function getCharacterByReferenceKey(
  characterKey: string,
  preferredByName: Map<string, Character>,
  byIdentity: Map<string, Character>,
): Character | undefined {
  return (
    byIdentity.get(characterKey) ??
    getPreferredCharacterByName(characterKey, preferredByName)
  );
}

export function resolveCharacterReferenceKey(
  nameOrSlug: string,
  quality: string | null | undefined,
  characters: Character[],
  preferredByName: Map<string, Character>,
  byIdentity: Map<string, Character>,
): string {
  // Direct slug lookup — primary path since slugs are globally unique
  if (byIdentity.has(nameOrSlug)) return nameOrSlug;

  const qualityMatch = getCharacterByLegacyNameAndQuality(
    nameOrSlug,
    quality,
    characters,
  );
  if (qualityMatch) return qualityMatch.slug;

  // Name-based lookup (handles display names like "Athena")
  const preferred = getPreferredCharacterByName(nameOrSlug, preferredByName);
  if (preferred) return preferred.slug;

  // Fallback: scan by slug or normalized name
  const normalizedName = normalizeCharacterNameKey(nameOrSlug);
  const first = characters.find(
    (character) =>
      character.slug === nameOrSlug ||
      normalizeCharacterNameKey(character.name) === normalizedName,
  );
  if (first) return first.slug;

  return nameOrSlug;
}

export function toCharacterReferenceFromKey(
  characterKey: string,
  _preferredByName: Map<string, Character>,
  byIdentity: Map<string, Character>,
): { character_slug: string } {
  const character = byIdentity.get(characterKey);
  return { character_slug: character?.slug ?? characterKey };
}

export function resolveCharacterByNameAndQuality(
  nameOrSlug: string,
  quality: string | null | undefined,
  preferredByName: Map<string, Character>,
  byIdentity: Map<string, Character>,
): Character | null {
  // Direct slug lookup — primary path since slugs are globally unique
  const bySlug = byIdentity.get(nameOrSlug);
  if (bySlug) return bySlug;

  const qualityMatch = getCharacterByLegacyNameAndQuality(
    nameOrSlug,
    quality,
    byIdentity.values(),
  );
  if (qualityMatch) return qualityMatch;

  // Name-based lookup (handles display names like "Athena")
  return getPreferredCharacterByName(nameOrSlug, preferredByName) ?? null;
}

export interface CharacterRouteMatch {
  character: Character | null;
  variants: Character[];
  baseSlug: string | null;
  incomingSlug: string;
}

function getSameNameVariants(
  character: Character,
  characters: Character[],
): Character[] {
  const normalizedName = normalizeCharacterNameKey(character.name);
  return characters.filter(
    (entry) => normalizeCharacterNameKey(entry.name) === normalizedName,
  );
}

export function resolveCharacterRoute(
  characters: Character[],
  param: string | undefined,
): CharacterRouteMatch {
  const incomingSlug = safeDecodeURIComponent(param ?? '')
    .trim()
    .toLowerCase();
  if (!incomingSlug) {
    return {
      character: null,
      variants: [],
      baseSlug: null,
      incomingSlug,
    };
  }

  const matchedByExactSlug = characters.find(
    (entry) =>
      getCharacterRouteSlug(entry).toLowerCase() === incomingSlug ||
      entry.legacy_slug?.toLowerCase() === incomingSlug,
  );
  if (matchedByExactSlug) {
    return {
      character: matchedByExactSlug,
      variants: getSameNameVariants(matchedByExactSlug, characters),
      baseSlug: toEntitySlug(matchedByExactSlug.name),
      incomingSlug,
    };
  }

  // Legacy fallback: try name-derived slug for old bookmarked URLs
  const legacySlug = toEntitySlug(incomingSlug);
  const legacyVariants = legacySlug
    ? characters.filter(
        (entry) =>
          entry.slug === legacySlug || toEntitySlug(entry.name) === legacySlug,
      )
    : [];

  if (legacyVariants.length === 1) {
    return {
      character: legacyVariants[0],
      variants: getSameNameVariants(legacyVariants[0], characters),
      baseSlug: toEntitySlug(legacyVariants[0].name),
      incomingSlug,
    };
  }

  return {
    character: null,
    variants: legacyVariants,
    baseSlug: legacyVariants.length > 0 ? legacySlug : null,
    incomingSlug,
  };
}
