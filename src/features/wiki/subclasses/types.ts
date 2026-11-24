import type { CharacterClass } from '@/features/characters/types';

export interface Subclass {
  slug: string;
  name: string;
  class: CharacterClass;
  tier: number;
  bonuses: string[];
  effect: string;
  is_global?: boolean;
  machine_translated?: boolean;
  last_updated: number;
}
