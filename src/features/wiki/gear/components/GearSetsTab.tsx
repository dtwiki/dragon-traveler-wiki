import RegionBadges from '@/components/ui/RegionBadges';
import { Link } from 'react-router';
import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { InteractiveSurface } from '@/components/ui/Surface';
import ListPageShell from '@/components/layout/ListPageShell';
import { CardGridLoading } from '@/components/layout/PageLoadingSkeleton';
import SearchableGridPanel from '@/components/layout/SearchableGridPanel';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import GearTypeTag from '@/features/wiki/gear/components/GearTypeTag';
import type { Gear, GearSet } from '@/features/wiki/gear/types';
import { CARD_GRID_COLS } from '@/constants/ui';
import { useGradientAccent } from '@/hooks';

interface GearSetsTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  gearSets: GearSet[];
  search: string;
  onSearchChange: (value: string) => void;
  filtered: GearSet[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageItems: GearSet[];
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (pageSize: number) => void;
  gearItemsBySet: Map<string, Gear[]>;
}

export default function GearSetsTab({
  loading,
  error,
  onRetry,
  gearSets,
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
  gearItemsBySet,
}: GearSetsTabProps) {
  const { accent } = useGradientAccent();
  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Could not load gear sets"
      hasData={gearSets.length > 0}
      emptyMessage="No gear set data available yet."
      loadingFallback={<CardGridLoading cardHeight={180} showPagination />}
    >
      <SearchableGridPanel
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by set name or bonus..."
        hasResults={filtered.length > 0}
        noResultsTitle="No gear sets found"
        noResultsMessage="No gear sets match the search."
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
          {pageItems.map((set) => {
            const items = gearItemsBySet.get(set.slug) ?? [];
            const setBonus = set.set_bonus;
            const bonusQuantity = setBonus?.quantity ?? 0;
            const bonusDescription = setBonus?.description ?? '';
            return (
              <InteractiveSurface
                key={set.slug}
                component={Link}
                to={`/gear-sets/${set.slug}`}
                p="md"
                style={LINK_BLOCK_RESET_STYLE}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                      <Text fw={700} className="dt-link-text" lineClamp={1}>
                        {set.name}
                      </Text>
                      <RegionBadges
                        isGlobal={set.is_global}
                        machineTranslated={set.machine_translated}
                      />
                    </Group>
                    {bonusQuantity > 0 && (
                      <Badge variant="light" size="sm" color={accent.tertiary}>
                        {bonusQuantity}-piece
                      </Badge>
                    )}
                  </Group>

                  <Text size="sm" c="dimmed">
                    {bonusQuantity > 0
                      ? bonusDescription || 'No set bonus description.'
                      : 'No set bonus.'}
                  </Text>

                  <Group gap="xs" wrap="wrap">
                    <Badge variant="light" size="sm" color={accent.secondary}>
                      {items.length} item
                      {items.length === 1 ? '' : 's'}
                    </Badge>
                    {items.slice(0, 4).map((item) => (
                      <GearTypeTag key={item.name} type={item.type} />
                    ))}
                  </Group>
                </Stack>
              </InteractiveSurface>
            );
          })}
        </SimpleGrid>
      </SearchableGridPanel>
    </ListPageShell>
  );
}
