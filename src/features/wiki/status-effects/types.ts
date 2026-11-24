export type StatusEffectType =
  | 'Control'
  | 'Stat Buff'
  | 'Stat Debuff'
  | 'Defense'
  | 'Healing'
  | 'Elemental'
  | 'Summon'
  | 'Form'
  | 'Damage'
  | 'Unique'
  | 'Utility';

export interface StatusEffect {
  slug: string;
  name: string;
  type: StatusEffectType;
  effect: string;
  remark: string;
  is_global?: boolean;
  last_updated: number;
  icon?: boolean;
}
