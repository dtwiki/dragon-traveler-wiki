import { SimpleGrid } from '@mantine/core';
import { CHARACTER_GRID_COLS, CHARACTER_GRID_SPACING } from '@/constants/ui';
import type { CharacterListData } from '@/features/characters/hooks/use-character-list-data';
import {
  getCharacterIdentityKey,
  getCharacterRoutePath,
} from '@/features/characters/utils/character-route';
import { EMPTY_CHARACTER_FILTERS } from '@/features/characters/filters';
import FilteredListShell from '@/components/layout/FilteredListShell';
import CharacterCard from './CharacterCard';
import CharacterFilter from './CharacterFilter';
import CharacterTable from './CharacterTable';

interface CharacterListProps {
  data: CharacterListData;
  cols?: { base?: number; xs?: number; sm?: number; md?: number };
  spacing?: number | string;
  newCharacterKeys?: Set<string>;
  updatedCharacterKeys?: Set<string>;
}

export default function CharacterList({
  data,
  cols = CHARACTER_GRID_COLS,
  spacing = CHARACTER_GRID_SPACING,
  newCharacterKeys,
  updatedCharacterKeys,
}: CharacterListProps) {
  const {
    filters,
    setFilters,
    filterOpen,
    toggleFilter,
    viewMode,
    setViewMode,
    sortCol,
    sortDir,
    handleSort,
    effectOptions,
    combatTagOptions,
    tierOptions,
    selectedTierListName,
    getTierLabel,
    filteredAndSorted,
    pageItems,
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    pageSizeOptions,
    activeFilterCount,
    starLevelOptions,
  } = data;

  const gridContent = (
    <SimpleGrid cols={cols} spacing={spacing}>
      {pageItems.map((char) => (
        <CharacterCard
          key={getCharacterIdentityKey(char)}
          name={char.name}
          quality={char.quality}
          tierLabel={getTierLabel(char)}
          routePath={getCharacterRoutePath(char)}
          isNew={newCharacterKeys?.has(getCharacterIdentityKey(char))}
          isUpdated={updatedCharacterKeys?.has(getCharacterIdentityKey(char))}
        />
      ))}
    </SimpleGrid>
  );

  const tableContent = (
    <CharacterTable
      pageItems={pageItems}
      sortCol={sortCol}
      sortDir={sortDir}
      handleSort={handleSort}
      selectedTierListName={selectedTierListName}
      getTierLabel={getTierLabel}
      newCharacterKeys={newCharacterKeys}
      updatedCharacterKeys={updatedCharacterKeys}
    />
  );

  return (
    <FilteredListShell
      count={filteredAndSorted.length}
      noun="character"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      filterCount={activeFilterCount}
      filterOpen={filterOpen}
      onFilterToggle={toggleFilter}
      onResetFilters={() => setFilters(EMPTY_CHARACTER_FILTERS)}
      emptyMessage="No characters match the current filters."
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={setPageSize}
      search={filters.search}
      onSearchChange={(search) => setFilters({ ...filters, search })}
      searchPlaceholder="Search characters..."
      filterContent={
        <CharacterFilter
          filters={filters}
          onChange={setFilters}
          effectOptions={effectOptions}
          combatTagOptions={combatTagOptions}
          showTierFilter={Boolean(selectedTierListName)}
          tierOptions={tierOptions}
          starLevelOptions={starLevelOptions}
        />
      }
      gridContent={gridContent}
      tableContent={tableContent}
    />
  );
}
