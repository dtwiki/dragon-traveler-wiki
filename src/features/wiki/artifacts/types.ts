import type { CharacterClass } from '@/features/characters/types';
import type { Quality } from '@/types/quality';

export interface ArtifactEffect {
  level: number;
  description: string;
}

export interface ArtifactTreasure {
  name: string;
  lore: string;
  character_class: CharacterClass;
  effect: ArtifactEffect[];
}

export interface Artifact {
  slug: string;
  name: string;
  lore: string;
  quality: Quality;
  effect: ArtifactEffect[];
  columns: number;
  rows: number;
  treasures: ArtifactTreasure[];
  is_global?: boolean;
  machine_translated?: boolean;
  last_updated: number;
}
