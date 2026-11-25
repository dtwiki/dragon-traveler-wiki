import ExpandableText from '@/components/ui/ExpandableText';
import RegionBadges from '@/components/ui/RegionBadges';
import SafeImage from '@/components/ui/SafeImage';
import { getArtifactIcon } from '@/assets';
import EntityFilter from '@/components/common/EntityFilter';
import type { ChipFilterGroup } from '@/components/common/EntityFilter';
import { createQualityFilterGroup } from '@/components/common/EntityFilterGroups';
import EntityTableLinkCell from '@/components/common/EntityTableLinkCell';
import EntitySummaryCard from '@/components/common/EntitySummaryCard';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageHeader from '@/components/layout/ListPageHeader';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import ExportButton from '@/components/tools/ExportButton';
import DataCorrectionButton from '@/components/tools/DataCorrectionButton';
import RichText from '@/components/common/RichText';
import SortableTh from '@/components/ui/SortableTh';
import {
  compareArtifacts,
  EMPTY_ARTIFACT_FILTERS,
  matchesArtifactFilters,
} from '@/features/wiki/artifacts/filters';
import { getMinWidthStyle } from '@/constants/styles';
import {
  IMAGE_SIZE,
  STORAGE_KEY,
  PAGE_WIDTH,
  CARD_GRID_COLS,
} from '@/constants/ui';
import QualityIcon from '@/components/ui/QualityIcon';
import {
  useArtifacts,
  useStatusEffects,
} from '@/features/wiki/hooks/use-wiki-data';
import { useFilteredPageData, useGradientAccent } from '@/hooks';
import { getLatestTimestamp } from '@/utils';
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

export default function Artifacts() {
  const { accent } = useGradientAccent();
  const { data: artifacts, loading, error, retry } = useArtifacts();
  const { data: statusEffects } = useStatusEffects();
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
  } = useFilteredPageData(artifacts, {
    emptyFilters: EMPTY_ARTIFACT_FILTERS,
    storageKeys: {
      filters: STORAGE_KEY.ARTIFACT_FILTERS,
      viewMode: STORAGE_KEY.ARTIFACT_VIEW_MODE,
      sort: STORAGE_KEY.ARTIFACT_SORT,
    },
    defaultViewMode: 'grid',
    filterFn: matchesArtifactFilters,
    sortFn: compareArtifacts,
  });

  const mostRecentUpdate = useMemo(
    () => getLatestTimestamp(artifacts),
    [artifacts],
  );
  const filterGroups: ChipFilterGroup[] = useMemo(() => {
    const footprints = [
      ...new Set(
        artifacts.map((artifact) => `${artifact.rows}x${artifact.columns}`),
      ),
    ].sort((left, right) => {
      const [leftRows, leftColumns] = left.split('x').map(Number);
      const [rightRows, rightColumns] = right.split('x').map(Number);
      return (
        leftColumns * leftRows - rightColumns * rightRows ||
        leftColumns - rightColumns ||
        leftRows - rightRows
      );
    });
    return [
      createQualityFilterGroup(),
      { key: 'footprints', label: 'Footprint', options: footprints },
    ];
  }, [artifacts]);

  return (
    <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="md">
        <ListPageHeader title="Artifacts" timestamp={mostRecentUpdate}>
          <Group gap="xs">
            <ExportButton data={artifacts} filename="artifacts.json" />
            <DataCorrectionButton entityType="artifact" />
          </Group>
        </ListPageHeader>

        <ListPageShell
          loading={loading}
          error={error}
          onRetry={retry}
          errorTitle="Could not load artifacts"
          hasData={artifacts.length > 0}
          emptyMessage="No artifact data available yet."
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
            noun="artifact"
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
                  qualities: filters.qualities,
                  footprints: filters.footprints,
                }}
                onChange={(key, values) =>
                  setFilters({ ...filters, [key]: values })
                }
                onClear={resetFilters}
                search={filters.search}
                onSearchChange={(value) =>
                  setFilters({ ...filters, search: value })
                }
                searchPlaceholder="Search artifacts..."
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
                {pageItems.map((artifact) => {
                  const iconSrc = getArtifactIcon(artifact.slug);
                  return (
                    <EntitySummaryCard
                      key={artifact.slug}
                      to={`/artifacts/${artifact.slug}`}
                      title={artifact.name}
                      imageSrc={iconSrc}
                      titleAccessory={
                        <Group gap={6} wrap="nowrap">
                          <QualityIcon quality={artifact.quality} />
                          <RegionBadges
                            isGlobal={artifact.is_global}
                            machineTranslated={artifact.machine_translated}
                          />
                        </Group>
                      }
                      metadata={
                        <Group gap="xs">
                          <Badge
                            variant="light"
                            size="sm"
                            color={accent.secondary}
                          >
                            {artifact.rows}x{artifact.columns}
                          </Badge>
                          <Badge
                            variant="light"
                            size="sm"
                            color={accent.tertiary}
                          >
                            {artifact.treasures.length} treasure
                            {artifact.treasures.length !== 1 ? 's' : ''}
                          </Badge>
                        </Group>
                      }
                      description={
                        <ExpandableText size="xs">
                          <RichText
                            text={artifact.lore}
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
                        onSort={handleSort}
                      >
                        Name
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
                        sortKey="size"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Size
                      </SortableTh>
                      <SortableTh
                        sortKey="treasures"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      >
                        Treasures
                      </SortableTh>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pageItems.map((artifact) => {
                      const iconSrc = getArtifactIcon(artifact.slug);
                      return (
                        <Table.Tr key={artifact.slug}>
                          <Table.Td>
                            {iconSrc && (
                              <SafeImage
                                src={iconSrc}
                                alt={artifact.name}
                                w={IMAGE_SIZE.PORTRAIT_SM}
                                h={IMAGE_SIZE.PORTRAIT_SM}
                                fit="contain"
                                radius="sm"
                                loading="lazy"
                              />
                            )}
                          </Table.Td>
                          <EntityTableLinkCell
                            to={`/artifacts/${artifact.slug}`}
                            fontWeight={500}
                            accessory={
                              artifact.is_global === false && (
                                <RegionBadges
                                  isGlobal={false}
                                  machineTranslated={
                                    artifact.machine_translated
                                  }
                                />
                              )
                            }
                          >
                            {artifact.name}
                          </EntityTableLinkCell>
                          <Table.Td>
                            <QualityIcon quality={artifact.quality} />
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant="light"
                              size="sm"
                              color={accent.secondary}
                            >
                              {artifact.rows}x{artifact.columns}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{artifact.treasures.length}</Text>
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
