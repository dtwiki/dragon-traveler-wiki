/**
 * Glassmorphism style presets for consistent blur/transparency effects
 */

export const GLASS = {
  BLUR: '12px',
  BLUR_SUBTLE: '8px',
} as const;

export const GLASS_BORDER = {
  dark: '1px solid rgba(255, 255, 255, 0.08)',
  light: '1px solid rgba(0, 0, 0, 0.1)',
} as const;

/**
 * Shared background alpha for small glass "icon chip" surfaces
 * (hero icon boxes, inline artifact/wyrmspell thumbnails, etc.).
 */
export const GLASS_ICON_BG = {
  dark: 'rgba(0,0,0,0.3)',
  light: 'rgba(255,255,255,0.5)',
} as const;

/**
 * Subtle glass style for lore/description cards.
 * Opacity scales automatically via --dt-surface-opacity CSS variable.
 */
export function getLoreGlassStyles(isDark: boolean) {
  // These multipliers preserve the original ratio:
  //   dark lore default (0.25) / surface default (0.9) ≈ 0.278
  //   light lore default (0.60) / surface default (0.9) ≈ 0.667
  const alpha = isDark
    ? 'calc(var(--dt-surface-opacity, 0.9) * 0.278)'
    : 'calc(var(--dt-surface-opacity, 0.9) * 0.667)';
  return {
    background: isDark
      ? `rgba(0 0 0 / ${alpha})`
      : `rgba(255 255 255 / ${alpha})`,
    backdropFilter: `blur(${GLASS.BLUR_SUBTLE})`,
    border: isDark
      ? '1px solid rgba(255,255,255,0.06)'
      : '1px solid rgba(0,0,0,0.06)',
  };
}

/**
 * Get glassmorphism styles based on color scheme.
 * Opacity scales automatically via --dt-surface-opacity CSS variable.
 */
export function getGlassStyles(isDark: boolean, subtle = false) {
  // subtle factor (0.833) preserves the original subtle/non-subtle ratio:
  //   0.75 (subtle dark default) / 0.9 (non-subtle dark default) ≈ 0.833
  const alpha = subtle
    ? 'calc(var(--dt-surface-opacity, 0.9) * 0.833)'
    : 'var(--dt-surface-opacity, 0.9)';

  return {
    backdropFilter: `blur(${GLASS.BLUR})`,
    WebkitBackdropFilter: `blur(${GLASS.BLUR})`,
    backgroundColor: isDark
      ? `rgba(20 21 23 / ${alpha})`
      : `rgba(255 255 255 / ${alpha})`,
    border: isDark ? GLASS_BORDER.dark : GLASS_BORDER.light,
  };
}
