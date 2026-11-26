import RegionBadges from '@/components/ui/RegionBadges';
import { Link } from 'react-router';
import {
  Badge,
  Group,
  ScrollArea,
  SimpleGrid,
  Table,
  Text,
} from '@mantine/core';
import ExpandableText from '@/components/ui/ExpandableText';
import SafeImage from '@/components/ui/SafeImage';
import { getRelicIcon } from '@/assets';
import RichText from '@/components/common/RichText';
import type { ChipFilterGroup } from '@/components/common/EntityFilter';
import EntityFilter from '@/components/common/EntityFilter';
import {
  FilterChipGroup,
  FilterSection,
} from '@/components/common/FilterControls';
import EntitySummaryCard from '@/components/common/EntitySummaryCard';
import EntityTableLinkCell from '@/components/common/EntityTableLinkCell';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import SortableTh from '@/components/ui/SortableTh';
import QualityIcon from '@/components/ui/QualityIcon';
import RelicTypeTag from '@/features/wiki/relics/components/RelicTypeTag';
import type { RelicFilters } from '@/features/wiki/relics/filters';
import type { Relic } from '@/features/wiki/relics/types';
import { IMAGE_SIZE, CARD_GRID_COLS } from '@/constants/ui';
import { getMinWidthStyle } from '@/constants/styles';
import type { ViewMode } from '@/hooks';
import type { StatusEffect } from '@/features/wiki/status-effects/types';
import { useGradientAccent, useIsMobile } from '@/hooks';

interface RelicsTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  relics: Relic[];
  filtered: Relic[];
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
  filters: RelicFilters;
  onFiltersChange: (filters: RelicFilters) => void;
  filterGroups: ChipFilterGroup[];
  sortCol: string | null;
  sortDir: 'asc' | 'desc';
  onSort: (col: string) => void;
  pageItems: Relic[];
  statusEffects: StatusEffect[];
}

export default function RelicsTab({
  loading,
  error,
  onRetry,
  relics,
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
  statusEffects,
}: RelicsTabProps) {
  const { accent } = useGradientAccent();
  const isMobile = useIsMobile();

  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Could not load relics"
      hasData={relics.length > 0}
      emptyMessage="No relic data available yet."
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
        search={filters.search}
        onSearchChange={(value) =>
          onFiltersChange({ ...filters, search: value })
        }
        searchPlaceholder="Search by name, oracle scroll, or lore..."
        count={filtered.length}
        noun="relic"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        filterCount={activeFilterCount}
        filterOpen={filterOpen}
        onFilterToggle={onFilterToggle}
        onResetFilters={onResetFilters}
        emptyMessage="No relics match the current filters."
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
            beforeGroups={
              <FilterSection label="Oracle Scroll">
                <FilterChipGroup
                  value={filters.oracleScrollMembership}
                  onChange={(values) =>
                    onFiltersChange({
                      ...filters,
                      oracleScrollMembership:
                        values.length === 0
                          ? []
                          : [
                              values[
                                values.length - 1
                              ] as RelicFilters['oracleScrollMembership'][number],
                            ],
                    })
                  }
                  size={isMobile ? 'md' : 'xs'}
                  options={[
                    { value: 'member', label: 'Member' },
                    { value: 'none', label: 'Not a member' },
                  ]}
                />
              </FilterSection>
            }
          />
        }
        gridContent={
          <SimpleGrid cols={CARD_GRID_COLS} spacing="md">
            {pageItems.map((item) => {
              const iconSrc = getRelicIcon(item.slug, item.quality);
              const oracleScroll = item.oracle_scroll;
              return (
                <EntitySummaryCard
                  key={item.slug}
                  to={
                    oracleScroll ? `/oracle-scrolls/${oracleScroll.slug}` : null
                  }
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
                      <RelicTypeTag type={item.type} />
                      {oracleScroll && (
                        <Badge
                          variant="light"
                          size="sm"
                          color={accent.secondary}
                        >
                          {oracleScroll.name}
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
                    sortKey="rarity"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Rarity
                  </SortableTh>
                  <SortableTh
                    sortKey="oracle"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Oracle Scroll
                  </SortableTh>
                  <Table.Th>Lore</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pageItems.map((item) => {
                  const iconSrc = getRelicIcon(item.slug, item.quality);
                  const oracleScroll = item.oracle_scroll;
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
                      {oracleScroll ? (
                        <EntityTableLinkCell
                          to={`/oracle-scrolls/${oracleScroll.slug}`}
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
                      ) : (
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <Text fw={600} size="sm">
                              {item.name}
                            </Text>
                            <RegionBadges
                              isGlobal={item.is_global}
                              machineTranslated={item.machine_translated}
                            />
                          </Group>
                        </Table.Td>
                      )}
                      <Table.Td>
                        <RelicTypeTag type={item.type} />
                      </Table.Td>
                      <Table.Td>
                        {item.quality && <QualityIcon quality={item.quality} />}
                      </Table.Td>
                      <Table.Td>
                        {oracleScroll ? (
                          <Badge
                            component={Link}
                            to={`/oracle-scrolls/${oracleScroll.slug}`}
                            variant="light"
                            size="sm"
                            color={accent.secondary}
                            style={{
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            {oracleScroll.name}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <ExpandableText size="sm">
                          <RichText
                            text={item.lore}
                            statusEffects={statusEffects}
                            italic
                          />
                        </ExpandableText>
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
