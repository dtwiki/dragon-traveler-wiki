import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isToonGameMaterial,
  OUTLINE_THICKNESS_SCALE,
  toonMaterialSettings,
} from '../../src/features/characters/components/character-model-materials.ts';
import { parseModelMetadata } from '../../src/features/characters/components/character-model-metadata.ts';

const fallback = {
  indirectLight: 0.5,
  emissionStrength: 0.75,
  shadowThreshold: 0.5,
  shadowSoftness: 0.1,
  outline: 0.001,
};

function toonMaterial({ keywords = [], floats = {}, colors = {} } = {}) {
  return {
    name: 'model_body',
    keywords,
    floats,
    colors: {
      _ToonShadowParams: [0.3, 0.001, -1, 0.001],
      _ContourColorOs: [0, 0, 0, 1],
      _EmissionColor: [7.5, 5.5, 1.5, 1],
      _ContourThicknessOs: [0.17, 1.1, 0, 0],
      ...colors,
    },
  };
}

test('toonMaterialSettings falls back to the generic material block', () => {
  assert.deepEqual(toonMaterialSettings(fallback), {
    shadowThreshold: 0.5,
    shadowSoftness: 0.1,
    emissionColor: [0.75, 0.75, 0.75],
    outlineColor: [0.055, 0.04, 0.075],
    outlineWidth: 0.001,
    outlineUsesSmoothedNormals: false,
    alphaCutoff: 0,
  });
});

test('toonMaterialSettings reads shadow and outline values from the game material', () => {
  const settings = toonMaterialSettings(fallback, toonMaterial());
  assert.equal(settings.shadowThreshold, 0.3);
  assert.equal(settings.shadowSoftness, 0.001);
  assert.deepEqual(settings.outlineColor, [0, 0, 0]);
});

test('toonMaterialSettings uses the game outline thickness only with smoothed normals', () => {
  const withNormals = toonMaterialSettings(fallback, toonMaterial(), true);
  assert.equal(withNormals.outlineWidth, 0.17 * OUTLINE_THICKNESS_SCALE);
  assert.equal(withNormals.outlineUsesSmoothedNormals, true);

  const withoutNormals = toonMaterialSettings(fallback, toonMaterial());
  assert.equal(withoutNormals.outlineWidth, 0.001);
  assert.equal(withoutNormals.outlineUsesSmoothedNormals, false);
});

test('toonMaterialSettings extrudes along shading normals when the game does', () => {
  const settings = toonMaterialSettings(
    fallback,
    toonMaterial({ keywords: ['_OUT_LINE_NORMAL'] }),
    true,
  );
  assert.equal(settings.outlineUsesSmoothedNormals, false);
  assert.equal(settings.outlineWidth, 0.17 * OUTLINE_THICKNESS_SCALE);
});

test('toonMaterialSettings only emits when the game enables emission', () => {
  assert.deepEqual(
    toonMaterialSettings(fallback, toonMaterial()).emissionColor,
    [0, 0, 0],
  );
  assert.deepEqual(
    toonMaterialSettings(fallback, toonMaterial({ keywords: ['_EMISSION'] }))
      .emissionColor,
    [7.5, 5.5, 1.5],
  );
});

test('toonMaterialSettings applies the alpha cutoff only when clipping is on', () => {
  const clipped = toonMaterial({ floats: { _AlphaClip: 1, _Cutoff: 0.4 } });
  const unclipped = toonMaterial({ floats: { _AlphaClip: 0, _Cutoff: 0.4 } });
  assert.equal(toonMaterialSettings(fallback, clipped).alphaCutoff, 0.4);
  assert.equal(toonMaterialSettings(fallback, unclipped).alphaCutoff, 0);
});

test('isToonGameMaterial rejects effect materials', () => {
  assert.ok(isToonGameMaterial(toonMaterial()));
  assert.ok(
    !isToonGameMaterial({
      name: 'effect',
      keywords: ['_DISTORTION_ON'],
      floats: {},
      colors: {},
    }),
  );
});

const baseMetadata = {
  version: 2,
  model: 'model.glb',
  textures: { base: 'model-base.png' },
  animations: [{ name: 'idle', label: 'Idle', loop: true, default: true }],
  material: fallback,
};

test('parseModelMetadata keeps game materials and defaults them to empty', () => {
  assert.deepEqual(parseModelMetadata(baseMetadata).gameMaterials, []);
  const material = toonMaterial();
  assert.deepEqual(
    parseModelMetadata({ ...baseMetadata, gameMaterials: [material] })
      .gameMaterials,
    [material],
  );
});

test('parseModelMetadata rejects malformed game materials', () => {
  assert.throws(
    () =>
      parseModelMetadata({
        ...baseMetadata,
        gameMaterials: [{ name: 'broken', keywords: [], floats: { x: 'a' } }],
      }),
    /Game material 1 is invalid/,
  );
});
