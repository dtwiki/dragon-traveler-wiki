import type { FactionSlug } from '@/types/faction';
import type { Quality } from '@/types/quality';

export type WyrmspellType = 'Breach' | 'Refuge' | 'Wildcry' | "Dragon's Call";

export interface WyrmspellQuality {
  quality: Quality;
  effect: string;
  child_effect?: string | null;
}

export interface Wyrmspell {
  slug: string;
  name: string;
  type: WyrmspellType;
  qualities: WyrmspellQuality[];
  exclusive_faction: FactionSlug | null;
  is_global?: boolean;
  machine_translated?: boolean;
  last_updated: number;
}

/** Returns the highest quality entry (last in the array, which is ordered weakest→strongest). */
export function getMaxQuality(wyrmspell: Wyrmspell): WyrmspellQuality | null {
  return wyrmspell.qualities.length > 0
    ? wyrmspell.qualities[wyrmspell.qualities.length - 1]
    : null;
}
