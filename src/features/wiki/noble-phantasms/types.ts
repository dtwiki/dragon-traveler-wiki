export interface NoblePhantasmEffect {
  tier?: string | null;
  description: string;
}

export interface NoblePhantasmSkill {
  level: number;
  tier?: string | null;
  description: string;
}

export interface NoblePhantasm {
  slug: string;
  legacy_slug?: string | null;
  name: string;
  quality: Quality;
  character_slug: string | null;
  is_global?: boolean | null;
  machine_translated?: boolean;
  lore?: string | null;
  effects: NoblePhantasmEffect[];
  skills: NoblePhantasmSkill[];
  last_updated?: number;
}
import type { Quality } from '@/types/quality';
