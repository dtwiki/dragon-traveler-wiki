import { Link } from 'react-router';
import { Badge, Group, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { InteractiveSurface } from '@/components/ui/Surface';
import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';
import ListPageShell from '@/components/layout/ListPageShell';
import { CardGridLoading } from '@/components/layout/PageLoadingSkeleton';
import SearchableGridPanel from '@/components/layout/SearchableGridPanel';
import HowlkinBadge from '@/features/wiki/howlkins/components/HowlkinBadge';
import type { GoldenAlliance, Howlkin } from '@/features/wiki/howlkins/types';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import { useGradientAccent, useIsMobile } from '@/hooks';
import { compareQuality } from '@/utils/quality';
import { CARD_GRID_COLS } from '@/constants/ui';

interface GoldenAlliancesTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  goldenAlliances: GoldenAlliance[];
  search: string;
  onSearchChange: (value: string) => void;
  filtered: GoldenAlliance[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageItems: GoldenAlliance[];
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (pageSize: number) => void;
  howlkinMap: Map<string, Howlkin>;
}

export default function GoldenAlliancesTab({
  loading,
  error,
  onRetry,
  goldenAlliances,
  search,
  onSearchChange,
  filtered,
  page,
  totalPages,
  onPageChange,
  pageItems,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  howlkinMap,
}: GoldenAlliancesTabProps) {
  const isMobile = useIsMobile();
  const { accent } = useGradientAccent();

  const renderEffectStats = (stats: string[]) => (
    <Group gap={4} wrap="wrap">
      {stats.map((stat, i) => (
        <Badge key={i} variant="outline" size="sm" color={accent.secondary}>
          {stat}
        </Badge>
      ))}
    </Group>
  );

  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      hasData={goldenAlliances.length > 0}
      emptyMessage="Golden alliance data hasn't been added yet."
      errorTitle="Could not load golden alliances"
      loadingFallback={<CardGridLoading cardHeight={180} showPagination />}
    >
      <SearchableGridPanel
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name or member..."
        hasResults={filtered.length > 0}
        noResultsTitle="No alliances found"
        noResultsMessage="No alliances match the search."
        onResetSearch={() => onSearchChange('')}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={filtered.length}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      >
        <SimpleGrid cols={CARD_GRID_COLS} spacing="md">
          {pageItems.map((alliance) => (
            <InteractiveSurface
              key={alliance.slug}
              component={Link}
              to={`/howlkins/${alliance.slug}`}
              p={{ base: 'sm', sm: 'md' }}
              style={LINK_BLOCK_RESET_STYLE}
            >
              <Stack gap="sm">
                <Group gap="xs" wrap="nowrap">
                  <Text fw={700} size="lg" className="dt-link-text">
                    {alliance.name}
                  </Text>
                  {alliance.is_global === false && (
                    <GlobalBadge isGlobal={false} size="sm" />
                  )}
                  {alliance.machine_translated && (
                    <MachineTranslatedBadge size="sm" />
                  )}
                </Group>

                <div>
                  <Text size="xs" c="dimmed" fw={600} mb={4}>
                    MEMBERS ({alliance.howlkins.length})
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    {[...alliance.howlkins]
                      .sort((a, b) => {
                        const qualityComparison = compareQuality(
                          howlkinMap.get(a)?.quality,
                          howlkinMap.get(b)?.quality,
                        );
                        if (qualityComparison !== 0) return qualityComparison;
                        return a.localeCompare(b);
                      })
                      .map((howlkinSlug) => {
                        const howlkin = howlkinMap.get(howlkinSlug);
                        if (!howlkin) return null;
                        return (
                          <HowlkinBadge
                            key={howlkinSlug}
                            name={howlkin.name}
                            howlkin={howlkin}
                            interactive={false}
                          />
                        );
                      })}
                  </Group>
                </div>

                <div>
                  <Text size="xs" c="dimmed" fw={600} mb={4}>
                    ALLIANCE EFFECTS
                  </Text>
                  {isMobile ? (
                    <Stack gap={6}>
                      {alliance.effects.map((effect) => (
                        <Group
                          key={effect.level}
                          gap="xs"
                          wrap="nowrap"
                          align="flex-start"
                        >
                          <Badge
                            variant="light"
                            size="sm"
                            color={accent.secondary}
                            w={36}
                            style={{ flexShrink: 0 }}
                          >
                            {effect.level}
                          </Badge>
                          {renderEffectStats(effect.stats)}
                        </Group>
                      ))}
                    </Stack>
                  ) : (
                    <Table withTableBorder withColumnBorders>
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
                                size="sm"
                                color={accent.secondary}
                              >
                                {effect.level}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              {renderEffectStats(effect.stats)}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </div>
              </Stack>
            </InteractiveSurface>
          ))}
        </SimpleGrid>
      </SearchableGridPanel>
    </ListPageShell>
  );
}
