import { getOracleScrollVideo } from '@/assets';
import RegionBadges from '@/components/ui/RegionBadges';
import ChangeHistory from '@/components/common/ChangeHistory';
import DetailPageHero from '@/components/common/DetailPageHero';
import DetailPageNavigation from '@/components/common/DetailPageNavigation';
import DetailPageTitle from '@/components/common/DetailPageTitle';
import LastUpdated from '@/components/common/LastUpdated';
import { DetailPageLoading } from '@/components/layout/PageLoadingSkeleton';
import SectionJumpNav from '@/components/layout/SectionJumpNav';
import PageFetchError from '@/components/ui/PageFetchError';
import EntityNotFound from '@/components/ui/EntityNotFound';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import QualityIcon from '@/components/ui/QualityIcon';
import { QUALITY_COLOR } from '@/constants/quality';
import { RELIC_TYPE_ORDER } from '@/constants/relic-colors';
import { getRelicTypeOrder } from '@/features/wiki/relics/utils';
import OracleScrollRelicCard from '@/features/wiki/relics/components/OracleScrollRelicCard';
import type { OracleScrollRef } from '@/features/wiki/relics/types';
import {
  useRelicChanges,
  useRelics,
  useStatusEffects,
} from '@/features/wiki/hooks/use-wiki-data';
import {
  useAdjacentItems,
  useDarkMode,
  useGradientAccent,
  useMobileTooltip,
} from '@/hooks';
import {
  findEntityByParam,
  shouldRedirectToEntitySlug,
} from '@/utils/entity-slug';
import IllustrationPreviewCard from '@/components/common/IllustrationPreviewCard';
import IllustrationPreviewModal from '@/components/common/IllustrationPreviewModal';
import type { Illustration } from '@/assets';
import {
  Badge,
  Box,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PAGE_WIDTH } from '@/constants/ui';

