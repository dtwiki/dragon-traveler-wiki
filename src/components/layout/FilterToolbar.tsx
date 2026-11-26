import ViewToggle from '@/components/ui/ViewToggle';
import { Z_INDEX } from '@/constants/ui';
import { useIsMobile } from '@/hooks';
import type { ViewMode } from '@/hooks/use-filters';
import { FilterSearchInput } from '@/components/common/FilterControls';
import { Box, CloseButton, Group, Text } from '@mantine/core';
import { type ReactNode } from 'react';
import { pluralize } from '@/utils/string';
import FilterPopoverButton from './FilterPopoverButton';

interface FilterToolbarProps {
  count: number;
  noun: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterCount: number;
  filterOpen: boolean;
  onFilterToggle: () => void;
  /** Shows a name search in the toolbar instead of inside the filter panel. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children: ReactNode;
}

export default function FilterToolbar({
  count,
  noun,
  viewMode,
  onViewModeChange,
  filterCount,
  filterOpen,
  onFilterToggle,
  search,
  onSearchChange,
  searchPlaceholder = 'Search by name...',
  children,
}: FilterToolbarProps) {
  const isMobile = useIsMobile();

  return (
    <Box
      className={isMobile ? 'dt-themed-surface' : undefined}
      style={
        isMobile
          ? {
              position: 'sticky',
              top: `calc(var(--app-shell-header-offset, 0px) + var(--mantine-spacing-xs))`,
              zIndex: Z_INDEX.STICKY,
              padding: 'var(--mantine-spacing-xs)',
              borderRadius: 'var(--mantine-radius-md)',
              border: '1px solid var(--mantine-color-default-border)',
            }
          : undefined
      }
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Text size="sm" c="dimmed">
          {count} {count === 1 ? noun : pluralize(noun)}
        </Text>
        {onSearchChange && (
          <FilterSearchInput
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={search ?? ''}
            onSearch={onSearchChange}
            size={isMobile ? 'md' : 'xs'}
            // Phones: its own full-width row below the count and buttons.
            style={
              isMobile
                ? { flex: '1 1 100%', order: 1 }
                : { flex: '1 1 12rem', maxWidth: 360 }
            }
            rightSection={
              search ? (
                <CloseButton
                  size="sm"
                  aria-label="Clear search"
                  onClick={() => onSearchChange('')}
                />
              ) : null
            }
          />
        )}
        <Group gap="xs">
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          <FilterPopoverButton
            filterCount={filterCount}
            filterOpen={filterOpen}
            onFilterToggle={onFilterToggle}
          >
            {children}
          </FilterPopoverButton>
        </Group>
      </Group>
    </Box>
  );
}
