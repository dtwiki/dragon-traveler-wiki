import ExpandableText from '@/components/ui/ExpandableText';
import RegionBadges from '@/components/ui/RegionBadges';
import SafeImage from '@/components/ui/SafeImage';
import { getWyrmPortrait } from '@/assets';
import type { ChipFilterGroup } from '@/components/common/EntityFilter';
import EntityFilter from '@/components/common/EntityFilter';
import EntitySummaryCard from '@/components/common/EntitySummaryCard';
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
import FactionTag from '@/components/ui/FactionTag';
import QualityIcon from '@/components/ui/QualityIcon';
import { FACTION_SLUGS } from '@/constants/faction-colors';
import { QUALITY_ORDER } from '@/constants/quality';
import { getMinWidthStyle } from '@/constants/styles';
import {
  IMAGE_SIZE,
  STORAGE_KEY,
  PAGE_WIDTH,
  CARD_GRID_COLS,
} from '@/constants/ui';
import { WYRM_PHASE_COLOR } from '@/constants/wyrm-colors';
import { WYRM_PHASE_ORDER } from '@/features/wiki/wyrms/types';
import {
  compareWyrms,
  EMPTY_WYRM_FILTERS,
  matchesWyrmFilters,
} from '@/features/wiki/wyrms/filters';
import {
  useStatusEffects,
  useWyrms,
} from '@/features/wiki/hooks/use-wiki-data';
import { useFilteredPageData } from '@/hooks';
import { getLatestTimestamp } from '@/utils';

import {
  Badge,
  Container,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
} from '@mantine/core';
import { useMemo } from 'react';

export default function WyrmsListPage() {
  const { data: statusEffects } = useStatusEffects();
  const { data: wyrms, loading, error, retry } = useWyrms();

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
  } = useFilteredPageData(wyrms, {
    emptyFilters: EMPTY_WYRM_FILTERS,
    storageKeys: {
      filters: STORAGE_KEY.WYRM_FILTERS,
      viewMode: STORAGE_KEY.WYRM_VIEW_MODE,
      sort: STORAGE_KEY.WYRM_SORT,
    },
    defaultViewMode: 'grid',
    filterFn: matchesWyrmFilters,
    sortFn: compareWyrms,
  });

  const phaseOptions = useMemo(() => {
    const phases = new Set(wyrms.map((w) => w.phase));
    return WYRM_PHASE_ORDER.filter((p) => phases.has(p));
  }, [wyrms]);

  const qualityOptions = useMemo(
    () =>
      orderFilterOptions(
        wyrms.map((w) => w.quality),
        QUALITY_ORDER,
      ),
    [wyrms],
  );

  const factionOptions = useMemo(() => {
    const factions = new Set(wyrms.map((w) => w.faction));
    return FACTION_SLUGS.filter((f) => factions.has(f));
  }, [wyrms]);

  const filterGroups: ChipFilterGroup[] = useMemo(() => {
    const groups: ChipFilterGroup[] = [];
    if (phaseOptions.length > 0)
      groups.push({ key: 'phases', label: 'Phase', options: phaseOptions });
    if (qualityOptions.length > 0)
      groups.push(
        createQualityFilterGroup({ label: 'Quality', options: qualityOptions }),
      );
    if (factionOptions.length > 0)
      groups.push(
        createFactionFilterGroup({ label: 'Faction', options: factionOptions }),
      );
    return groups;
  }, [phaseOptions, qualityOptions, factionOptions]);

  const mostRecentUpdate = useMemo(() => getLatestTimestamp(wyrms), [wyrms]);

  return (
    <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="md">
        <ListPageHeader title="Wyrms" timestamp={mostRecentUpdate}>
          <Group gap="xs">
            <ExportButton data={wyrms} filename="wyrms.json" />
            <DataCorrectionButton entityType="wyrm" />
          </Group>
        </ListPageHeader>

        <ListPageShell
          loading={loading}
          error={error}
          onRetry={retry}
          errorTitle="Could not load wyrms"
          hasData={wyrms.length > 0}
          emptyMessage="No wyrm data available yet."
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
            noun="wyrm"
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
                  phases: filters.phases,
                  qualities: filters.qualities,
                  factions: filters.factions,
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
                {pageItems.map((wyrm) => {
                  const iconSrc = getWyrmPortrait(wyrm.slug);
                  const phaseColor = WYRM_PHASE_COLOR[wyrm.phase];
                  return (
                    <EntitySummaryCard
                      key={wyrm.slug}
                      to={`/wyrms/${wyrm.slug}`}
                      title={wyrm.name}
                      imageSrc={iconSrc}
                      titleAccessory={
                        <Group gap={6} wrap="nowrap">
                          <QualityIcon quality={wyrm.quality} />
                          <RegionBadges
                            isGlobal={wyrm.is_global}
                            machineTranslated={wyrm.machine_translated}
                          />
                        </Group>
                      }
                      metadata={
                        <Group gap="xs" wrap="wrap">
                          <Badge variant="light" size="sm" color={phaseColor}>
                            {wyrm.phase}
                          </Badge>
                          <FactionTag faction={wyrm.faction} size="sm" />
                        </Group>
                      }
                      description={
                        wyrm.battle_description && (
                          <ExpandableText size="xs">
                            <RichText
                              text={wyrm.battle_description}
                              statusEffects={statusEffects}
                            />
                          </ExpandableText>
                        )
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
                        onSort={handleSort}
                      >
                        Name
                      </SortableTh>
                      <SortableTh
                        sortKey="phase"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Phase
                      </SortableTh>
                      <SortableTh
                        sortKey="quality"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Quality
                      </SortableTh>
                      <SortableTh
                        sortKey="faction"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Faction
                      </SortableTh>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pageItems.map((wyrm) => {
                      const iconSrc = getWyrmPortrait(wyrm.slug);
                      const phaseColor = WYRM_PHASE_COLOR[wyrm.phase];
                      return (
                        <Table.Tr key={wyrm.slug}>
                          <Table.Td>
                            {iconSrc && (
                              <SafeImage
                                src={iconSrc}
                                alt={wyrm.name}
                                w={IMAGE_SIZE.PORTRAIT_SM}
                                h={IMAGE_SIZE.PORTRAIT_SM}
                                fit="contain"
                                loading="lazy"
                              />
                            )}
                          </Table.Td>
                          <EntityTableLinkCell
                            to={`/wyrms/${wyrm.slug}`}
                            accessory={
                              wyrm.is_global === false && (
                                <RegionBadges
                                  isGlobal={false}
                                  machineTranslated={wyrm.machine_translated}
                                />
                              )
                            }
                          >
                            {wyrm.name}
                          </EntityTableLinkCell>
                          <Table.Td>
                            <Badge variant="light" size="sm" color={phaseColor}>
                              {wyrm.phase}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <QualityIcon quality={wyrm.quality} />
                          </Table.Td>
                          <Table.Td>
                            <FactionTag faction={wyrm.faction} size="sm" />
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
