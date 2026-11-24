// Shared component exports for cleaner imports.
// ── UI primitives ─────────────────────────────────────────────────────────────
export { default as ClassTag } from './ui/ClassTag';
export { default as CollapsibleSectionCard } from './ui/CollapsibleSectionCard';
export { default as ConfirmActionModal } from './ui/ConfirmActionModal';
export { default as DataFetchError } from './ui/DataFetchError';
export { default as EmptyState } from './ui/EmptyState';
export { default as EntityNotFound } from './ui/EntityNotFound';
export { default as ErrorBoundary } from './ui/ErrorBoundary';
export type {
  ErrorBoundaryScope,
  ErrorFallbackRenderProps,
} from './ui/ErrorBoundary';
export { default as ExpandableText } from './ui/ExpandableText';
export { default as FactionTag } from './ui/FactionTag';
export type { FactionTagProps } from './ui/FactionTag';
export { default as GlobalBadge } from './ui/GlobalBadge';
export { default as MachineTranslatedBadge } from './ui/MachineTranslatedBadge';
export { default as IconBadge } from './ui/IconBadge';
export { default as InlineMarkup } from './ui/InlineMarkup';
export { default as MobileBottomDrawer } from './ui/MobileBottomDrawer';
export { default as NoResultsSuggestions } from './ui/NoResultsSuggestions';
export { default as NoteTooltipIcon } from './ui/NoteTooltipIcon';
export { default as PaginationControl } from './ui/PaginationControl';
export { default as QualityIcon } from './ui/QualityIcon';
export { default as ResolvedHowlkinBadge } from './ui/ResolvedHowlkinBadge';
export type { ResolvedHowlkinBadgeProps } from './ui/ResolvedHowlkinBadge';
export { default as ResourceBadge } from './ui/ResourceBadge';
export type { ResourceBadgeProps } from './ui/ResourceBadge';
export { default as SafeImage } from './ui/SafeImage';
export { default as SafeVideo } from './ui/SafeVideo';
export { default as SortableTh } from './ui/SortableTh';
export { default as StatCard } from './ui/StatCard';
export { InteractiveSurface, StaticSurface } from './ui/Surface';
export {
  INTERACTIVE_SURFACE_CLASS_NAME,
  STATIC_SURFACE_CLASS_NAME,
} from './ui/Surface';
export type { InteractiveSurfaceProps, StaticSurfaceProps } from './ui/Surface';
export { default as TierBadge } from './ui/TierBadge';
export type { TierBadgeProps } from './ui/TierBadge';
export { default as ViewToggle } from './ui/ViewToggle';
export { default as WyrmspellBadge } from './ui/WyrmspellBadge';
export type { WyrmspellBadgeProps } from './ui/WyrmspellBadge';

// ── Common ────────────────────────────────────────────────────────────────────
export { default as EntityFilter } from './common/EntityFilter';
export type { ChipFilterGroup, EntityFilterProps } from './common/EntityFilter';
export { default as EntitySummaryCard } from './common/EntitySummaryCard';
export { default as EntityTableLinkCell } from './common/EntityTableLinkCell';
export { default as LastUpdated } from './common/LastUpdated';
export { default as RichText } from './common/RichText';
export type { RichTextProps } from './common/RichText';

// ── Layout ────────────────────────────────────────────────────────────────────
export { default as Breadcrumbs } from './layout/Breadcrumbs';
export { default as FilteredListShell } from './layout/FilteredListShell';
export { default as FilterToolbar } from './layout/FilterToolbar';
export { default as Footer } from './layout/Footer';
export { default as FullBleedSection } from './layout/FullBleedSection';
export { default as ListPageHeader } from './layout/ListPageHeader';
export { default as ListPageShell } from './layout/ListPageShell';
export { CharacterListLoading } from './layout/PageLoadingSkeleton';

// ── Tools ─────────────────────────────────────────────────────────────────────
export { default as JsonModal } from './tools/JsonModal';
export { default as SearchModal } from './tools/SearchModal';
export { default as SuggestModal } from './tools/SuggestModal';
export type { ArrayFieldDef, FieldDef } from './tools/SuggestModal';
