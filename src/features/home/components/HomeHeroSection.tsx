import { OPEN_GLOBAL_SEARCH_EVENT } from '@/components/tools/LazySearchModal';
import FullBleedSection from '@/components/layout/FullBleedSection';
import {
  HOME_HERO_TITLE_STYLE,
  getHomeHeroMetaTextStyle,
  getHomeHeroPlaceholderGradient,
  getHomeHeroPlayNowStyle,
  getHomeHeroSubtitleStyle,
  getHomeHeroWordmarkStyle,
} from '@/constants/home-styles';
import { getHeroNavGlassStyles } from '@/constants/glass';
import { IMAGE_SIZE, PAGE_WIDTH } from '@/constants/ui';
import { BannerContext } from '@/contexts';
import { useDarkMode, useGradientAccent, useIsMobile } from '@/hooks';
import {
  Box,
  Button,
  Badge,
  Container,
  Group,
  Kbd,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IoChevronForward,
  IoGameController,
  IoOpenOutline,
  IoPeople,
  IoSearch,
  IoShield,
  IoTrophy,
} from 'react-icons/io5';
import { Link } from 'react-router';
import { InteractiveSurface } from '@/components/ui/Surface';
import { useContext, useMemo, type ComponentType } from 'react';

const HERO_NAV_ITEMS: Array<{
  label: string;
  tagline: string;
  to: string;
  Icon: ComponentType<{ size?: number }>;
}> = [
  {
    label: 'Characters',
    tagline: 'Builds & rankings',
    to: '/characters',
    Icon: IoPeople,
  },
  {
    label: 'Tier List',
    tagline: 'Current meta picks',
    to: '/tier-list',
    Icon: IoTrophy,
  },
  {
    label: 'Teams',
    tagline: 'Synergy & team builder',
    to: '/teams',
    Icon: IoShield,
  },
];

