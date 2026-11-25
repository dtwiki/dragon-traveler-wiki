import RegionBadges from '@/components/ui/RegionBadges';
import { Link } from 'react-router';
import {
  Box,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import SafeImage from '@/components/ui/SafeImage';
import { getHowlkinIcon } from '@/assets';
import type { ChipFilterGroup } from '@/components/common/EntityFilter';
import EntityFilter from '@/components/common/EntityFilter';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import SortableTh from '@/components/ui/SortableTh';
import QualityIcon from '@/components/ui/QualityIcon';
import { InteractiveSurface, StaticSurface } from '@/components/ui/Surface';
import HowlkinStats from '@/features/wiki/howlkins/components/HowlkinStats';
import type { HowlkinFilters } from '@/features/wiki/howlkins/filters';
import type { Howlkin } from '@/features/wiki/howlkins/types';
import { LINK_BLOCK_RESET_STYLE, getMinWidthStyle } from '@/constants/styles';
import { IMAGE_SIZE, CARD_GRID_COLS } from '@/constants/ui';
import type { ViewMode } from '@/hooks';
import { useIsMobile } from '@/hooks';
import {
  FilterChipGroup,
  FilterSection,
} from '@/components/common/FilterControls';

interface HowlkinsTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  howlkins: Howlkin[];
  filtered: Howlkin[];
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
  filters: HowlkinFilters;
  onFiltersChange: (filters: HowlkinFilters) => void;
  filterGroups: ChipFilterGroup[];
  sortCol: string | null;
  sortDir: 'asc' | 'desc';
  onSort: (col: string) => void;
  pageItems: Howlkin[];
  howlkinToAlliance: Map<string, string>;
}

export default function HowlkinsTab({
  loading,
  error,
  onRetry,
  howlkins,
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
  howlkinToAlliance,
}: HowlkinsTabProps) {
  const isMobile = useIsMobile();

  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Could not load howlkins"
      hasData={howlkins.length > 0}
      emptyMessage="No howlkins yet"
      emptyDescription="Howlkin data hasn't been added yet."
      loadingFallback={
        <ViewModeLoading
          viewMode={viewMode}
          cardHeight={180}
          listType="table"
          withToolbar
          showPagination
        />
      }
    >
      <FilteredListShell
        count={filtered.length}
        noun="howlkin"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        filterCount={activeFilterCount}
        filterOpen={filterOpen}
        onFilterToggle={onFilterToggle}
        onResetFilters={onResetFilters}
        emptyMessage="No howlkins match the current filters."
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        filterContent={
          <EntityFilter
            groups={filterGroups}
            selected={{ qualities: filters.qualities }}
            onChange={(key, values) =>
              onFiltersChange({ ...filters, [key]: values })
            }
            onClear={onResetFilters}
            search={filters.search}
            onSearchChange={(value) =>
              onFiltersChange({ ...filters, search: value })
            }
            searchPlaceholder="Search by name..."
            beforeGroups={
              <FilterSection label="Golden Alliance">
                <FilterChipGroup
                  size={isMobile ? 'md' : 'xs'}
                  value={filters.allianceMembership}
                  onChange={(values) =>
                    onFiltersChange({
                      ...filters,
                      allianceMembership:
                        values.length === 0
                          ? []
                          : [
                              values[
                                values.length - 1
                              ] as HowlkinFilters['allianceMembership'][number],
                            ],
                    })
                  }
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
            {pageItems.map((howlkin) => {
              const iconSrc = getHowlkinIcon(howlkin.slug, howlkin.quality);
              const allianceSlug = howlkinToAlliance.get(howlkin.slug);
              const cardContent = (
                <Stack gap="xs">
                  <Group gap="md" align="flex-start" wrap="nowrap">
                    {iconSrc && (
                      <SafeImage
                        src={iconSrc}
                        alt={howlkin.name}
                        w={IMAGE_SIZE.CARD_ICON}
                        h={IMAGE_SIZE.CARD_ICON}
                        fit="contain"
                        radius="sm"
                      />
                    )}
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="sm" wrap="nowrap" align="flex-start">
                        <Text
                          fw={700}
                          className={allianceSlug ? 'dt-link-text' : undefined}
                          lineClamp={2}
                          style={{ minWidth: 0 }}
                        >
                          {howlkin.name}
                        </Text>
                        <Box style={{ flexShrink: 0 }}>
                          <QualityIcon quality={howlkin.quality} />
                        </Box>
                        <RegionBadges
                          isGlobal={howlkin.is_global}
                          machineTranslated={howlkin.machine_translated}
                        />
                      </Group>
                      <Stack gap={2}>
                        {(howlkin.passive_effects ?? []).map((e, i) => (
                          <Text key={i} size="sm" c="dimmed">
                            {e}
                          </Text>
                        ))}
                      </Stack>
                    </Stack>
                  </Group>
                  <HowlkinStats stats={howlkin.basic_stats} />
                </Stack>
              );
              return allianceSlug ? (
                <InteractiveSurface
                  key={howlkin.slug}
                  component={Link}
                  to={`/howlkins/${allianceSlug}`}
                  p={{ base: 'sm', sm: 'md' }}
                  style={LINK_BLOCK_RESET_STYLE}
                >
                  {cardContent}
                </InteractiveSurface>
              ) : (
                <StaticSurface key={howlkin.slug} p={{ base: 'sm', sm: 'md' }}>
                  {cardContent}
                </StaticSurface>
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
                    sortKey="quality"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    Quality
                  </SortableTh>
                  <Table.Th>Basic Stats</Table.Th>
                  <Table.Th>Passive Effects</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pageItems.map((howlkin) => {
                  const iconSrc = getHowlkinIcon(howlkin.slug, howlkin.quality);
                  const allianceSlug = howlkinToAlliance.get(howlkin.slug);
                  return (
                    <Table.Tr key={howlkin.slug}>
                      <Table.Td>
                        {iconSrc && (
                          <SafeImage
                            src={iconSrc}
                            alt={howlkin.name}
                            w={IMAGE_SIZE.PORTRAIT_SM}
                            h={IMAGE_SIZE.PORTRAIT_SM}
                            fit="contain"
                            radius="sm"
                          />
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          {allianceSlug ? (
                            <Text
                              component={Link}
                              to={`/howlkins/${allianceSlug}`}
                              fw={600}
                              size="sm"
                              className="dt-link-text"
                              style={{ textDecoration: 'none' }}
                            >
                              {howlkin.name}
                            </Text>
                          ) : (
                            <Text fw={600} size="sm">
                              {howlkin.name}
                            </Text>
                          )}
                          <RegionBadges
                            isGlobal={howlkin.is_global}
                            machineTranslated={howlkin.machine_translated}
                          />
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <QualityIcon quality={howlkin.quality} />
                      </Table.Td>
                      <Table.Td>
                        <HowlkinStats stats={howlkin.basic_stats} />
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          {(howlkin.passive_effects ?? []).map((e, i) => (
                            <Text key={i} size="sm" c="dimmed">
                              {e}
                            </Text>
                          ))}
                        </Stack>
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
