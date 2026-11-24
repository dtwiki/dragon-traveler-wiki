import type { Quality } from '@/types/quality';

export type HowlkinBasicStats = Record<string, number | string>;

export interface Howlkin {
  slug: string;
  name: string;
  quality: Quality;
  basic_stats: HowlkinBasicStats;
  passive_effects: string[];
  is_global?: boolean;
  machine_translated?: boolean;
  last_updated?: number | null;
}

export interface GoldenAllianceEffect {
  level: number;
  stats: string[];
}

export interface GoldenAlliance {
  slug: string;
  name: string;
  howlkins: string[];
  effects: GoldenAllianceEffect[];
  is_global?: boolean;
  machine_translated?: boolean;
  last_updated?: number;
}
