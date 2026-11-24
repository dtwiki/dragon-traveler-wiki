import ExpandableText from '@/components/ui/ExpandableText';
import SafeImage from '@/components/ui/SafeImage';
import { getWyrmspellIcon, WYRMSPELL_TYPE_ICON_MAP } from '@/assets';
import type { ChipFilterGroup } from '@/components/common/EntityFilter';
import EntityFilter from '@/components/common/EntityFilter';
import EntityTableLinkCell from '@/components/common/EntityTableLinkCell';
import {
  createFactionFilterGroup,
  createQualityFilterGroup,
  orderFilterOptions,
} from '@/components/common/EntityFilterGroups';
import RichText from '@/components/common/RichText';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageHeader from '@/components/layout/ListPageHeader';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import ExportButton from '@/components/tools/ExportButton';
import DataCorrectionButton from '@/components/tools/DataCorrectionButton';
import SortableTh from '@/components/ui/SortableTh';
import { FACTION_SLUGS } from '@/constants/faction-colors';
import { QUALITY_ORDER } from '@/constants/quality';
import { LINK_BLOCK_RESET_STYLE, getMinWidthStyle } from '@/constants/styles';
import { InteractiveSurface } from '@/components/ui/Surface';
import {
  IMAGE_SIZE,
  STORAGE_KEY,
  PAGE_WIDTH,
  CARD_GRID_COLS,
} from '@/constants/ui';
import FactionTag from '@/components/ui/FactionTag';
import QualityIcon from '@/components/ui/QualityIcon';
import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';
import WyrmspellTypeTag from '@/features/wiki/wyrmspells/components/WyrmspellTypeTag';
import {
  compareWyrmspells,
  EMPTY_WYRMSPELL_FILTERS,
  matchesWyrmspellFilters,
  WYRMSPELL_TYPE_FILTER_ORDER,
} from '@/features/wiki/wyrmspells/filters';
import { getMaxQuality } from '@/features/wiki/wyrmspells/types';
import {
  useStatusEffects,
  useWyrmspells,
} from '@/features/wiki/hooks/use-wiki-data';
import { useFilteredPageData } from '@/hooks';
import { getLatestTimestamp } from '@/utils';
import {
  Box,
  Container,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useMemo } from 'react';
import { Link } from 'react-router';

