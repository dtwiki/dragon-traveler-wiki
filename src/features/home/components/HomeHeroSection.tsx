import { OPEN_GLOBAL_SEARCH_EVENT } from '@/components/tools/LazySearchModal';
import FullBleedSection from '@/components/layout/FullBleedSection';
import {
  HOME_HERO_TITLE_STYLE,
  getHomeHeroMetaTextStyle,
  getHomeHeroPlaceholderGradient,
  getHomeHeroSubtitleStyle,
  getHomeHeroWordmarkStyle,
} from '@/constants/home-styles';
import { IMAGE_SIZE, PAGE_WIDTH } from '@/constants/ui';
import { BannerContext } from '@/contexts';
import { useDarkMode, useGradientAccent, useIsMobile } from '@/hooks';
import {
  Anchor,
  Box,
  Button,
  Badge,
  Container,
  Group,
  Kbd,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IoOpenOutline, IoPeople, IoSearch, IoTrophy } from 'react-icons/io5';
import { Link } from 'react-router';
import { useContext } from 'react';

export default function HomeHeroSection() {
  const isDark = useDarkMode();
  const isMobile = useIsMobile();
  const { accent } = useGradientAccent();
  const { selectedBanner } = useContext(BannerContext);

  const homeHeroWordmarkStyle = getHomeHeroWordmarkStyle(isDark);
  const homeHeroSubtitleStyle = getHomeHeroSubtitleStyle(isDark);
  const homeHeroMetaTextStyle = getHomeHeroMetaTextStyle(isDark);

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
              gap="md"
              className="home-hero-anim-in"
              style={{ width: '100%', maxWidth: 520, animationDelay: '200ms' }}
            >
              {/* Search is the main way into the wiki, so it leads. */}
              <UnstyledButton
                className="dt-hero-search"
                onClick={() =>
                  window.dispatchEvent(new Event(OPEN_GLOBAL_SEARCH_EVENT))
                }
              >
                <IoSearch size={18} aria-hidden />
                <Text component="span" className="dt-hero-search__label">
                  Search characters, relics, skills…
                </Text>
                <Kbd size="xs" visibleFrom="sm" aria-hidden>
                  /
                </Kbd>
              </UnstyledButton>
              <Group
                gap="sm"
                justify={isMobile ? 'center' : 'flex-start'}
                wrap="wrap"
              >
                <Button
                  component={Link}
                  to="/characters"
                  size="md"
                  color={accent.primary}
                  className="dt-hero-cta"
                  leftSection={<IoPeople size={IMAGE_SIZE.ICON_LG} />}
                  style={isMobile ? { flex: 1 } : undefined}
                >
                  {isMobile ? 'Characters' : 'Browse Characters'}
                </Button>
                <Button
                  component={Link}
                  to="/tier-list"
                  size="md"
                  variant="light"
                  color={accent.primary}
                  className="dt-hero-cta"
                  leftSection={<IoTrophy size={IMAGE_SIZE.ICON_LG} />}
                  style={isMobile ? { flex: 1 } : undefined}
                >
                  {isMobile ? 'Tier List' : 'View Tier List'}
                </Button>
              </Group>
              <Text
                size="xs"
                ta={isMobile ? 'center' : 'left'}
                style={{ ...homeHeroMetaTextStyle, opacity: 0.8 }}
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
                {' · Freya 2 · '}
                <Anchor
                  href="https://dt.game-tree.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                  fw={600}
                >
                  Play Dragon Traveler
                  <IoOpenOutline
                    size={11}
                    aria-hidden
                    style={{ marginLeft: 3, verticalAlign: 'middle' }}
                  />
                </Anchor>
              </Text>
            </Stack>
          </Stack>
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
