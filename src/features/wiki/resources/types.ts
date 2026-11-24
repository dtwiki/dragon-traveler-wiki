import type { Quality } from '@/types/quality';

export type ResourceCategory =
  | 'Container'
  | 'Currency'
  | 'Gift'
  | 'Item'
  | 'Material'
  | 'Summoning'
  | 'Shard';

export interface Resource {
  slug: string;
  name: string;
  description: string;
  category: ResourceCategory;
  quality: Quality;
  is_global?: boolean;
  machine_translated?: boolean;
  last_updated: number;
}
