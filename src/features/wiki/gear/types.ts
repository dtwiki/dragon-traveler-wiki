import type { Quality } from '@/types/quality';

export type GearType =
  'Headgear' | 'Chestplate' | 'Bracers' | 'Boots' | 'Weapon' | 'Accessory';

export interface GearSetBonus {
  quantity: number;
  description: string;
}

export interface GearSet {
  slug: string;
  name: string;
  set_bonus?: GearSetBonus;
  is_global?: boolean;
  last_updated?: number;
}

export interface Gear {
  slug: string;
  name: string;
  set: string;
  type: GearType;
  quality: Quality;
  lore: string;
  stats: Record<string, string | number>;
  set_bonus?: GearSetBonus;
  is_global?: boolean;
  last_updated?: number;
}
