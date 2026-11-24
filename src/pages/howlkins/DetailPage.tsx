import ChangeHistory from '@/components/common/ChangeHistory';
import DetailPageHero from '@/components/common/DetailPageHero';
import DetailPageNavigation from '@/components/common/DetailPageNavigation';
import DetailPageTitle from '@/components/common/DetailPageTitle';
import LastUpdated from '@/components/common/LastUpdated';
import { DetailPageLoading } from '@/components/layout/PageLoadingSkeleton';
import PageFetchError from '@/components/ui/PageFetchError';
import EntityNotFound from '@/components/ui/EntityNotFound';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import GlobalBadge from '@/components/ui/GlobalBadge';
import AllianceMemberCard from '@/features/wiki/howlkins/components/AllianceMemberCard';
import type { Howlkin } from '@/features/wiki/howlkins/types';
import {
  useGoldenAllianceChanges,
  useGoldenAlliances,
  useHowlkins,
} from '@/features/wiki/hooks/use-wiki-data';
import { useAdjacentItems, useDarkMode, useGradientAccent } from '@/hooks';
import {
  findEntityByParam,
  shouldRedirectToEntitySlug,
} from '@/utils/entity-slug';
import { compareQuality } from '@/utils/quality';
import {
  Badge,
  Box,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Title,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PAGE_WIDTH } from '@/constants/ui';

export default function GoldenAllianceDetailPage() {
  const { accent } = useGradientAccent();
  const { allianceSlug: allianceParam } = useParams<{ allianceSlug: string }>();
  const navigate = useNavigate();
  const isDark = useDarkMode();

  const { data: alliances, loading, error, retry } = useGoldenAlliances();
  const { data: howlkins } = useHowlkins();
  const { data: changesData } = useGoldenAllianceChanges();

  const alliance = useMemo(
    () => findEntityByParam(alliances, allianceParam, (a) => a.slug) ?? null,
    [alliances, allianceParam],
  );

  useEffect(() => {
    if (!alliance || !allianceParam) return;
    if (!shouldRedirectToEntitySlug(allianceParam, alliance.slug)) return;
    navigate(`/howlkins/${alliance.slug}`, { replace: true });
  }, [alliance, allianceParam, navigate]);

  const howlkinMap = useMemo(() => {
    const map = new Map<string, Howlkin>();
    for (const h of howlkins) map.set(h.slug, h);
    return map;
  }, [howlkins]);

  const sortedMembers = useMemo(() => {
    if (!alliance) return [];
    return [...alliance.howlkins].sort((a, b) => {
      const qualityComparison = compareQuality(
        howlkinMap.get(a)?.quality,
        howlkinMap.get(b)?.quality,
      );
      if (qualityComparison !== 0) return qualityComparison;
      return a.localeCompare(b);
    });
  }, [alliance, howlkinMap]);

  const orderedAlliances = useMemo(
    () => [...alliances].sort((a, b) => a.slug.localeCompare(b.slug)),
    [alliances],
  );

  const { previousItem, nextItem } = useAdjacentItems(
    orderedAlliances,
    alliance,
    (entry) => ({
      label: entry.name,
      path: `/howlkins/${entry.slug}`,
    }),
  );

  if (loading) {
    return <DetailPageLoading />;
  }

  if (error) {
    return (
      <PageFetchError
        title="Could not load golden alliances"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  if (!alliance) {
    return (
      <EntityNotFound
        entityType="Golden Alliance"
        name={allianceParam}
        backLabel="Back to Howlkins"
        backPath="/howlkins?tab=golden-alliances"
      />
    );
  }

  return (
    <Box>
      <DetailPageHero
        isDark={isDark}
        qualityColor={accent.primary}
        breadcrumbItems={[
          { label: 'Howlkins', path: '/howlkins' },
          {
            label: 'Golden Alliances',
            path: '/howlkins?tab=golden-alliances',
          },
          { label: alliance.name },
        ]}
      >
        <Stack gap={6}>
          <Group gap="sm" align="center" wrap="wrap">
            <DetailPageTitle>{alliance.name}</DetailPageTitle>
            {alliance.is_global === false && (
              <GlobalBadge isGlobal={false} size="lg" />
            )}
            <Badge variant="light" color={accent.secondary} size="lg">
              {alliance.howlkins.length} member
              {alliance.howlkins.length !== 1 ? 's' : ''}
            </Badge>
          </Group>
          <LastUpdated timestamp={alliance.last_updated} />
        </Stack>
      </DetailPageHero>

      <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
        <ErrorBoundary
          scope="section"
          name="golden alliance details"
          resetKeys={[alliance.slug]}
        >
          <Stack gap="lg">
            <Stack gap="md">
              <Title order={2} size="h3">
                Members
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                {sortedMembers.map((howlkinSlug) => {
                  const howlkin = howlkinMap.get(howlkinSlug);
                  if (!howlkin) return null;
                  return (
                    <AllianceMemberCard
                      key={howlkinSlug}
                      howlkin={howlkin}
                      isDark={isDark}
                    />
                  );
                })}
              </SimpleGrid>
            </Stack>

            <Stack gap="md">
              <Title order={2} size="h3">
                Alliance Effects
              </Title>
              <Box style={{ overflowX: 'auto' }}>
                <Table striped withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 70 }}>Level</Table.Th>
                      <Table.Th>Stats</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {alliance.effects.map((effect) => (
                      <Table.Tr key={effect.level}>
                        <Table.Td>
                          <Badge
                            variant="light"
                            size="md"
                            color={accent.secondary}
                          >
                            {effect.level}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="wrap">
                            {effect.stats.map((stat, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                size="md"
                                color={accent.secondary}
                              >
                                {stat}
                              </Badge>
                            ))}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            </Stack>
          </Stack>
        </ErrorBoundary>

        <ChangeHistory history={changesData[alliance.slug]} />

        <DetailPageNavigation previousItem={previousItem} nextItem={nextItem} />
      </Container>
    </Box>
  );
}
