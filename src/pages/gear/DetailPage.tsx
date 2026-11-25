import RichText from '@/components/common/RichText';
import RegionBadges from '@/components/ui/RegionBadges';
import ChangeHistory from '@/components/common/ChangeHistory';
import DetailPageHero from '@/components/common/DetailPageHero';
import DetailPageNavigation from '@/components/common/DetailPageNavigation';
import DetailPageTitle from '@/components/common/DetailPageTitle';
import LastUpdated from '@/components/common/LastUpdated';
import { DetailPageLoading } from '@/components/layout/PageLoadingSkeleton';
import PageFetchError from '@/components/ui/PageFetchError';
import EntityNotFound from '@/components/ui/EntityNotFound';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import QualityIcon from '@/components/ui/QualityIcon';
import { GEAR_TYPE_ORDER } from '@/constants/gear-colors';
import { QUALITY_COLOR } from '@/constants/quality';
import { getLoreGlassStyles } from '@/constants/glass';
import { StaticSurface } from '@/components/ui/Surface';
import CharacterPortrait from '@/features/characters/components/CharacterPortrait';
import {
  getCharacterRouteSlug,
  getCharacterRoutePath,
} from '@/features/characters/utils/character-route';
import GearSetItemCard from '@/features/wiki/gear/components/GearSetItemCard';
import { useCharacters } from '@/features/characters/hooks/use-characters-data';
import {
  useGear,
  useGearChanges,
  useGearSetChanges,
  useGearSets,
  useStatusEffects,
} from '@/features/wiki/hooks/use-wiki-data';
import {
  useAdjacentItems,
  useDarkMode,
  useGradientAccent,
  useMobileTooltip,
} from '@/hooks';
import type { Quality } from '@/types/quality';
import {
  findEntityByParam,
  shouldRedirectToEntitySlug,
} from '@/utils/entity-slug';
import { compareQualityThenName } from '@/utils/quality';
import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PAGE_WIDTH } from '@/constants/ui';

const SSR_AND_ABOVE: Quality[] = ['UR+', 'UR', 'SSR EX', 'SSR+', 'SSR'];
const GEAR_SETS_LIST_PATH = '/gear?tab=gear-sets';

