import SafeImage from '@/components/ui/SafeImage';
import { getNoblePhantasmIcon } from '@/assets';
import ChangeHistory from '@/components/common/ChangeHistory';
import DetailPageHero from '@/components/common/DetailPageHero';
import DetailPageNavigation from '@/components/common/DetailPageNavigation';
import DetailPageTitle from '@/components/common/DetailPageTitle';
import LastUpdated from '@/components/common/LastUpdated';
import { DetailPageLoading } from '@/components/layout/PageLoadingSkeleton';
import PageFetchError from '@/components/ui/PageFetchError';
import EntityNotFound from '@/components/ui/EntityNotFound';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';
import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';
import { StaticSurface } from '@/components/ui/Surface';
import { getHeroIconBoxStyles } from '@/constants/detail-styles';
import { IMAGE_SIZE, PAGE_WIDTH } from '@/constants/ui';
import CharacterTag from '@/features/characters/components/CharacterTag';
import { buildCharacterByIdentityMap } from '@/features/characters/utils/character-route';
import QualityIcon from '@/components/ui/QualityIcon';
import EffectTable from '@/features/wiki/noble-phantasms/components/EffectTable';
import SkillTable from '@/features/wiki/noble-phantasms/components/SkillTable';
import { useCharacters } from '@/features/characters/hooks/use-characters-data';
import {
  useNoblePhantasmChanges,
  useNoblePhantasms,
  useStatusEffects,
} from '@/features/wiki/hooks/use-wiki-data';
import { useAdjacentItems, useDarkMode, useGradientAccent } from '@/hooks';
import {
  findEntityByParam,
  shouldRedirectToEntitySlug,
} from '@/utils/entity-slug';
import { Box, Container, Group, Stack, Title } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IoHourglassOutline } from 'react-icons/io5';

export default function NoblePhantasmPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { accent } = useGradientAccent();
  const isDark = useDarkMode();

  const { data: noblePhantasms, loading, error, retry } = useNoblePhantasms();
  const { data: characters } = useCharacters();
  const { data: statusEffects } = useStatusEffects();
  const { data: changesData } = useNoblePhantasmChanges();

  const noblePhantasm = useMemo(() => {
    return findEntityByParam(
      noblePhantasms,
      name,
      (np) => np.slug,
      (np) => [np.legacy_slug],
    );
  }, [name, noblePhantasms]);

  useEffect(() => {
    if (!noblePhantasm || !name) return;
    if (!shouldRedirectToEntitySlug(name, noblePhantasm.slug)) return;
    navigate(`/noble-phantasms/${noblePhantasm.slug}`, { replace: true });
  }, [name, navigate, noblePhantasm]);

  // Match list page: sort by character, then name
  const orderedNoblePhantasms = useMemo(
    () =>
      [...noblePhantasms].sort((a, b) => {
        const charCmp = (a.character_slug ?? '').localeCompare(
          b.character_slug ?? '',
        );
        if (charCmp !== 0) return charCmp;
        return a.name.localeCompare(b.name);
      }),
    [noblePhantasms],
  );

  const { previousItem, nextItem } = useAdjacentItems(
    orderedNoblePhantasms,
    noblePhantasm,
    (entry) => ({
      label: entry.name,
      path: `/noble-phantasms/${entry.slug}`,
      iconSrc: getNoblePhantasmIcon(entry.slug),
    }),
  );

  const linkedCharacter = useMemo(() => {
    if (!noblePhantasm?.character_slug) return null;
    return buildCharacterByIdentityMap(characters).get(
      noblePhantasm.character_slug,
    );
  }, [characters, noblePhantasm]);

  if (loading) {
    return <DetailPageLoading />;
  }

  if (error) {
    return (
      <PageFetchError
        title="Could not load noble phantasms"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  if (!noblePhantasm) {
    return (
      <EntityNotFound
        entityType="Noble Phantasm"
        name={name}
        backLabel="Back to Noble Phantasms"
        backPath="/noble-phantasms"
      />
    );
  }

  const iconSrc = getNoblePhantasmIcon(noblePhantasm.slug);

  return (
    <Box>
      <DetailPageHero
        isDark={isDark}
        qualityColor={accent.primary}
        secondaryColor={accent.secondary}
        gradientOpacity={{ dark: 0.75, light: 0.95 }}
        breadcrumbItems={[
          { label: 'Noble Phantasms', path: '/noble-phantasms' },
          { label: noblePhantasm.name },
        ]}
      >
        <Group gap="lg" align="flex-start" wrap="nowrap">
          {iconSrc && (
            <Box style={getHeroIconBoxStyles(isDark, accent.primary)}>
              <SafeImage
                src={iconSrc}
                alt={noblePhantasm.name}
                w={IMAGE_SIZE.DETAIL_ICON}
                h={IMAGE_SIZE.DETAIL_ICON}
                fit="contain"
                radius="sm"
              />
            </Box>
          )}

          <Stack gap={6} style={{ flex: 1 }}>
            <Group gap="sm" align="center" wrap="wrap">
              <DetailPageTitle>{noblePhantasm.name}</DetailPageTitle>
              <QualityIcon quality={noblePhantasm.quality} size={32} />
              {noblePhantasm.is_global === false && (
                <GlobalBadge isGlobal={false} size="lg" />
              )}
              {noblePhantasm.machine_translated && (
                <MachineTranslatedBadge size="lg" />
              )}
            </Group>
            <LastUpdated timestamp={noblePhantasm.last_updated} />

            {linkedCharacter && (
              <Group gap="sm" mt={4}>
                <CharacterTag
                  slug={linkedCharacter.slug}
                  color={accent.secondary}
                  size="lg"
                />
              </Group>
            )}
          </Stack>
        </Group>
      </DetailPageHero>

      <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
        <ErrorBoundary
          scope="section"
          name="noble phantasm details"
          resetKeys={[noblePhantasm.slug]}
        >
          <Stack gap="xl">
            {noblePhantasm.effects.length === 0 &&
              noblePhantasm.skills.length === 0 && (
                <StaticSurface p="xl" radius="lg">
                  <EmptyState
                    icon={<IoHourglassOutline size={32} />}
                    title="Noble Phantasm information coming soon"
                    description="This preview currently includes the available artwork and basic details. Effects and skill progression will be added when they become available."
                  />
                </StaticSurface>
              )}
            {noblePhantasm.effects.length > 0 && (
              <Stack gap="md">
                <Title order={2} size="h3">
                  Effects
                </Title>
                <EffectTable
                  effects={noblePhantasm.effects}
                  statusEffects={statusEffects}
                  skills={linkedCharacter?.skills}
                  talent={linkedCharacter?.talent}
                />
              </Stack>
            )}

            {noblePhantasm.skills.length > 0 && (
              <Stack gap="md">
                <Title order={2} size="h3">
                  Skill Progression
                </Title>
                <SkillTable
                  skills={noblePhantasm.skills}
                  statusEffects={statusEffects}
                  characterSkills={linkedCharacter?.skills}
                  talent={linkedCharacter?.talent}
                />
              </Stack>
            )}
          </Stack>
        </ErrorBoundary>

        <ChangeHistory
          history={
            changesData[noblePhantasm.slug] ??
            (noblePhantasm.legacy_slug
              ? changesData[noblePhantasm.legacy_slug]
              : undefined)
          }
        />

        <DetailPageNavigation previousItem={previousItem} nextItem={nextItem} />
      </Container>
    </Box>
  );
}
