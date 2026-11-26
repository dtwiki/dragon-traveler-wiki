import type { GameMaterial, ModelMetadata } from './character-model-metadata';

type Rgb = [number, number, number];

export interface ToonMaterialSettings {
  shadowThreshold: number;
  shadowSoftness: number;
  emissionColor: Rgb;
  outlineColor: Rgb;
  outlineWidth: number;
  /** Extrude the outline along the exported smoothed normals instead of the shading normals. */
  outlineUsesSmoothedNormals: boolean;
  alphaCutoff: number;
}

const DEFAULT_OUTLINE_COLOR: Rgb = [0.055, 0.04, 0.075];
/**
 * Converts `_ContourThicknessOs.x` to model units. Calibrated by eye against the
 * game's character renders; the game shader's own scaling is not known.
 */
export const OUTLINE_THICKNESS_SCALE = 0.01;

function rgb(color: number[] | undefined): Rgb | null {
  return color && color.length >= 3 ? [color[0], color[1], color[2]] : null;
}

/** Effect materials (dissolves, distortion, particles) carry no toon shadow parameters. */
export function isToonGameMaterial(material: GameMaterial): boolean {
  return rgb(material.colors._ToonShadowParams) !== null;
}

/**
 * Shader settings for one mesh, taken from the game's Unity material when the
 * metadata carries it, otherwise from the generic `material` block.
 * `_ToonShadowParams` is read as (threshold, softness, …). The game's outline
 * thickness is only used when the model carries smoothed outline normals, since
 * a visible outline along split shading normals breaks apart at hard edges.
 */
export function toonMaterialSettings(
  fallback: ModelMetadata['material'],
  gameMaterial?: GameMaterial,
  hasOutlineNormals = false,
): ToonMaterialSettings {
  const strength = fallback.emissionStrength;
  if (!gameMaterial || !isToonGameMaterial(gameMaterial)) {
    return {
      shadowThreshold: fallback.shadowThreshold,
      shadowSoftness: fallback.shadowSoftness,
      emissionColor: [strength, strength, strength],
      outlineColor: DEFAULT_OUTLINE_COLOR,
      outlineWidth: fallback.outline,
      outlineUsesSmoothedNormals: false,
      alphaCutoff: 0,
    };
  }

  const { colors, floats, keywords } = gameMaterial;
  const [shadowThreshold, shadowSoftness] = colors._ToonShadowParams;
  const thickness = colors._ContourThicknessOs?.[0];
  const outlineUsesSmoothedNormals =
    hasOutlineNormals && !keywords.includes('_OUT_LINE_NORMAL');
  return {
    shadowThreshold,
    shadowSoftness,
    emissionColor: keywords.includes('_EMISSION')
      ? (rgb(colors._EmissionColor) ?? [0, 0, 0])
      : [0, 0, 0],
    outlineColor: rgb(colors._ContourColorOs) ?? DEFAULT_OUTLINE_COLOR,
    outlineWidth:
      hasOutlineNormals && thickness !== undefined
        ? thickness * OUTLINE_THICKNESS_SCALE
        : fallback.outline,
    outlineUsesSmoothedNormals,
    alphaCutoff: floats._AlphaClip === 1 ? (floats._Cutoff ?? 0.5) : 0,
  };
}