export default function GearSetPage() {
  const { accent } = useGradientAccent();
  const { setName } = useParams<{ setName: string }>();
  const navigate = useNavigate();
  const isDark = useDarkMode();
  const tooltipProps = useMobileTooltip();
  const {
    data: gear,
    loading: gearLoading,
    error: gearError,
    retry: retryGear,
  } = useGear();
  const {
    data: gearSets,
    loading: gearSetsLoading,
    error: gearSetsError,
    retry: retryGearSets,
  } = useGearSets();
  const loading = gearLoading || gearSetsLoading;
  const error = gearError ?? gearSetsError;
  const { data: characters } = useCharacters();
  const { data: changesData } = useGearSetChanges();
  const { data: gearChangesData } = useGearChanges();
  const { data: statusEffects } = useStatusEffects();

  const setData = useMemo(
    () => findEntityByParam(gearSets, setName, (entry) => entry.slug) ?? null,
    [gearSets, setName],
  );

  const decodedSetSlug = setData?.slug ?? setName ?? '';

  useEffect(() => {
    if (!decodedSetSlug || !setName) return;
    if (!shouldRedirectToEntitySlug(setName, decodedSetSlug)) return;
    navigate(`/gear-sets/${decodedSetSlug}`, { replace: true });
  }, [decodedSetSlug, navigate, setName]);

  const setItems = useMemo(() => {
    if (!decodedSetSlug) return [];
    return gear
      .filter((item) => item.set === decodedSetSlug)
      .sort((a, b) => {
        const typeCmp =
          GEAR_TYPE_ORDER.indexOf(a.type) - GEAR_TYPE_ORDER.indexOf(b.type);
        if (typeCmp !== 0) return typeCmp;
        return a.name.localeCompare(b.name);
      });
  }, [decodedSetSlug, gear]);

  const gearItemHistories = useMemo(() => {
    return setItems
      .filter((item) => gearChangesData[item.slug])
      .map((item) => ({
        label: item.name,
        history: gearChangesData[item.slug],
      }));
  }, [setItems, gearChangesData]);

  const setItemSlugs = useMemo(
    () => new Set(setItems.map((i) => i.slug)),
    [setItems],
  );

  const recommendedCharacters = useMemo(() => {
    const ssrChars = characters.filter((c) =>
      SSR_AND_ABOVE.includes(c.quality),
    );

    return ssrChars
      .filter((c) =>
        c.recommended_gear?.some((loadout) =>
          Object.values(loadout.slots).some(
            (slug) => slug && setItemSlugs.has(slug.trim()),
          ),
        ),
      )
      .sort((a, b) =>
        compareQualityThenName(a.quality, b.quality, a.name, b.name),
      );
  }, [characters, setItemSlugs]);

  const recommendedStats = useMemo(() => {
    const ssrChars = characters.filter((c) =>
      SSR_AND_ABOVE.includes(c.quality),
    );
    if (!ssrChars.length) return null;
    return {
      count: recommendedCharacters.length,
      total: ssrChars.length,
      percentage: Math.round(
        (recommendedCharacters.length / ssrChars.length) * 100,
      ),
    };
  }, [characters, recommendedCharacters]);

  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [expandedForSlug, setExpandedForSlug] = useState(decodedSetSlug);
  if (decodedSetSlug !== expandedForSlug) {
    setExpandedForSlug(decodedSetSlug);
    setShowAllCharacters(false);
  }

  // Match list page: sort by slug
  const orderedSets = useMemo(
    () =>
      Array.from(
        new Map(gearSets.map((entry) => [entry.slug, entry])).values(),
      ).sort((a, b) => a.slug.localeCompare(b.slug)),
    [gearSets],
  );

  const { previousItem, nextItem } = useAdjacentItems(
    orderedSets,
    setData,
    (entry) => ({
      label: `${entry.name} Set`,
      path: `/gear-sets/${entry.slug}`,
    }),
  );

  if (loading) {
    return <DetailPageLoading />;
  }

  if (error) {
    return (
      <PageFetchError
        title="Could not load gear"
        message={error.message}
        onRetry={() => {
          if (gearError) retryGear();
          if (gearSetsError) retryGearSets();
        }}
      />
    );
  }

  if (!decodedSetSlug || setItems.length === 0) {
    return (
      <EntityNotFound
        entityType="Gear Set"
        name={setName}
        backLabel="Back to Gear Sets"
        backPath={GEAR_SETS_LIST_PATH}
      />
    );
  }

  const setBonus = setData?.set_bonus ?? setItems[0]?.set_bonus;
  const qualityColor = QUALITY_COLOR[setItems[0].quality];
  const latestItemTimestamp = setItems.reduce(
    (latest, item) => Math.max(latest, item.last_updated ?? 0),
    0,
  );
  const lastUpdatedTimestamp = setData?.last_updated ?? latestItemTimestamp;
  const displayedCharacters = showAllCharacters
    ? recommendedCharacters
    : recommendedCharacters.slice(0, 4);
  const remainingRecommendedCount = Math.max(
    recommendedCharacters.length - 4,
    0,
  );

  return (
    <Box>
      <DetailPageHero
        isDark={isDark}
        qualityColor={qualityColor}
        breadcrumbItems={[
          { label: 'Gear', path: '/gear' },
          { label: 'Gear Sets', path: GEAR_SETS_LIST_PATH },
          { label: setData?.name ?? decodedSetSlug },
        ]}
      >
        <Stack gap={6}>
          <Group gap="sm" align="center" wrap="wrap">
            <DetailPageTitle>
              {setData?.name ?? decodedSetSlug} Set
            </DetailPageTitle>
            <QualityIcon quality={setItems[0].quality} size={32} />
            <RegionBadges
              isGlobal={setData?.is_global}
              machineTranslated={setData?.machine_translated}
              context="detail"
            />
            <Badge variant="light" color={accent.secondary} size="lg">
              {setItems.length} item{setItems.length !== 1 ? 's' : ''}
            </Badge>
          </Group>
          <LastUpdated timestamp={lastUpdatedTimestamp} />
          {recommendedStats !== null && (
            <Text size="sm" c="dimmed">
              Recommended for{' '}
              <Text span fw={600} className="dt-link-text">
                {recommendedStats.count}
              </Text>{' '}
              of {recommendedStats.total} SSR and above characters (
              {recommendedStats.percentage}%)
            </Text>
          )}
        </Stack>

        {setBonus && setBonus.quantity > 0 && (
          <StaticSurface p="md" style={getLoreGlassStyles(isDark)}>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Set Bonus
              </Text>
              <Text size="sm" c="dimmed">
                Activate {setBonus.quantity} piece
                {setBonus.quantity !== 1 ? 's' : ''} to gain{' '}
                <RichText
                  text={setBonus.description}
                  statusEffects={statusEffects}
                />
              </Text>
            </Stack>
          </StaticSurface>
        )}

        {recommendedCharacters.length > 0 && (
          <Stack gap={8}>
            <Text size="sm" fw={600} c={isDark ? 'gray.1' : 'dark.7'}>
              Recommended Characters
            </Text>
            <Group gap="xs" wrap="wrap">
              {displayedCharacters.map((character) => {
                const tooltipLabel = character.name;

                return (
                  <CharacterPortrait
                    key={`${character.name}-${character.quality}`}
                    name={character.name}
                    size={44}
                    quality={character.quality}
                    assetKey={getCharacterRouteSlug(character)}
                    routePath={getCharacterRoutePath(character)}
                    link
                    tooltip={tooltipLabel}
                    tooltipProps={tooltipProps}
                  />
                );
              })}
              {!showAllCharacters && remainingRecommendedCount > 0 && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  onClick={() => setShowAllCharacters(true)}
                >
                  +{remainingRecommendedCount} more
                </Button>
              )}
              {showAllCharacters && recommendedCharacters.length > 4 && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  onClick={() => setShowAllCharacters(false)}
                >
                  Show less
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </DetailPageHero>

      <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
        <ErrorBoundary
          scope="section"
          name="gear set details"
          resetKeys={[decodedSetSlug]}
        >
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {setItems.map((item) => (
                <GearSetItemCard
                  key={item.name}
                  item={item}
                  isDark={isDark}
                  statusEffects={statusEffects}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </ErrorBoundary>

        <ChangeHistory
          history={setData ? changesData[setData.slug] : undefined}
          extraHistories={gearItemHistories}
        />

        <DetailPageNavigation previousItem={previousItem} nextItem={nextItem} />
      </Container>
    </Box>
  );
}
