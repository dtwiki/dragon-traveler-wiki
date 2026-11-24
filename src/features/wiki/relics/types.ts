import type { Quality } from '@/types/quality';

export type RelicType =
  | 'Sanctuary Relic'
  | 'Legendary Ritual Vessel'
  | 'Fated Relic'
  | 'Symbol of Theocracy';

export interface OracleScrollRef {
  name: string;
  /** Canonical, locale-invariant identifier for the oracle scroll grouping. */
  slug: string;
}

export interface Relic {
  slug: string;
  name: string;
  oracle_scroll?: OracleScrollRef | null;
  lore: string;
  type: RelicType;
  quality: Quality;
  is_global?: boolean;
  last_updated?: number;
}
