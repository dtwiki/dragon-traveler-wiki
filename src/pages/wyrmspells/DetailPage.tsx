import SafeImage from '@/components/ui/SafeImage';
import { getWyrmspellIcon } from '@/assets';
import ChangeHistory from '@/components/common/ChangeHistory';
import DetailPageHero from '@/components/common/DetailPageHero';
import DetailPageNavigation from '@/components/common/DetailPageNavigation';
import DetailPageTitle from '@/components/common/DetailPageTitle';
import LastUpdated from '@/components/common/LastUpdated';
import { DetailPageLoading } from '@/components/layout/PageLoadingSkeleton';
import PageFetchError from '@/components/ui/PageFetchError';
import EntityNotFound from '@/components/ui/EntityNotFound';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import FactionTag from '@/components/ui/FactionTag';
import GlobalBadge from '@/components/ui/GlobalBadge';
import QualityIcon from '@/components/ui/QualityIcon';
import WyrmspellTypeTag from '@/features/wiki/wyrmspells/components/WyrmspellTypeTag';
import { getStableTagColor } from '@/constants/tag-colors';
import { WYRMSPELL_TYPE_COLOR } from '@/constants/wyrmspell-colors';
import { getHeroIconBoxStyles } from '@/constants/detail-styles';
import { IMAGE_SIZE, PAGE_WIDTH } from '@/constants/ui';
import { getMaxQuality } from '@/features/wiki/wyrmspells/types';
import QualitiesTable from '@/features/wiki/wyrmspells/components/QualitiesTable';
import {
  useStatusEffects,
  useWyrmspellChanges,
  useWyrmspells,
} from '@/features/wiki/hooks/use-wiki-data';
import { useAdjacentItems, useDarkMode, useGradientAccent } from '@/hooks';
import {
  findEntityByParam,
  shouldRedirectToEntitySlug,
} from '@/utils/entity-slug';
import { compareQuality } from '@/utils/quality';
import { Box, Container, Group, Stack, Title } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

export default function WyrmspellPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { accent } = useGradientAccent();
  const isDark = useDarkMode();

  const { data: wyrmspells, loading, error, retry } = useWyrmspells();
  const { data: statusEffects } = useStatusEffects();
  const { data: changesData } = useWyrmspellChanges();

  const wyrmspell = useMemo(
    () => findEntityByParam(wyrmspells, name, (w) => w.slug),
    [wyrmspells, name],
  );

  useEffect(() => {
    if (!wyrmspell || !name) return;
    if (!shouldRedirectToEntitySlug(name, wyrmspell.slug)) return;
    navigate(`/wyrmspells/${wyrmspell.slug}`, { replace: true });
  }, [wyrmspell, name, navigate]);

  const orderedWyrmspells = useMemo(
    () =>
      [...wyrmspells].sort((a, b) => {
        const typeCmp = a.type.localeCompare(b.type);
        if (typeCmp !== 0) return typeCmp;
        const qualityComparison = compareQuality(
          getMaxQuality(a)?.quality,
          getMaxQuality(b)?.quality,
        );
        if (qualityComparison !== 0) return qualityComparison;
        return a.name.localeCompare(b.name);
      }),
    [wyrmspells],
  );

  const { previousItem, nextItem } = useAdjacentItems(
    orderedWyrmspells,
    wyrmspell,
    (entry) => ({
      label: entry.name,
      path: `/wyrmspells/${entry.slug}`,
      iconSrc: getWyrmspellIcon(entry.slug, entry.type),
    }),
  );

  if (loading) {
    return <DetailPageLoading />;
  }

  if (error) {
    return (
      <PageFetchError
        title="Could not load wyrmspells"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  if (!wyrmspell) {
    return (
      <EntityNotFound
        entityType="Wyrmspell"
        name={name}
        backLabel="Back to Wyrmspells"
        backPath="/wyrmspells"
      />
    );
  }

  const iconSrc = getWyrmspellIcon(wyrmspell.slug, wyrmspell.type);
  const maxQuality = getMaxQuality(wyrmspell);
  const typeColor =
    WYRMSPELL_TYPE_COLOR[wyrmspell.type] ?? getStableTagColor(wyrmspell.type);

  return (
    <Box>
      <DetailPageHero
        isDark={isDark}
        qualityColor={typeColor}
        secondaryColor={accent.secondary}
        breadcrumbItems={[
          { label: 'Wyrmspells', path: '/wyrmspells' },
          { label: wyrmspell.name },
        ]}
      >
        <Group gap="lg" align="flex-start" wrap="nowrap">
          {iconSrc && (
            <Box style={getHeroIconBoxStyles(isDark, typeColor, true)}>
              <SafeImage
                src={iconSrc}
                alt={wyrmspell.name}
                w={IMAGE_SIZE.DETAIL_ICON}
                h={IMAGE_SIZE.DETAIL_ICON}
                fit="contain"
                radius="sm"
              />
            </Box>
          )}

          <Stack gap={6} style={{ flex: 1 }}>
            <Group gap="sm" align="center">
              <DetailPageTitle>{wyrmspell.name}</DetailPageTitle>
              {maxQuality && (
                <QualityIcon quality={maxQuality.quality} size={32} />
              )}
              {wyrmspell.is_global === false && (
                <GlobalBadge isGlobal={false} size="lg" />
              )}
            </Group>
            <LastUpdated timestamp={wyrmspell.last_updated} />
            <Group gap="sm" mt={4}>
              <WyrmspellTypeTag type={wyrmspell.type} size="lg" />
              {wyrmspell.exclusive_faction && (
                <FactionTag faction={wyrmspell.exclusive_faction} size="md" />
              )}
            </Group>
          </Stack>
        </Group>
      </DetailPageHero>

      <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
        <ErrorBoundary
          scope="section"
          name="wyrmspell details"
          resetKeys={[wyrmspell.slug]}
        >
          <Stack gap="xl">
            <Stack gap="md">
              <Title order={2} size="h3">
                Effects by Quality
              </Title>
              <QualitiesTable
                qualities={wyrmspell.qualities}
                statusEffects={statusEffects}
              />
            </Stack>
          </Stack>
        </ErrorBoundary>

        <ChangeHistory history={changesData[wyrmspell.slug]} />

        <DetailPageNavigation previousItem={previousItem} nextItem={nextItem} />
      </Container>
    </Box>
  );
}
