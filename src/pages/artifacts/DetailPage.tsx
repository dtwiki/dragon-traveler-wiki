import SafeImage from '@/components/ui/SafeImage';
import { getArtifactIcon } from '@/assets';
import ChangeHistory from '@/components/common/ChangeHistory';
import DetailPageHero from '@/components/common/DetailPageHero';
import DetailPageNavigation from '@/components/common/DetailPageNavigation';
import DetailPageTitle from '@/components/common/DetailPageTitle';
import LastUpdated from '@/components/common/LastUpdated';
import RichText from '@/components/common/RichText';
import { DetailPageLoading } from '@/components/layout/PageLoadingSkeleton';
import SectionJumpNav from '@/components/layout/SectionJumpNav';
import PageFetchError from '@/components/ui/PageFetchError';
import EntityNotFound from '@/components/ui/EntityNotFound';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import FactionTag from '@/components/ui/FactionTag';
import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';
import QualityIcon from '@/components/ui/QualityIcon';
import { QUALITY_COLOR } from '@/constants/quality';
import { getLoreGlassStyles } from '@/constants/glass';
import { getHeroIconBoxStyles } from '@/constants/detail-styles';
import { StaticSurface } from '@/components/ui/Surface';
import { IMAGE_SIZE, PAGE_WIDTH } from '@/constants/ui';
import EffectTable from '@/features/wiki/artifacts/components/EffectTable';
import TreasureCard from '@/features/wiki/artifacts/components/TreasureCard';
import {
  useArtifactChanges,
  useArtifacts,
  useStatusEffects,
} from '@/features/wiki/hooks/use-wiki-data';
import {
  useAdjacentItems,
  useDarkMode,
  useFactions,
  useGradientAccent,
} from '@/hooks';
import {
  findEntityByParam,
  shouldRedirectToEntitySlug,
} from '@/utils/entity-slug';
import { compareQualityThenName } from '@/utils/quality';
import {
  Badge,
  Box,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

function getTreasureSectionId(treasureName: string) {
  return `treasure-${treasureName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export default function ArtifactPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { accent } = useGradientAccent();
  const isDark = useDarkMode();

  const { data: artifacts, loading, error, retry } = useArtifacts();
  const { data: statusEffects } = useStatusEffects();
  const { data: factions } = useFactions();
  const { data: changesData } = useArtifactChanges();

  const artifact = useMemo(() => {
    return findEntityByParam(artifacts, name, (a) => a.slug);
  }, [artifacts, name]);

  useEffect(() => {
    if (!artifact || !name) return;
    if (!shouldRedirectToEntitySlug(name, artifact.slug)) return;
    navigate(`/artifacts/${artifact.slug}`, { replace: true });
  }, [artifact, name, navigate]);

  // Match list page: sort by quality, then name
  const orderedArtifacts = useMemo(
    () =>
      [...artifacts].sort((a, b) =>
        compareQualityThenName(a.quality, b.quality, a.name, b.name),
      ),
    [artifacts],
  );

  const recommendingFactions = useMemo(() => {
    if (!artifact) return [];
    return factions.filter((f) =>
      f.recommended_artifacts.some((a) => a === artifact.slug),
    );
  }, [factions, artifact]);

  const { previousItem, nextItem } = useAdjacentItems(
    orderedArtifacts,
    artifact,
    (entry) => ({
      label: entry.name,
      path: `/artifacts/${entry.slug}`,
      iconSrc: getArtifactIcon(entry.slug),
    }),
  );

  const jumpSections = useMemo(
    () => [
      { id: 'artifact-effects', label: 'Effects' },
      ...(artifact?.treasures ?? []).map((treasure) => ({
        id: getTreasureSectionId(treasure.name),
        label: treasure.name,
      })),
      { id: 'artifact-history', label: 'History' },
    ],
    [artifact],
  );

  if (loading) {
    return <DetailPageLoading />;
  }

  if (error) {
    return (
      <PageFetchError
        title="Could not load artifacts"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  if (!artifact) {
    return (
      <EntityNotFound
        entityType="Artifact"
        name={name}
        backLabel="Back to Artifacts"
        backPath="/artifacts"
      />
    );
  }

  const iconSrc = getArtifactIcon(artifact.slug);
  const qualityColor = QUALITY_COLOR[artifact.quality];

  return (
    <Box>
      <DetailPageHero
        isDark={isDark}
        qualityColor={qualityColor}
        breadcrumbItems={[
          { label: 'Artifacts', path: '/artifacts' },
          { label: artifact.name },
        ]}
      >
        <Group gap="lg" align="flex-start" wrap="nowrap">
          {iconSrc && (
            <Box style={getHeroIconBoxStyles(isDark, qualityColor)}>
              <SafeImage
                src={iconSrc}
                alt={artifact.name}
                w={IMAGE_SIZE.DETAIL_ICON}
                h={IMAGE_SIZE.DETAIL_ICON}
                fit="contain"
                radius="sm"
              />
            </Box>
          )}

          <Stack gap={6} style={{ flex: 1 }}>
            <Group gap="sm" align="center">
              <DetailPageTitle>{artifact.name}</DetailPageTitle>
              <QualityIcon quality={artifact.quality} size={32} />
              {artifact.is_global === false && (
                <GlobalBadge isGlobal={false} size="lg" />
              )}
              {artifact.machine_translated && (
                <MachineTranslatedBadge size="lg" />
              )}
            </Group>
            <LastUpdated timestamp={artifact.last_updated} />
            <Group gap="sm" mt={4}>
              <Badge size="lg" variant="light" color={accent.secondary}>
                {artifact.rows}x{artifact.columns}
              </Badge>
              <Badge size="lg" variant="light" color={accent.tertiary}>
                {artifact.treasures.length} treasure
                {artifact.treasures.length !== 1 ? 's' : ''}
              </Badge>
            </Group>
            {recommendingFactions.length > 0 && (
              <Group gap="xs" mt={2}>
                <Text size="sm" c="dimmed">
                  Recommended by:
                </Text>
                {recommendingFactions.map((f) => (
                  <FactionTag key={f.slug} faction={f.slug} size="sm" />
                ))}
              </Group>
            )}
          </Stack>
        </Group>

        <StaticSurface p="md" style={getLoreGlassStyles(isDark)}>
          <RichText
            text={artifact.lore}
            statusEffects={statusEffects}
            italic
            lineHeight={1.6}
          />
        </StaticSurface>
      </DetailPageHero>

      <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
        <SectionJumpNav sections={jumpSections} hiddenFrom="md" />
        <ErrorBoundary
          scope="section"
          name="artifact details"
          resetKeys={[artifact.slug]}
        >
          <Stack gap="xl">
            {/* Artifact Effects */}
            <Stack gap="md" id="artifact-effects">
              <Title order={2} size="h3">
                Artifact Effects
              </Title>
              <EffectTable
                effects={artifact.effect}
                statusEffects={statusEffects}
              />
            </Stack>

            {/* Treasures */}
            {artifact.treasures.length > 0 && (
              <Stack gap="md">
                <Group gap="sm">
                  <Title order={2} size="h3">
                    Treasures
                  </Title>
                  <Badge variant="light" color={accent.tertiary} size="sm">
                    {artifact.treasures.length} treasure
                    {artifact.treasures.length !== 1 ? 's' : ''}
                  </Badge>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  {artifact.treasures.map((treasure) => (
                    <TreasureCard
                      key={treasure.name}
                      id={getTreasureSectionId(treasure.name)}
                      treasure={treasure}
                      artifactSlug={artifact.slug}
                      isDark={isDark}
                      qualityColor={qualityColor}
                      statusEffects={statusEffects}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            )}
          </Stack>
        </ErrorBoundary>

        {changesData[artifact.slug] && (
          <Box id="artifact-history">
            <ChangeHistory history={changesData[artifact.slug]} />
          </Box>
        )}

        <DetailPageNavigation previousItem={previousItem} nextItem={nextItem} />
      </Container>
    </Box>
  );
}