function getRelicGroupSectionId(type: string) {
  return `relics-${type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export default function OracleScrollPage() {
  const { accent } = useGradientAccent();
  const { scrollName } = useParams<{ scrollName: string }>();
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const tooltipProps = useMobileTooltip();
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: relics, loading, error, retry } = useRelics();
  const { data: changesData } = useRelicChanges();
  const { data: statusEffects } = useStatusEffects();

  // All distinct oracle scrolls, sorted by name
  const oracleScrolls = useMemo(() => {
    const bySlug = new Map<string, OracleScrollRef>();
    for (const relic of relics) {
      if (relic.oracle_scroll)
        bySlug.set(relic.oracle_scroll.slug, relic.oracle_scroll);
    }
    return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [relics]);

  const currentScroll = useMemo(
    () => findEntityByParam(oracleScrolls, scrollName, (s) => s.slug),
    [oracleScrolls, scrollName],
  );

  useEffect(() => {
    if (!currentScroll || !scrollName) return;
    if (!shouldRedirectToEntitySlug(scrollName, currentScroll.slug)) return;
    navigate(`/oracle-scrolls/${currentScroll.slug}`, { replace: true });
  }, [currentScroll, navigate, scrollName]);

  const scrollRelics = useMemo(() => {
    if (!currentScroll) return [];
    return relics
      .filter((r) => r.oracle_scroll?.slug === currentScroll.slug)
      .sort((a, b) => {
        const typeCmp =
          getRelicTypeOrder(a.type, RELIC_TYPE_ORDER) -
          getRelicTypeOrder(b.type, RELIC_TYPE_ORDER);
        if (typeCmp !== 0) return typeCmp;
        return a.name.localeCompare(b.name);
      });
  }, [relics, currentScroll]);

  const scrollRelicsByType = useMemo(() => {
    return RELIC_TYPE_ORDER.map((type) => ({
      type,
      relics: scrollRelics.filter((relic) => relic.type === type),
    })).filter((group) => group.relics.length > 0);
  }, [scrollRelics]);

  const jumpSections = useMemo(
    () => [
      ...scrollRelicsByType.map((group) => ({
        id: getRelicGroupSectionId(group.type),
        label: group.type,
      })),
      { id: 'oracle-scroll-history', label: 'History' },
    ],
    [scrollRelicsByType],
  );

  const { previousItem, nextItem } = useAdjacentItems(
    oracleScrolls,
    currentScroll,
    (entry) => ({
      label: entry.name,
      path: `/oracle-scrolls/${entry.slug}`,
    }),
  );

  const lastUpdated = useMemo(
    () =>
      scrollRelics.reduce(
        (latest, r) => Math.max(latest, r.last_updated ?? 0),
        0,
      ),
    [scrollRelics],
  );

  // All relics in a scroll share the same quality — use the first one for the hero color
  const heroQualityColor = useMemo(() => {
    if (!scrollRelics.length) return accent.primary;
    return QUALITY_COLOR[scrollRelics[0].quality] ?? accent.primary;
  }, [scrollRelics, accent.primary]);

  if (loading) {
    return <DetailPageLoading />;
  }

  if (error) {
    return (
      <PageFetchError
        title="Could not load relics"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  if (!currentScroll || scrollRelics.length === 0) {
    return (
      <EntityNotFound
        entityType="Oracle Scroll"
        name={scrollName}
        backLabel="Back to Relics"
        backPath="/relics?tab=oracle-scrolls"
      />
    );
  }

  const illustrationSrc = getOracleScrollVideo(currentScroll.slug);

  // Collect per-relic change histories to display alongside the scroll
  const relicHistories = scrollRelics
    .filter((r) => changesData[r.slug])
    .map((r) => ({ label: r.name, history: changesData[r.slug] }));

  return (
    <Box>
      <DetailPageHero
        isDark={isDark}
        qualityColor={heroQualityColor}
        breadcrumbItems={[
          { label: 'Relics', path: '/relics' },
          { label: 'Oracle Scrolls', path: '/relics?tab=oracle-scrolls' },
          { label: currentScroll.name },
        ]}
      >
        <Stack gap={6}>
          <Group gap="sm" align="center" wrap="wrap">
            <DetailPageTitle>{currentScroll.name}</DetailPageTitle>
            <QualityIcon quality={scrollRelics[0].quality} size={32} />
            <RegionBadges
              isGlobal={
                !scrollRelics.every((relic) => relic.is_global === false)
              }
              machineTranslated={scrollRelics.some(
                (relic) => relic.machine_translated,
              )}
              context="detail"
            />
            <Badge variant="light" color={accent.secondary} size="lg">
              {scrollRelics.length} relic
              {scrollRelics.length !== 1 ? 's' : ''}
            </Badge>
          </Group>
          <LastUpdated timestamp={lastUpdated} />
        </Stack>
      </DetailPageHero>

      {illustrationSrc && (
        <IllustrationPreviewModal
          opened={previewOpen}
          onClose={() => setPreviewOpen(false)}
          entityName={currentScroll.name}
          illustrations={[
            {
              name: currentScroll.name,
              src: illustrationSrc,
              type: 'video',
            } satisfies Illustration,
          ]}
          tooltipProps={tooltipProps}
        />
      )}

      <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
        <SectionJumpNav sections={jumpSections} hiddenFrom="md" />
        <ErrorBoundary
          scope="section"
          name="oracle scroll details"
          resetKeys={[currentScroll.slug]}
        >
          <Stack gap="lg">
            {illustrationSrc && (
              <IllustrationPreviewCard
                src={illustrationSrc}
                name={currentScroll.name}
                type="video"
                accentColor={accent.primary}
                onExpand={() => setPreviewOpen(true)}
              />
            )}

            {scrollRelicsByType.map((group) => (
              <Stack
                key={group.type}
                id={getRelicGroupSectionId(group.type)}
                gap="md"
              >
                <Title order={2} size="h3">
                  {group.type}
                </Title>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {group.relics.map((relic) => (
                    <OracleScrollRelicCard
                      key={relic.name}
                      relic={relic}
                      isDark={isDark}
                      statusEffects={statusEffects}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            ))}
          </Stack>
        </ErrorBoundary>

        {relicHistories.length > 0 && (
          <Box id="oracle-scroll-history">
            <ChangeHistory
              history={undefined}
              extraHistories={relicHistories}
            />
          </Box>
        )}

        <DetailPageNavigation previousItem={previousItem} nextItem={nextItem} />
      </Container>
    </Box>
  );
}
