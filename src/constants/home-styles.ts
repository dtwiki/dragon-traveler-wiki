import type { CSSProperties } from 'react';
export const HOME_HERO_TITLE_STYLE = {
  fontFamily: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif',
  letterSpacing: '0.02em',
  fontWeight: 700,
  fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
} as const satisfies CSSProperties;

export function getHomeHeroPlaceholderGradient(isDark: boolean): string {
  return isDark
    ? 'var(--dt-home-hero-gradient-dark)'
    : 'var(--dt-home-hero-gradient-light)';
}

export function getHomeHeroWordmarkStyle(isDark: boolean): CSSProperties {
  return {
    color: isDark
      ? 'var(--dt-wordmark-color-dark)'
      : 'var(--dt-wordmark-color-light)',
    textShadow: isDark
      ? 'var(--dt-wordmark-shadow-dark)'
      : 'var(--dt-wordmark-shadow-light)',
  };
}

export function getHomeHeroSubtitleStyle(isDark: boolean): CSSProperties {
  return {
    color: isDark
      ? 'var(--mantine-color-gray-1)'
      : 'var(--mantine-color-dark-8)',
    fontWeight: 500,
    textShadow: isDark ? '0 1px 6px rgba(0, 0, 0, 0.9)' : 'none',
  };
}

export function getHomeHeroMetaTextStyle(isDark: boolean): CSSProperties {
  return {
    color: isDark
      ? 'var(--mantine-color-gray-2)'
      : 'var(--mantine-color-dark-6)',
    textShadow: isDark ? '0 1px 4px rgba(0, 0, 0, 0.85)' : 'none',
  };
}

export function getHomeHeroPlayNowStyle(isDark: boolean): CSSProperties {
  return {
    borderColor: isDark
      ? 'rgba(255, 255, 255, 0.4)'
      : 'var(--mantine-color-gray-4)',
    color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'var(--mantine-color-dark-8)',
    backdropFilter: 'blur(4px)',
    backgroundColor: isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.78)',
    whiteSpace: 'nowrap',
  };
}
