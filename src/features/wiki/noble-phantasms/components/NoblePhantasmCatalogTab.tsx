import RegionBadges from '@/components/ui/RegionBadges';
import { Group, ScrollArea, SimpleGrid, Table, Text } from '@mantine/core';
import { getNoblePhantasmIcon } from '@/assets';
import EntitySummaryCard from '@/components/common/EntitySummaryCard';
import EntityTableLinkCell from '@/components/common/EntityTableLinkCell';
import FilteredListShell from '@/components/layout/FilteredListShell';
import ListPageShell from '@/components/layout/ListPageShell';
import { ViewModeLoading } from '@/components/layout/PageLoadingSkeleton';
import ExpandableText from '@/components/ui/ExpandableText';
import QualityIcon from '@/components/ui/QualityIcon';
import SafeImage from '@/components/ui/SafeImage';
import SortableTh from '@/components/ui/SortableTh';
import RichText from '@/components/common/RichText';
import { getMinWidthStyle } from '@/constants/styles';
import { IMAGE_SIZE, CARD_GRID_COLS } from '@/constants/ui';
import type { GradientPaletteAccents } from '@/contexts';
import CharacterTag from '@/features/characters/components/CharacterTag';
import type { Character } from '@/features/characters/types';
import NoblePhantasmFilter from '@/features/wiki/noble-phantasms/components/NoblePhantasmFilter';
import type { useNoblePhantasmCatalog } from '@/features/wiki/noble-phantasms/hooks/use-noble-phantasm-catalog';
import type { NoblePhantasm } from '@/features/wiki/noble-phantasms/types';
import { getNoblePhantasmPreviewDescription } from '@/features/wiki/noble-phantasms/utils';
import type { StatusEffect } from '@/features/wiki/status-effects/types';

interface NoblePhantasmCatalogTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  noblePhantasms: NoblePhantasm[];
  characterByIdentity: Map<string, Character>;
  characterNames: Map<string, string>;
  statusEffects: StatusEffect[];
  accent: GradientPaletteAccents;
  catalog: ReturnType<typeof useNoblePhantasmCatalog>;
}

export default function NoblePhantasmCatalogTab({
  loading,
  error,
  onRetry,
  noblePhantasms,
  characterByIdentity,
  characterNames,
  statusEffects,
  accent,
  catalog,
}: NoblePhantasmCatalogTabProps) {
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
  } = catalog;

  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Could not load noble phantasms"
      hasData={noblePhantasms.length > 0}
      emptyMessage="No noble phantasm data available yet."
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
        noun="noble phantasm"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterCount={activeFilterCount}
        filterOpen={filterOpen}
        onFilterToggle={toggleFilter}
        onResetFilters={resetFilters}
        search={filters.search}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        searchPlaceholder="Search by name or character..."
        filterContent={
          <NoblePhantasmFilter filters={filters} onChange={setFilters} />
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={setPageSize}
        gridContent={
          <SimpleGrid cols={CARD_GRID_COLS} spacing="md">
            {pageItems.map((item) => {
              const linkedCharacter = item.character_slug
                ? characterByIdentity.get(item.character_slug)
                : undefined;
              const previewDescription =
                getNoblePhantasmPreviewDescription(item);
              return (
                <EntitySummaryCard
                  key={item.slug}
                  to={`/noble-phantasms/${item.slug}`}
                  title={item.name}
                  imageSrc={getNoblePhantasmIcon(item.slug)}
                  titleAccessory={
                    <Group gap={6} wrap="nowrap">
                      <QualityIcon quality={item.quality} />
                      <RegionBadges
                        isGlobal={item.is_global}
                        machineTranslated={item.machine_translated}
                      />
                    </Group>
                  }
                  metadata={
                    <Group gap="xs" wrap="wrap">
                      {item.character_slug &&
                        characterNames.has(item.character_slug) && (
                          <CharacterTag
                            slug={item.character_slug}
                            size="sm"
                            color={accent.secondary}
                            link={false}
                          />
                        )}
                    </Group>
                  }
                  description={
                    previewDescription && (
                      <ExpandableText size="xs">
                        <RichText
                          text={previewDescription}
                          statusEffects={statusEffects}
                          skills={linkedCharacter?.skills}
                          talent={linkedCharacter?.talent}
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
                    sortKey="character"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Character
                  </SortableTh>
                  <SortableTh
                    sortKey="rarity"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Rarity
                  </SortableTh>
                  <SortableTh
                    sortKey="effects"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Effects
                  </SortableTh>
                  <SortableTh
                    sortKey="skills"
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Skills
                  </SortableTh>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pageItems.map((item) => {
                  const icon = getNoblePhantasmIcon(item.slug);
                  return (
                    <Table.Tr key={item.slug}>
                      <Table.Td>
                        {icon ? (
                          <SafeImage
                            src={icon}
                            alt={item.name}
                            w={IMAGE_SIZE.PORTRAIT_SM}
                            h={IMAGE_SIZE.PORTRAIT_SM}
                            fit="contain"
                            radius="sm"
                            loading="lazy"
                          />
                        ) : (
                          <Text c="dimmed" size="sm">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <EntityTableLinkCell
                        to={`/noble-phantasms/${item.slug}`}
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
                        {item.character_slug &&
                        characterNames.has(item.character_slug) ? (
                          <CharacterTag
                            slug={item.character_slug}
                            size="sm"
                            color={accent.secondary}
                            link={false}
                          />
                        ) : (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <QualityIcon quality={item.quality} />
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{item.effects.length}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{item.skills.length}</Text>
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
