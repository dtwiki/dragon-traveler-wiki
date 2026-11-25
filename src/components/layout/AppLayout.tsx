import LazyKonamiEasterEgg from '@/components/tools/LazyKonamiEasterEgg';
import LazySearchModal from '@/components/tools/LazySearchModal';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { getGlassStyles } from '@/constants/glass';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import { isDetailRoute, ROUTE_PATH } from '@/constants/route-meta';
import { HEADER_HEIGHT, IMAGE_SIZE, SIDEBAR, TRANSITION } from '@/constants/ui';
import { BannerContext } from '@/contexts';
import {
  useDarkMode,
  useEffectiveNavLayout,
  useIsMobile,
  useSidebar,
} from '@/hooks';
import AppRoutes from '@/routes/AppRoutes';
import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Divider,
  Group,
  Image,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useContext } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { Link, useLocation } from 'react-router';
import BannerBackground from './BannerBackground';
import Footer from './Footer';
import HeaderNav from './HeaderNav';
import Navigation from './Navigation';
import PageTransition from './PageTransition';
import ScrollToTop from './ScrollToTop';
import LazySettingsPanel from './LazySettingsPanel';
import AccountMenu from '@/features/community/AccountMenu';

export default function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const sidebar = useSidebar();
  const isDark = useDarkMode();
  const isMobile = useIsMobile();
  const { effectiveNavLayout } = useEffectiveNavLayout();
  const useHeaderNav = effectiveNavLayout === 'header';
  const { selectedBanner, showOnAllRoutes } = useContext(BannerContext);
  const location = useLocation();
  const isHome = location.pathname === ROUTE_PATH.home;
  const showBanner =
    selectedBanner !== null &&
    (isHome || (showOnAllRoutes && !isDetailRoute(location.pathname)));

  const glassStyles = getGlassStyles(isDark);

  const showLabels = isMobile ? true : sidebar.showLabels;
  const navbarWidth = useHeaderNav
    ? 0
    : isMobile
      ? SIDEBAR.WIDTH_EXPANDED
      : sidebar.effectiveWidth;

  return (
    <AppShell
      header={{
        height: { base: HEADER_HEIGHT.MOBILE, sm: HEADER_HEIGHT.DESKTOP },
      }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: useHeaderNav },
      }}
      padding={{ base: '0px', sm: 'md' }}
      transitionDuration={parseInt(TRANSITION.NORMAL)}
      transitionTimingFunction={TRANSITION.EASE}
      style={{ minHeight: '100dvh' }}
    >
      <AppShell.Header style={glassStyles}>
        <Group
          h="100%"
          px="md"
          wrap="nowrap"
          align="stretch"
          style={{ justifyContent: 'space-between' }}
        >
          <Group
            gap="sm"
            wrap="nowrap"
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            {!useHeaderNav && (
              <Tooltip
                label={
                  sidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                position="right"
              >
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={sidebar.toggle}
                  aria-label="Toggle sidebar"
                  visibleFrom="sm"
                >
                  {sidebar.isCollapsed ? (
                    <IoChevronForward size={IMAGE_SIZE.ICON_LG} />
                  ) : (
                    <IoChevronBack size={IMAGE_SIZE.ICON_LG} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
            <Link
              to="/"
              style={{
                ...LINK_BLOCK_RESET_STYLE,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--mantine-spacing-sm)',
              }}
            >
              <Image
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Dragon Traveler Wiki"
                h={{ base: 32, xs: 40, sm: 48 }}
                w="auto"
                fit="contain"
                style={{ maxWidth: '45vw' }}
              />
              <Title order={3} visibleFrom="sm" className="dt-brand-title">
                Dragon Traveler Wiki
              </Title>
            </Link>
          </Group>

          {useHeaderNav && (
            <>
              <Box
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  minWidth: 0,
                }}
              >
                <HeaderNav />
              </Box>
              <Divider orientation="vertical" my="sm" />
            </>
          )}

          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <AccountMenu />
            <LazySearchModal />
            <LazySettingsPanel />
          </Group>
        </Group>
      </AppShell.Header>

      {!useHeaderNav && (
        <AppShell.Navbar
          p="xs"
          style={{ ...glassStyles, display: 'flex', flexDirection: 'column' }}
          onMouseEnter={() => sidebar.setHovered(true)}
          onMouseLeave={() => sidebar.setHovered(false)}
        >
          <Box style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <Navigation
              onNavigate={closeMobile}
              showLabels={showLabels}
              onExpand={() => sidebar.setCollapsed(false)}
            />
          </Box>
        </AppShell.Navbar>
      )}

      <AppShell.Main
        style={{
          position: 'relative',
          overflow: 'clip',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--mantine-color-body)',
        }}
      >
        {showBanner && <BannerBackground />}
        {/* flex:1 fills remaining Main height so the Footer stays at the bottom */}
        <Box style={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0 }}>
          <PageTransition>
            <ErrorBoundary
              scope="page"
              name="application routes"
              resetKeys={[location.pathname, location.search]}
            >
              <AppRoutes />
            </ErrorBoundary>
          </PageTransition>
        </Box>
        <Footer />
      </AppShell.Main>

      <ScrollToTop />
      <LazyKonamiEasterEgg />
    </AppShell>
  );
}
