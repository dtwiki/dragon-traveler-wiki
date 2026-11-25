import {
  createTheme,
  defaultVariantColorsResolver,
  parseThemeColor,
  type MantineColorsTuple,
  type VariantColorsResolver,
} from '@mantine/core';
import { DETAIL_TOOLTIP_STYLES } from './constants/styles';

// Custom dark color for deeper dark mode
const dark: MantineColorsTuple = [
  '#C1C2C5', // 0 - text
  '#A6A7AB', // 1
  '#909296', // 2
  '#5c5f66', // 3
  '#373A40', // 4
  '#2C2E33', // 5 - borders
  '#1A1B1E', // 6 - card backgrounds
  '#141517', // 7 - main background
  '#101113', // 8 - deeper background
  '#0c0d0e', // 9 - deepest
];

// Light-mode text for the `light` variant: the darkest shade that reaches 4.5:1
// on that color's own tinted background (Mantine's default shade 6 does not).
const LIGHT_VARIANT_TEXT: Record<string, string> = {
  red: 'var(--mantine-color-red-9)',
  pink: 'var(--mantine-color-pink-8)',
  grape: 'var(--mantine-color-grape-8)',
  violet: 'var(--mantine-color-violet-8)',
  indigo: 'var(--mantine-color-indigo-8)',
  blue: 'var(--mantine-color-blue-9)',
  cyan: 'var(--mantine-color-cyan-9)',
  teal: 'var(--mantine-color-teal-9)',
  green: 'var(--dt-text-green)',
  lime: 'var(--dt-text-lime)',
  yellow: 'var(--dt-text-yellow)',
  orange: 'var(--dt-text-orange)',
};

const variantColorResolver: VariantColorsResolver = (input) => {
  const colors = defaultVariantColorsResolver(input);
  if (input.variant !== 'light') return colors;
  const { color } = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });
  const lightText = LIGHT_VARIANT_TEXT[color];
  return lightText
    ? { ...colors, color: `light-dark(${lightText}, ${colors.color})` }
    : colors;
};

export const theme = createTheme({
  variantColorResolver,
  primaryColor: 'violet',
  // Picks black or white text per filled color so light fills (yellow, lime,
  // gray) stay readable instead of always getting white text.
  autoContrast: true,
  defaultRadius: 'md',
  fontFamily:
    '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  colors: {
    dark,
  },

  // Enhanced spacing scale
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // Enhanced radius scale
  radius: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
  },

  // Enhanced shadow scale
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // Enhanced heading styles
  headings: {
    fontFamily:
      '"Space Grotesk", "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', lineHeight: '1.4' },
      h4: { fontSize: '1.25rem', lineHeight: '1.5' },
      h5: { fontSize: '1rem', lineHeight: '1.5' },
      h6: { fontSize: '0.875rem', lineHeight: '1.5' },
    },
  },

  // Component defaults
  components: {
    Badge: {
      // Sentence case reads better than Mantine's all caps, especially for
      // long labels such as set and scroll names.
      defaultProps: {
        tt: 'none',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 600,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        padding: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        removeScrollProps: { removeScrollBar: false },
      },
    },
    Drawer: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    NavLink: {
      defaultProps: {
        radius: 'md',
      },
    },
    Tooltip: {
      defaultProps: {
        position: 'top',
        withArrow: true,
        openDelay: 120,
        closeDelay: 120,
        events: { hover: true, focus: true, touch: false },
        styles: DETAIL_TOOLTIP_STYLES,
      },
    },
  },
});
