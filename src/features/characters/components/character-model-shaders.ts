import { DataTexture, RGBAFormat, UnsignedByteType } from 'three';

export const vertexShader = /* glsl */ `
  #include <common>
  #include <skinning_pars_vertex>
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    #include <beginnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
    #include <begin_vertex>
    #include <skinning_vertex>
    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D baseMap;
  uniform sampler2D shadeMap;
  uniform sampler2D emissionMap;
  uniform vec3 lightDirection;
  uniform vec3 emissionColor;
  uniform float indirectLight;
  uniform float shadowThreshold;
  uniform float shadowSoftness;
  uniform float alphaCutoff;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec4 base = texture2D(baseMap, vUv);
    if (base.a < alphaCutoff) discard;
    vec3 authoredShade = texture2D(shadeMap, vUv).rgb;
    vec3 emission = texture2D(emissionMap, vUv).rgb;
    vec3 normal = normalize(vWorldNormal);
    vec3 light = normalize(lightDirection);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float halfLambert = dot(normal, light) * 0.5 + 0.5;
    // The game's near-zero softness would alias, so widen it to at least one pixel.
    float edge = max(shadowSoftness, fwidth(halfLambert));
    float toonLight = smoothstep(shadowThreshold - edge, shadowThreshold + edge, halfLambert);
    vec3 color = mix(mix(authoredShade, base.rgb, indirectLight), base.rgb, toonLight);
    color += base.rgb * pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0) * toonLight * 0.08;
    color += emission * emissionColor;
    gl_FragColor = vec4(color, base.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const outlineVertexShader = /* glsl */ `
  #include <common>
  #include <skinning_pars_vertex>
  uniform float outlineWidth;
  #ifdef USE_OUTLINE_NORMAL
    attribute vec3 _outline_normal;
  #endif
  void main() {
    #ifdef USE_OUTLINE_NORMAL
      vec3 objectNormal = _outline_normal;
    #else
      #include <beginnormal_vertex>
    #endif
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <begin_vertex>
    #include <skinning_vertex>
    transformed += objectNormal * outlineWidth;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    // Inner layers of double-sided cloth face inward but keep outward normals,
    // so their shell lands in front of the outer layer. Pushing the outline back
    // by more than its width keeps it behind any surface it is extruded through.
    mvPosition.z -= 2.0 * outlineWidth * length(modelViewMatrix[0].xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const outlineFragmentShader = /* glsl */ `
  uniform vec3 outlineColor;
  void main() {
    gl_FragColor = vec4(outlineColor, 1.0);
  }
`;

export function neutralTexture(r: number, g: number, b: number): DataTexture {
  const texture = new DataTexture(
    new Uint8Array([r, g, b, 255]),
    1,
    1,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.needsUpdate = true;
  return texture;
}
