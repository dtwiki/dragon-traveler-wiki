// Shared hook exports for cleaner imports.
export { useAdjacentItems } from './use-adjacent-items';
export { useFactions } from './use-factions';
export { useLocalePath, useLocaleChangesPath } from './use-locale-path';
export { useDarkMode } from './use-dark-mode';
export { useDataFetch } from './use-data-fetch';
export { useEntityPageTitle } from './use-entity-page-title';
export { useAssetManifest } from './use-asset-manifest';
export { useFilteredPageData } from './use-filtered-page-data';
export {
  countActiveFilters,
  useFilterPanel,
  useFilteredData,
  useFilters,
  useViewMode,
} from './use-filters';
export { useGradientAccent } from './use-gradient-accent';
export { useIsMobile } from './use-is-mobile';
export { useMobileTooltip } from './use-mobile-tooltip';
export { useNullableNumber } from './use-nullable-number';
export { usePersistedState } from './use-persisted-state';
export {
  buildRowAlignedPageSizeOptions,
  getPageSizeStorageKey,
  resolvePageSizeOptions,
  usePageSize,
  usePagination,
} from './use-pagination';
export { usePoolLayout } from './use-pool-layout';
export type { PoolLayout } from './use-pool-layout';
export { useBuilderEditState } from './use-builder-edit-state';
export { useDraftHydration } from './use-draft-hydration';
export { useInputCommit } from './use-input-commit';
export { useSecondaryTabList } from './use-secondary-tab-list';
export { useEffectiveNavLayout } from './use-effective-nav-layout';
export { useNavBadgeCounts } from './use-nav-badge-counts';
export { useSidebar } from './use-sidebar';
export { applyDir, useSortState } from './use-sort';
export { useEntityTabParam, useTabParam } from './use-tab-param';
export {
  useSearchParamFilter,
  useSearchParamText,
} from './use-search-param-filter';

// Re-export hook types
export type { DataFetchResult } from './use-data-fetch';
export type { ViewMode } from './use-filters';
export type { PageSizeOptionsByViewMode } from './use-pagination';
export type { UseSidebarReturn } from './use-sidebar';
