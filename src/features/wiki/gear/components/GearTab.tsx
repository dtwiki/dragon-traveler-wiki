import RegionBadges from '@/components/ui/RegionBadges';
import ExpandableText from '@/components/ui/ExpandableText';
import SafeImage from '@/components/ui/SafeImage';
import { getGearIcon } from '@/assets';
import RichText from '@/components/common/RichText';
import type { ChipFilterGroup } from '@/components/common/EntityFilter';
import EntityFilter from '@/components/common/EntityFilter';
import EntitySummaryCard from '@/components/common/EntitySummaryCard';
import EntityTableLinkCell from '@/components/common/EntityTableLinkCell';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import SortableTh from '@/components/ui/SortableTh';
import { IMAGE_SIZE, CARD_GRID_COLS } from '@/constants/ui';
import { getMinWidthStyle } from '@/constants/styles';
import QualityIcon from '@/components/ui/QualityIcon';
import GearTypeTag from '@/features/wiki/gear/components/GearTypeTag';
import type { Gear, GearSet } from '@/features/wiki/gear/types';
import type { GearFilters } from '@/features/wiki/gear/filters';
import type { ViewMode } from '@/hooks';
import type { StatusEffect } from '@/features/wiki/status-effects/types';

import {
  Badge,
  Group,
  ScrollArea,
  SimpleGrid,
  Table,
  Text,
} from '@mantine/core';
import { useGradientAccent } from '@/hooks';

interface GearTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  gear: Gear[];
  filtered: Gear[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilterCount: number;
  filterOpen: boolean;
  onFilterToggle: () => void;
  onResetFilters: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (pageSize: number) => void;
  filters: GearFilters;
  onFiltersChange: (filters: GearFilters) => void;
  filterGroups: ChipFilterGroup[];
  sortCol: string | null;
  sortDir: 'asc' | 'desc';
  onSort: (col: string) => void;
  pageItems: Gear[];
  gearSetBySlug: Map<string, GearSet>;
  statusEffects: StatusEffect[];
}

export default function GearTab({
  loading,
  error,
  onRetry,
  gear,
  filtered,
  viewMode,
  onViewModeChange,
  activeFilterCount,
  filterOpen,
  onFilterToggle,
  onResetFilters,
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  filters,
  onFiltersChange,
  filterGroups,
  sortCol,
  sortDir,
  onSort,
  pageItems,
  gearSetBySlug,
  statusEffects,
}: GearTabProps) {
  const { accent } = useGradientAccent();
  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Could not load gear"
      hasData={gear.length > 0}
      emptyMessage="No gear data available yet."
      loadingFallback={
        <ViewModeLoading
          viewMode={viewMode}
          listType="table"
          withToolbar
          showPagination
        />
      }
    >
      <FilteredListShell
        count={filtered.length}
        noun="gear item"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        filterCount={activeFilterCount}
        filterOpen={filterOpen}
        onFilterToggle={onFilterToggle}
        onResetFilters={onResetFilters}
        emptyMessage="No gear matches the current filters."
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        filterContent={
          <EntityFilter
            groups={filterGroups}
            selected={{
              types: filters.types,
              qualities: filters.qualities,
            }}
            onChange={(key, values) =>
              onFiltersChange({ ...filters, [key]: values })
            }
            onClear={onResetFilters}
            search={filters.search}
            onSearchChange={(value) =>
              onFiltersChange({ ...filters, search: value })
            }
            searchPlaceholder="Search by gear or set..."
          />
        }
        gridContent={
          <SimpleGrid cols={CARD_GRID_COLS} spacing="md">
            {pageItems.map((item) => {
              const setData = gearSetBySlug.get(item.set);
              const setBonus = setData?.set_bonus ?? item.set_bonus;
              const iconSrc = getGearIcon(item.type, item.slug);
              return (
                <EntitySummaryCard
                  key={item.slug}
                  to={`/gear-sets/${item.set}`}
                  title={item.name}
                  imageSrc={iconSrc}
                  titleAccessory={
                    <Group gap={6} wrap="nowrap">
                      {item.quality && <QualityIcon quality={item.quality} />}
                      <RegionBadges
                        isGlobal={item.is_global}
                        machineTranslated={item.machine_translated}
                      />
                    </Group>
                  }
                  metadata={
                    <Group gap="xs" wrap="wrap">
                      <GearTypeTag type={item.type} />
                      <Badge variant="light" size="sm" color={accent.secondary}>
                        {setData?.name ?? item.set}
                      </Badge>
                      {setBonus && setBonus.quantity > 0 && (
                        <Badge
                          variant="outline"
                          size="sm"
                          color={accent.tertiary}
                        >
                          {setBonus.quantity}-piece set
                        </Badge>
                      )}
                    </Group>
                  }
                  description={
                    <ExpandableText size="xs">
                      <RichText
                        text={item.lore}
                        statusEffects={statusEffects}
                        italic
                      />
                    </ExpandableText>
                  }
                />
              );
            })}
          </SimpleGrid>
        }
        tableContent={
          <ScrollArea type="auto" scrollbarSize={6} offsetScrollbars>
            <Table striped highlightOnHover style={getMinWidthStyle(800)}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Icon</Table.Th>
                  <SortableTh
                    sortKey="name"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Name
                  </SortableTh>
                  <SortableTh
                    sortKey="type"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Type
                  </SortableTh>
                  <SortableTh
                    sortKey="set"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Set
                  </SortableTh>
                  <SortableTh
                    sortKey="rarity"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Rarity
                  </SortableTh>
                  <Table.Th>Set Bonus</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pageItems.map((item) => {
                  const setData = gearSetBySlug.get(item.set);
                  const setBonus = setData?.set_bonus ?? item.set_bonus;
                  const iconSrc = getGearIcon(item.type, item.slug);
                  return (
                    <Table.Tr key={item.slug}>
                      <Table.Td>
                        {iconSrc && (
                          <SafeImage
                            src={iconSrc}
                            alt={item.name}
                            w={IMAGE_SIZE.PORTRAIT_SM}
                            h={IMAGE_SIZE.PORTRAIT_SM}
                            fit="contain"
                            loading="lazy"
                          />
                        )}
                      </Table.Td>
                      <EntityTableLinkCell
                        to={`/gear-sets/${item.set}`}
                        accessory={
                          item.is_global === false && (
                            <RegionBadges
                              isGlobal={false}
                              machineTranslated={item.machine_translated}
                            />
                          )
                        }
                      >
                        {item.name}
                      </EntityTableLinkCell>
                      <Table.Td>
                        <GearTypeTag type={item.type} />
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          size="sm"
                          color={accent.secondary}
                        >
                          {setData?.name ?? item.set}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {item.quality && <QualityIcon quality={item.quality} />}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {setBonus && setBonus.quantity > 0 ? (
                            <>
                              {setBonus.quantity}-piece:{' '}
                              <RichText
                                text={setBonus.description}
                                statusEffects={statusEffects}
                              />
                            </>
                          ) : (
                            '—'
                          )}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        }
      />
    </ListPageShell>
  );
}
