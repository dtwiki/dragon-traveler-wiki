import {
  Badge,
  Container,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useMemo } from 'react';
import { getStatusEffectIcon } from '@/assets';
import EntityFilter from '@/components/common/EntityFilter';
import EntitySummaryCard from '@/components/common/EntitySummaryCard';
import RichText from '@/components/common/RichText';
import SafeImage from '@/components/ui/SafeImage';
import GlobalBadge from '@/components/ui/GlobalBadge';
import SortableTh from '@/components/ui/SortableTh';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageHeader from '@/components/layout/ListPageHeader';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import ExportButton from '@/components/tools/ExportButton';
import DataCorrectionButton from '@/components/tools/DataCorrectionButton';
import { STATE_COLOR, STATE_ORDER } from '@/constants/status-effect-colors';
import { getMinWidthStyle } from '@/constants/styles';
import {
  STORAGE_KEY,
  PAGE_WIDTH,
  CARD_GRID_COLS,
  IMAGE_SIZE,
} from '@/constants/ui';
import { useStatusEffects } from '@/features/wiki/hooks/use-wiki-data';
import {
  compareStatusEffects,
  EMPTY_STATUS_EFFECT_FILTERS,
  matchesStatusEffectFilters,
} from '@/features/wiki/status-effects/filters';
import { useFilteredPageData, useSearchParamFilter } from '@/hooks';
import type { StatusEffectType } from '@/features/wiki/status-effects/types';
import { getLatestTimestamp } from '@/utils';

export default function StatusEffects() {
  const { data: effects, loading, error, retry } = useStatusEffects();
  const {
    filters,
    setFilters,
    resetFilters,
    filterOpen,
    toggleFilter,
    viewMode,
    setViewMode,
    sortCol,
    sortDir,
    handleSort,
    pageItems,
    filtered,
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    pageSizeOptions,
    activeFilterCount,
  } = useFilteredPageData(effects, {
    emptyFilters: EMPTY_STATUS_EFFECT_FILTERS,
    storageKeys: {
      filters: STORAGE_KEY.STATUS_EFFECT_FILTERS,
      viewMode: STORAGE_KEY.STATUS_EFFECT_VIEW_MODE,
      sort: STORAGE_KEY.STATUS_EFFECT_SORT,
    },
    defaultViewMode: 'list',
    filterFn: matchesStatusEffectFilters,
    sortFn: compareStatusEffects,
  });
  useSearchParamFilter(setFilters);

  const filterGroups = useMemo(() => {
    const typeSet = new Set(effects.map((e) => e.type));
    const options = STATE_ORDER.filter((t) => typeSet.has(t));
    const extra = [...typeSet]
      .filter((t) => !STATE_ORDER.includes(t as StatusEffectType))
      .sort();
    return [{ key: 'types', label: 'Type', options: [...options, ...extra] }];
  }, [effects]);

  const mostRecentUpdate = useMemo(
    () => getLatestTimestamp(effects),
    [effects],
  );

  return (
    <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="md">
        <ListPageHeader title="Status Effects" timestamp={mostRecentUpdate}>
          <Group gap="xs">
            <ExportButton data={effects} filename="status-effects.json" />
            <DataCorrectionButton entityType="status effect" />
          </Group>
        </ListPageHeader>

        <ListPageShell
          loading={loading}
          error={error}
          onRetry={retry}
          errorTitle="Could not load status effects"
          hasData={effects.length > 0}
          emptyMessage="No status effect data available yet."
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
            noun="status effect"
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterCount={activeFilterCount}
            filterOpen={filterOpen}
            onFilterToggle={toggleFilter}
            onResetFilters={resetFilters}
            filterContent={
              <EntityFilter
                groups={filterGroups}
                selected={{ types: filters.types }}
                onChange={(key, values) =>
                  setFilters({
                    ...filters,
                    [key]: values as StatusEffectType[],
                  })
                }
                onClear={resetFilters}
                search={filters.search}
                onSearchChange={(value) =>
                  setFilters({ ...filters, search: value })
                }
                searchPlaceholder="Search by name..."
              />
            }
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={setPageSize}
            gridContent={
              <SimpleGrid cols={CARD_GRID_COLS} spacing="sm">
                {pageItems.map((effect) => {
                  const iconSrc =
                    effect.icon !== false
                      ? getStatusEffectIcon(effect.slug, effect.type)
                      : undefined;
                  return (
                    <EntitySummaryCard
                      key={effect.slug}
                      title={effect.name}
                      imageSrc={iconSrc}
                      imageSize={IMAGE_SIZE.CARD_ICON_SM}
                      reserveImageSpace
                      titleAccessory={
                        effect.is_global === false && (
                          <GlobalBadge isGlobal={false} size="xs" />
                        )
                      }
                      metadata={
                        <Badge
                          variant="light"
                          color={STATE_COLOR[effect.type]}
                          size="sm"
                          w="fit-content"
                        >
                          {effect.type}
                        </Badge>
                      }
                      description={
                        <Stack gap={4}>
                          <RichText
                            text={effect.effect}
                            statusEffects={effects}
                          />
                          {effect.remark && (
                            <Text size="xs" c="dimmed" fs="italic">
                              {effect.remark}
                            </Text>
                          )}
                        </Stack>
                      }
                    />
                  );
                })}
              </SimpleGrid>
            }
            tableContent={
              <ScrollArea type="auto" scrollbarSize={6} offsetScrollbars>
                <Table striped highlightOnHover style={getMinWidthStyle(720)}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Icon</Table.Th>
                      <SortableTh
                        sortKey="name"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Name
                      </SortableTh>
                      <SortableTh
                        sortKey="type"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Type
                      </SortableTh>
                      <Table.Th>Effect</Table.Th>
                      <Table.Th>Remark</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pageItems.map((effect) => {
                      const iconSrc =
                        effect.icon !== false
                          ? getStatusEffectIcon(effect.slug, effect.type)
                          : undefined;
                      return (
                        <Table.Tr key={effect.slug}>
                          <Table.Td>
                            <SafeImage
                              src={iconSrc}
                              alt={effect.name}
                              w={IMAGE_SIZE.PORTRAIT_SM}
                              h={IMAGE_SIZE.PORTRAIT_SM}
                              fit="contain"
                              loading="lazy"
                            />
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <Text fw={600} size="sm">
                                {effect.name}
                              </Text>
                              {effect.is_global === false && (
                                <GlobalBadge isGlobal={false} size="xs" />
                              )}
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant="light"
                              color={STATE_COLOR[effect.type]}
                              size="sm"
                            >
                              {effect.type}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <RichText
                              text={effect.effect}
                              statusEffects={effects}
                            />
                          </Table.Td>
                          <Table.Td>
                            {effect.remark ? (
                              <Text
                                size="xs"
                                c="dimmed"
                                fs="italic"
                                lineClamp={3}
                              >
                                {effect.remark}
                              </Text>
                            ) : (
                              <Text size="xs" c="dimmed">
                                -
                              </Text>
                            )}
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
      </Stack>
    </Container>
  );
}
