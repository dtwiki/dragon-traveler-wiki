// FACTION_NAMES is the canonical list of all factions.
// FactionName is derived from it so that adding a new faction here
// automatically flags every Record<FactionName, …> that is now incomplete.
export const FACTION_NAMES = [
  'Elemental Echo',
  'Wild Spirit',
  'Arcane Wisdom',
  'Sanctum Glory',
  'Otherworld Return',
  'Illusion Veil',
] as const;

export type FactionName = (typeof FACTION_NAMES)[number];

export const FACTION_SLUGS = [
  'elemental_echo',
  'wild_spirit',
  'arcane_wisdom',
  'sanctum_glory',
  'otherworld_return',
  'illusion_veil',
] as const;

export type FactionSlug = (typeof FACTION_SLUGS)[number];

export const FACTION_SLUG_TO_NAME: Record<FactionSlug, FactionName> = {
  elemental_echo: 'Elemental Echo',
  wild_spirit: 'Wild Spirit',
  arcane_wisdom: 'Arcane Wisdom',
  sanctum_glory: 'Sanctum Glory',
  otherworld_return: 'Otherworld Return',
  illusion_veil: 'Illusion Veil',
};

export const FACTION_NAME_TO_SLUG: Record<FactionName, FactionSlug> = {
  'Elemental Echo': 'elemental_echo',
  'Wild Spirit': 'wild_spirit',
  'Arcane Wisdom': 'arcane_wisdom',
  'Sanctum Glory': 'sanctum_glory',
  'Otherworld Return': 'otherworld_return',
  'Illusion Veil': 'illusion_veil',
};

export interface Faction {
  slug: FactionSlug;
  name: FactionName;
  wyrms: string[];
  description: string;
  recommended_artifacts: string[];
  is_global?: boolean;
  last_updated: number;
}
