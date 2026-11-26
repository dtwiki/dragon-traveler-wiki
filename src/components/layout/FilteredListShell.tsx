import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import type { ViewMode } from '@/hooks/use-filters';
import NoResultsSuggestions from '@/components/ui/NoResultsSuggestions';
import PaginationControl from '@/components/ui/PaginationControl';
import { StaticSurface } from '@/components/ui/Surface';
import { pluralize } from '@/utils/string';
import FilterToolbar from './FilterToolbar';

interface FilteredListShellProps {
  count: number;
  noun: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterCount: number;
  filterOpen: boolean;
  onFilterToggle: () => void;
  onResetFilters?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterContent: ReactNode;
  emptyMessage?: string;
  gridContent: ReactNode;
  tableContent: ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export default function FilteredListShell({
  count,
  noun,
  viewMode,
  onViewModeChange,
  filterCount,
  filterOpen,
  onFilterToggle,
  onResetFilters,
  search,
  onSearchChange,
  searchPlaceholder,
  filterContent,
  emptyMessage,
  gridContent,
  tableContent,
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: FilteredListShellProps) {
  const defaultEmpty = `No ${pluralize(noun)} match the current filters.`;

  return (
    <StaticSurface p={{ base: 'xs', sm: 'md' }} data-no-hover>
      <Stack gap="md">
        <FilterToolbar
          count={count}
          noun={noun}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          filterCount={filterCount}
          filterOpen={filterOpen}
          onFilterToggle={onFilterToggle}
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        >
          {filterContent}
        </FilterToolbar>

        {count === 0 ? (
          <NoResultsSuggestions
            title={`No ${pluralize(noun)} found`}
            message={emptyMessage ?? defaultEmpty}
            onReset={onResetFilters}
            onOpenFilters={onFilterToggle}
          />
        ) : viewMode === 'grid' ? (
          gridContent
        ) : (
          tableContent
        )}

        {page !== undefined && totalPages !== undefined && onPageChange && (
          <PaginationControl
            currentPage={page}
            totalPages={totalPages}
            onChange={onPageChange}
            scrollToTop
            totalItems={count}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </Stack>
    </StaticSurface>
  );
}
