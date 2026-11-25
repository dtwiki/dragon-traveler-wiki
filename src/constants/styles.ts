import type { CSSProperties } from 'react';

export const TAG_BADGE_STYLE = {
  flexShrink: 0,
  minWidth: 'max-content',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

export const RICH_TEXT_BADGE_STYLE = {
  verticalAlign: 'middle',
} as const satisfies CSSProperties;

type CharacterPortraitHoverOptions = {
  isSubstitute?: boolean;
};

/**
 * Returns a CSS class for character portrait hover effect (scale + shadow).
 * Actual transitions are handled by `.portrait-hover` in interactions.css.
 */
export function getCharacterPortraitHoverProps(
  options: CharacterPortraitHoverOptions = {},
) {
  const { isSubstitute = false } = options;
  return {
    className: isSubstitute
      ? 'portrait-hover portrait-hover-substitute'
      : 'portrait-hover',
  };
}

/** Shared base for all Mantine Tooltip `styles` objects. */
const TOOLTIP_BASE = {
  tooltip: {
    backgroundColor: 'var(--mantine-color-body)',
    color: 'var(--mantine-color-text)',
    border: '1px solid var(--mantine-color-default-border)',
  },
  arrow: {
    backgroundColor: 'var(--mantine-color-body)',
    border: '1px solid var(--mantine-color-default-border)',
  },
} as const;

/**
 * Tooltip styles for detail pages (skill/gear/status effect tooltips)
 */
export const DETAIL_TOOLTIP_STYLES = {
  tooltip: {
    ...TOOLTIP_BASE.tooltip,
    boxShadow: 'var(--mantine-shadow-sm)',
    padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)',
  },
  arrow: TOOLTIP_BASE.arrow,
};

/**
 * Larger tooltip styles for rich content (gear/set bonus previews)
 */
export const RICH_TOOLTIP_STYLES = {
  tooltip: {
    ...TOOLTIP_BASE.tooltip,
    boxShadow: 'var(--mantine-shadow-md)',
    borderRadius: 'var(--mantine-radius-md)',
    padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
  },
  arrow: TOOLTIP_BASE.arrow,
};

export const LINK_BLOCK_RESET_STYLE = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
} as const satisfies CSSProperties;

/** Flex layout for an anchor containing an icon + text label */
export const ICON_TEXT_FLEX_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;

export const WHITE_SPACE_PRE_LINE_STYLE = {
  whiteSpace: 'pre-line',
} as const satisfies CSSProperties;

/** Shrinks a table column to its content width. Apply to Th/Td alongside a full-width description column. */
export const COMPACT_COL_STYLE = {
  whiteSpace: 'nowrap',
  width: '1%',
} as const satisfies CSSProperties;

export const CURSOR_POINTER_STYLE = {
  cursor: 'pointer',
} as const satisfies CSSProperties;

export const CURSOR_DEFAULT_STYLE = {
  cursor: 'default',
} as const satisfies CSSProperties;

export function getMinWidthStyle(minWidth: number): CSSProperties {
  return { minWidth };
}

/** Keeps the builder character pool in view (with its own scroll) while the
 * main builder column scrolls past it, when shown side-by-side. */
export const STICKY_POOL_COLUMN_STYLE = {
  position: 'sticky',
  top: 'calc(var(--app-shell-header-offset, 0px) + var(--mantine-spacing-md))',
  maxHeight:
    'calc(100vh - var(--app-shell-header-offset, 0px) - var(--mantine-spacing-md) * 2)',
  overflowY: 'auto',
} as const satisfies CSSProperties;