export default function HomeHeroSection() {
  const isDark = useDarkMode();
  const isMobile = useIsMobile();
  const { accent } = useGradientAccent();
  const { selectedBanner } = useContext(BannerContext);

  const homeHeroWordmarkStyle = getHomeHeroWordmarkStyle(isDark);
  const homeHeroSubtitleStyle = getHomeHeroSubtitleStyle(isDark);
  const homeHeroMetaTextStyle = getHomeHeroMetaTextStyle(isDark);
  const homeHeroPlayNowStyle = getHomeHeroPlayNowStyle(isDark);
  const homeHeroNavCardStyle = getHeroNavGlassStyles(isDark);

  const HERO_ACCENT_CYCLE = useMemo(
    () => [accent.primary, accent.secondary, accent.tertiary, accent.primary],
    [accent.primary, accent.secondary, accent.tertiary],
  );

  return (
    <FullBleedSection
      style={{
        position: 'relative',
        minHeight: isMobile ? 430 : 520,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        // Show palette gradient when no banner is selected so the hero always
        // has a distinct background rather than showing the body grid.
        background: selectedBanner
          ? undefined
          : getHomeHeroPlaceholderGradient(isDark),
      }}
    >
      <Container
        size={PAGE_WIDTH.WIDE}
        style={{ position: 'relative', zIndex: 1, width: '100%' }}
        py={{ base: 'xl', sm: 72 }}
      >
        <Group wrap="nowrap" align="center" gap="xl">
          {/* Left: text content */}
          <Stack
            gap="lg"
            align={isMobile ? 'center' : 'flex-start'}
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 620,
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            <Stack
              gap="sm"
              align={isMobile ? 'center' : 'flex-start'}
              className="home-hero-anim-in"
              style={{ animationDelay: '0ms' }}
            >
              <Badge
                radius="xl"
                variant="gradient"
                gradient={{
                  from: accent.secondary,
                  to: accent.primary,
                  deg: 110,
                }}
                style={{ letterSpacing: 0.3 }}
              >
                Community Resource Hub
              </Badge>
              <Title order={1} style={HOME_HERO_TITLE_STYLE}>
                <Text component="span" inherit style={homeHeroWordmarkStyle}>
                  Dragon Traveler
                </Text>{' '}
                <Text
                  component="span"
                  inherit
                  style={{
                    color: isDark
                      ? 'var(--mantine-color-white)'
                      : 'var(--mantine-color-dark-9)',
                  }}
                >
                  Wiki
                </Text>
              </Title>
              <Text size="lg" style={homeHeroSubtitleStyle}>
                A{' '}
                <Text
                  component="span"
                  inherit
                  fw={700}
                  style={{
                    color: isDark
                      ? 'var(--mantine-primary-color-1)'
                      : 'var(--mantine-primary-color-8)',
                  }}
                >
                  community-driven
                </Text>{' '}
                wiki for{' '}
                <Text
                  component="span"
                  inherit
                  fw={700}
                  style={{
                    color: isDark
                      ? `var(--mantine-color-${accent.secondary}-1)`
                      : `var(--mantine-color-${accent.secondary}-8)`,
                  }}
                >
                  Dragon Traveler
                </Text>
              </Text>
            </Stack>

            <Stack
              gap="sm"
              align={isMobile ? 'center' : 'flex-start'}
              className="home-hero-anim-in"
              style={{ width: '100%', animationDelay: '200ms' }}
            >
              <Group
                gap="sm"
                justify={isMobile ? 'center' : 'flex-start'}
                wrap="wrap"
                style={{ maxWidth: isMobile ? 440 : undefined }}
              >
                <Button
                  component={Link}
                  to="/characters"
                  size="md"
                  fullWidth={isMobile}
                  color={accent.primary}
                  className="dt-hero-cta"
                  leftSection={<IoPeople size={IMAGE_SIZE.ICON_LG} />}
                >
                  Browse Characters
                </Button>
                <Button
                  component={Link}
                  to="/tier-list"
                  size="md"
                  fullWidth={isMobile}
                  variant="light"
                  color={accent.primary}
                  className="dt-hero-cta"
                  leftSection={<IoTrophy size={IMAGE_SIZE.ICON_LG} />}
                >
                  View Tier List
                </Button>
                <Button
                  component="a"
                  href="https://dt.game-tree.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size={isMobile ? 'md' : 'sm'}
                  fullWidth={isMobile}
                  variant="outline"
                  color="gray"
                  className="dt-hero-cta"
                  leftSection={<IoGameController size={IMAGE_SIZE.ICON_LG} />}
                  rightSection={<IoOpenOutline size={14} />}
                  style={homeHeroPlayNowStyle}
                >
                  Play Now
                </Button>
              </Group>
              <Group
                gap="xs"
                justify={isMobile ? 'center' : 'flex-start'}
                style={{ maxWidth: isMobile ? 440 : undefined }}
              >
                <Button
                  onClick={() =>
                    window.dispatchEvent(new Event(OPEN_GLOBAL_SEARCH_EVENT))
                  }
                  size={isMobile ? 'md' : 'sm'}
                  fullWidth={isMobile}
                  variant="light"
                  color={accent.primary}
                  className="dt-hero-cta"
                  leftSection={<IoSearch size={16} />}
                  style={{ minHeight: isMobile ? 44 : undefined }}
                >
                  Search the Wiki
                </Button>
                <Group gap={4} visibleFrom="sm">
                  <Text size="xs" style={homeHeroMetaTextStyle}>
                    press
                  </Text>
                  <Kbd size="xs">/</Kbd>
                </Group>
              </Group>
              <Text
                size="xs"
                ta={isMobile ? 'center' : 'left'}
                style={{ ...homeHeroMetaTextStyle, opacity: 0.7, marginTop: 2 }}
              >
                by{' '}
                <Text
                  component="span"
                  inherit
                  fw={600}
                  style={{
                    color: isDark
                      ? `var(--mantine-color-${accent.tertiary}-2)`
                      : `var(--mantine-color-${accent.tertiary}-7)`,
                  }}
                >
                  Litee
                </Text>
                {' · Freya 2'}
              </Text>
            </Stack>
          </Stack>

          {/* Right: quick-nav cards — desktop only */}
          <Box
            visibleFrom="sm"
            className="home-hero-anim-in"
            style={{
              flexShrink: 0,
              position: 'relative',
              animationDelay: '320ms',
            }}
          >
            {/* Ambient glow anchors the card group to the hero palette */}
            <Box
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 320,
                height: 320,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, var(--dt-surface-glow-a) 0%, transparent 68%)',
                opacity: isDark ? 0.55 : 0.4,
                pointerEvents: 'none',
              }}
            />
            <Stack gap="sm" style={{ width: 230, position: 'relative' }}>
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                style={{
                  ...homeHeroMetaTextStyle,
                  letterSpacing: '0.08em',
                  opacity: 0.5,
                  paddingLeft: 2,
                }}
              >
                Explore the Wiki
              </Text>
              {HERO_NAV_ITEMS.map((item, idx) => (
                <InteractiveSurface
                  key={item.to}
                  component={Link}
                  to={item.to}
                  p="md"
                  radius="lg"
                  withBorder={false}
                  style={{
                    ...homeHeroNavCardStyle,
                    textDecoration: 'none',
                  }}
                >
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                      variant="light"
                      color={HERO_ACCENT_CYCLE[idx]}
                      size="lg"
                      radius="md"
                      style={{ flexShrink: 0 }}
                    >
                      <item.Icon size={18} />
                    </ThemeIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        size="sm"
                        fw={600}
                        lh={1.2}
                        style={{
                          color: isDark
                            ? 'var(--mantine-color-gray-1)'
                            : 'var(--mantine-color-dark-7)',
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text size="xs" c="dimmed" lh={1.3} mt={2}>
                        {item.tagline}
                      </Text>
                    </Box>
                    <IoChevronForward
                      size={14}
                      style={{ flexShrink: 0, opacity: 0.35 }}
                    />
                  </Group>
                </InteractiveSurface>
              ))}
            </Stack>
          </Box>
        </Group>
      </Container>

      {/* Smooth fade into page background — only when no banner image is present */}
      {!selectedBanner && (
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background:
              'linear-gradient(to bottom, transparent, var(--mantine-color-body))',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}
    </FullBleedSection>
  );
}
