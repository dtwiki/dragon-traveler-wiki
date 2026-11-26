const MODEL_ANIMATION_ROLES = [
  'attack',
  'movement',
  'overdrive',
  'reaction',
  'skill',
  'state',
] as const;

type ModelAnimationRole = (typeof MODEL_ANIMATION_ROLES)[number];

export interface ModelAnimation {
  name: string;
  label: string;
  loop: boolean;
  default: boolean;
  role?: ModelAnimationRole;
}

/** The game's Unity material properties, as exported alongside the model. */
export interface GameMaterial {
  name: string;
  keywords: string[];
  floats: Record<string, number>;
  colors: Record<string, number[]>;
}

export interface ModelMetadata {
  version: 1 | 2 | 3;
  model: string;
  framingVertexCount?: number;
  textures: Record<string, string> & { base: string };
  animations: ModelAnimation[];
  material: {
    indirectLight: number;
    emissionStrength: number;
    shadowThreshold: number;
    shadowSoftness: number;
    outline: number;
  };
  gameMaterials: GameMaterial[];
}

const DEFAULT_OUTLINE_WIDTH = 0.001;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAssetPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.startsWith('\\') &&
    !value.split(/[\\/]/).includes('..')
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isMetadataVersion(value: unknown): value is ModelMetadata['version'] {
  return value === 1 || value === 2 || value === 3;
}

function isAnimationRole(value: unknown): value is ModelAnimationRole {
  return MODEL_ANIMATION_ROLES.includes(value as ModelAnimationRole);
}

function parseAnimation(value: unknown, index: number): ModelAnimation {
  if (!isRecord(value)) {
    throw new Error(`Animation ${index + 1} must be an object`);
  }
  if (
    typeof value.name !== 'string' ||
    value.name.length === 0 ||
    typeof value.label !== 'string' ||
    value.label.length === 0 ||
    typeof value.loop !== 'boolean' ||
    typeof value.default !== 'boolean'
  ) {
    throw new Error(`Animation ${index + 1} is missing required fields`);
  }
  if (value.role !== undefined && !isAnimationRole(value.role)) {
    throw new Error(`Animation ${index + 1} has an unsupported role`);
  }
  return {
    name: value.name,
    label: value.label,
    loop: value.loop,
    default: value.default,
    role: value.role,
  };
}

function parseGameMaterial(value: unknown, index: number): GameMaterial {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    !Array.isArray(value.keywords) ||
    !value.keywords.every((keyword) => typeof keyword === 'string') ||
    !isRecord(value.floats) ||
    !Object.values(value.floats).every(isFiniteNumber) ||
    !isRecord(value.colors) ||
    !Object.values(value.colors).every(
      (color) => Array.isArray(color) && color.every(isFiniteNumber),
    )
  ) {
    throw new Error(`Game material ${index + 1} is invalid`);
  }
  return {
    name: value.name,
    keywords: value.keywords,
    floats: value.floats as GameMaterial['floats'],
    colors: value.colors as GameMaterial['colors'],
  };
}

export function parseModelMetadata(raw: unknown): ModelMetadata {
  if (!isRecord(raw) || !isMetadataVersion(raw.version)) {
    throw new Error('Unsupported character model metadata version');
  }
  if (!isAssetPath(raw.model)) {
    throw new Error('Character model path is invalid');
  }
  if (
    raw.framingVertexCount !== undefined &&
    !isPositiveInteger(raw.framingVertexCount)
  ) {
    throw new Error('Character model framing vertex count is invalid');
  }
  if (!isRecord(raw.textures) || !isAssetPath(raw.textures.base)) {
    throw new Error('Character model base texture is missing or invalid');
  }
  const textures = Object.fromEntries(
    Object.entries(raw.textures).map(([semantic, path]) => {
      if (!semantic || !isAssetPath(path)) {
        throw new Error(`Character model texture "${semantic}" is invalid`);
      }
      return [semantic, path];
    }),
  ) as ModelMetadata['textures'];
  if (!Array.isArray(raw.animations) || raw.animations.length === 0) {
    throw new Error('Character model has no animations');
  }
  const animations = raw.animations.map(parseAnimation);
  if (
    new Set(animations.map((animation) => animation.name)).size !==
    animations.length
  ) {
    throw new Error('Character model animation names must be unique');
  }
  if (!isRecord(raw.material)) {
    throw new Error('Character model material settings are missing');
  }
  if (
    !isFiniteNumber(raw.material.indirectLight) ||
    !isFiniteNumber(raw.material.emissionStrength) ||
    !isFiniteNumber(raw.material.shadowThreshold) ||
    !isFiniteNumber(raw.material.shadowSoftness) ||
    (raw.material.outline !== undefined &&
      (!isFiniteNumber(raw.material.outline) || raw.material.outline < 0))
  ) {
    throw new Error('Character model material settings are invalid');
  }
  const material = {
    indirectLight: raw.material.indirectLight,
    emissionStrength: raw.material.emissionStrength,
    shadowThreshold: raw.material.shadowThreshold,
    shadowSoftness: raw.material.shadowSoftness,
    outline: raw.material.outline ?? DEFAULT_OUTLINE_WIDTH,
  };
  if (raw.gameMaterials !== undefined && !Array.isArray(raw.gameMaterials)) {
    throw new Error('Character model game materials are invalid');
  }
  const gameMaterials = (raw.gameMaterials ?? []).map(parseGameMaterial);

  return {
    version: raw.version,
    model: raw.model,
    framingVertexCount: raw.framingVertexCount,
    textures,
    animations,
    material,
    gameMaterials,
  };
}