export default function Wyrmspells() {
  const { data: statusEffects } = useStatusEffects();
  const { data: wyrmspells, loading, error, retry } = useWyrmspells();
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
  } = useFilteredPageData(wyrmspells, {
    emptyFilters: EMPTY_WYRMSPELL_FILTERS,
    storageKeys: {
      filters: STORAGE_KEY.WYRMSPELL_FILTERS,
      viewMode: STORAGE_KEY.WYRMSPELL_VIEW_MODE,
      sort: STORAGE_KEY.WYRMSPELL_SORT,
    },
    defaultViewMode: 'grid',
    filterFn: matchesWyrmspellFilters,
    sortFn: compareWyrmspells,
  });

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    for (const spell of wyrmspells) {
      if (spell.type) types.add(spell.type);
    }
    const preferred = WYRMSPELL_TYPE_FILTER_ORDER.filter((type) =>
      types.has(type),
    );
    const extras = [...types]
      .filter((type) => !WYRMSPELL_TYPE_FILTER_ORDER.includes(type as never))
      .sort();
    return [...preferred, ...extras];
  }, [wyrmspells]);

  const qualityOptions = useMemo(() => {
    return orderFilterOptions(
      wyrmspells.flatMap((spell) => {
        const q = getMaxQuality(spell)?.quality;
        return q ? [q] : [];
      }),
      QUALITY_ORDER,
    );
  }, [wyrmspells]);
  const availabilityOptions = useMemo(() => {
    const factions = new Set(
      wyrmspells.flatMap((spell) =>
        spell.exclusive_faction ? [spell.exclusive_faction] : [],
      ),
    );
    return [
      ...(wyrmspells.some((spell) => !spell.exclusive_faction)
        ? ['universal']
        : []),
      ...FACTION_SLUGS.filter((faction) => factions.has(faction)),
    ];
  }, [wyrmspells]);

  const filterGroups: ChipFilterGroup[] = useMemo(() => {
    const groups: ChipFilterGroup[] = [];
    if (typeOptions.length > 0)
      groups.push({
        key: 'types',
        label: 'Type',
        options: typeOptions,
        icon: (value) => (
          <SafeImage
            src={
              WYRMSPELL_TYPE_ICON_MAP[
                value as keyof typeof WYRMSPELL_TYPE_ICON_MAP
              ]
            }
            alt=""
            w={IMAGE_SIZE.ICON_SM}
            h={IMAGE_SIZE.ICON_SM}
            fit="contain"
          />
        ),
      });
    if (qualityOptions.length > 0)
      groups.push(
        createQualityFilterGroup({
          label: 'Max Quality',
          options: qualityOptions,
        }),
      );
    if (availabilityOptions.length > 0) {
      const factionGroup = createFactionFilterGroup();
      groups.push({
        ...factionGroup,
        key: 'availability',
        label: 'Availability',
        options: availabilityOptions,
        labelFn: (value) =>
          value === 'universal'
            ? 'Universal'
            : (factionGroup.labelFn?.(value) ?? value),
        icon: (value) =>
          value === 'universal' ? null : factionGroup.icon?.(value),
      });
    }
    return groups;
  }, [availabilityOptions, typeOptions, qualityOptions]);

  const mostRecentUpdate = useMemo(
    () => getLatestTimestamp(wyrmspells),
    [wyrmspells],
  );

  return (
    <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="md">
        <ListPageHeader title="Wyrmspells" timestamp={mostRecentUpdate}>
          <Group gap="xs">
            <ExportButton data={wyrmspells} filename="wyrmspells.json" />
            <DataCorrectionButton entityType="wyrmspell" />
          </Group>
        </ListPageHeader>

        <ListPageShell
          loading={loading}
          error={error}
          onRetry={retry}
          errorTitle="Could not load wyrmspells"
          hasData={wyrmspells.length > 0}
          emptyMessage="No wyrmspell data available yet."
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
            noun="wyrmspell"
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterCount={activeFilterCount}
            filterOpen={filterOpen}
            onFilterToggle={toggleFilter}
            onResetFilters={resetFilters}
            filterContent={
              <EntityFilter
                groups={filterGroups}
                selected={{
                  types: filters.types,
                  qualities: filters.qualities,
                  availability: filters.availability,
                }}
                onChange={(key, values) =>
                  setFilters({ ...filters, [key]: values })
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
              <SimpleGrid cols={CARD_GRID_COLS} spacing="md">
                {pageItems.map((spell) => {
                  const iconSrc = getWyrmspellIcon(spell.slug, spell.type);
                  const maxQuality = getMaxQuality(spell);
                  return (
                    <InteractiveSurface
                      key={spell.slug}
                      component={Link}
                      to={`/wyrmspells/${spell.slug}`}
                      p={{ base: 'sm', sm: 'md' }}
                      style={LINK_BLOCK_RESET_STYLE}
                    >
                      <Group gap="md" align="flex-start" wrap="nowrap">
                        {iconSrc && (
                          <SafeImage
                            src={iconSrc}
                            alt={spell.name}
                            w={IMAGE_SIZE.CARD_ICON}
                            h={IMAGE_SIZE.CARD_ICON}
                            fit="contain"
                            radius="sm"
                            loading="lazy"
                          />
                        )}
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="sm" wrap="nowrap" align="flex-start">
                            <Text
                              fw={700}
                              className="dt-link-text"
                              lineClamp={2}
                              style={{ minWidth: 0 }}
                            >
                              {spell.name}
                            </Text>
                            {maxQuality && (
                              <Box style={{ flexShrink: 0 }}>
                                <QualityIcon quality={maxQuality.quality} />
                              </Box>
                            )}
                            {spell.is_global === false && (
                              <Box style={{ flexShrink: 0 }}>
                                <GlobalBadge isGlobal={false} size="xs" />
                              </Box>
                            )}
                            {spell.machine_translated && (
                              <Box style={{ flexShrink: 0 }}>
                                <MachineTranslatedBadge size="xs" />
                              </Box>
                            )}
                          </Group>
                          <Group gap="sm" wrap="wrap">
                            <WyrmspellTypeTag type={spell.type} />
                            {spell.exclusive_faction && (
                              <FactionTag
                                faction={spell.exclusive_faction}
                                size="sm"
                              />
                            )}
                          </Group>
                          {maxQuality && (
                            <ExpandableText size="xs">
                              <RichText
                                text={maxQuality.effect}
                                statusEffects={statusEffects}
                              />
                            </ExpandableText>
                          )}
                        </Stack>
                      </Group>
                    </InteractiveSurface>
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
                      <SortableTh
                        sortKey="quality"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Max Quality
                      </SortableTh>
                      <SortableTh
                        sortKey="faction"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Faction
                      </SortableTh>
                      <Table.Th>Effect (Max Quality)</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pageItems.map((spell) => {
                      const iconSrc = getWyrmspellIcon(spell.slug, spell.type);
                      const maxQuality = getMaxQuality(spell);
                      return (
                        <Table.Tr key={spell.slug}>
                          <Table.Td>
                            {iconSrc && (
                              <SafeImage
                                src={iconSrc}
                                alt={spell.name}
                                w={IMAGE_SIZE.PORTRAIT_SM}
                                h={IMAGE_SIZE.PORTRAIT_SM}
                                fit="contain"
                                loading="lazy"
                              />
                            )}
                          </Table.Td>
                          <EntityTableLinkCell
                            to={`/wyrmspells/${spell.slug}`}
                            accessory={
                              spell.is_global === false && (
                                <>
                                  <GlobalBadge isGlobal={false} size="xs" />
                                  {spell.machine_translated && (
                                    <MachineTranslatedBadge size="xs" />
                                  )}
                                </>
                              )
                            }
                          >
                            {spell.name}
                          </EntityTableLinkCell>
                          <Table.Td>
                            <WyrmspellTypeTag type={spell.type} />
                          </Table.Td>
                          <Table.Td>
                            {maxQuality && (
                              <QualityIcon quality={maxQuality.quality} />
                            )}
                          </Table.Td>
                          <Table.Td>
                            {spell.exclusive_faction ? (
                              <FactionTag
                                faction={spell.exclusive_faction}
                                size="sm"
                              />
                            ) : (
                              <Text size="sm" c="dimmed">
                                —
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            {maxQuality && (
                              <RichText
                                text={maxQuality.effect}
                                statusEffects={statusEffects}
                              />
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
