import { RESOURCE_CATEGORY_ORDER } from '@/constants/resource-colors';
import { applyDir } from '@/hooks/use-sort';
import type { Quality } from '@/types/quality';
import type { Resource, ResourceCategory } from './types';
import { compareQuality } from '@/utils/quality';

export interface ResourceFilters {
  search: string;
  categories: ResourceCategory[];
  qualities: Quality[];
}

export const EMPTY_RESOURCE_FILTERS: ResourceFilters = {
  search: '',
  categories: [],
  qualities: [],
};

export function matchesResourceFilters(
  resource: Resource,
  filters: ResourceFilters,
) {
  const query = filters.search.trim().toLocaleLowerCase();
  return (
    (!query || resource.name.toLocaleLowerCase().includes(query)) &&
    (filters.categories.length === 0 ||
      filters.categories.includes(resource.category)) &&
    (filters.qualities.length === 0 ||
      (resource.quality !== undefined &&
        filters.qualities.includes(resource.quality)))
  );
}

function categoryRank(category: ResourceCategory) {
  const rank = RESOURCE_CATEGORY_ORDER.indexOf(category);
  return rank === -1 ? RESOURCE_CATEGORY_ORDER.length : rank;
}

export function compareResources(
  left: Resource,
  right: Resource,
  column: string | null,
  direction: 'asc' | 'desc',
) {
  let comparison = 0;
  if (column === 'name') comparison = left.name.localeCompare(right.name);
  else if (column === 'quality') {
    comparison = compareQuality(left.quality, right.quality);
  } else if (column === 'category') {
    comparison = categoryRank(left.category) - categoryRank(right.category);
  }
  if (comparison) return applyDir(comparison, direction);

  return (
    categoryRank(left.category) - categoryRank(right.category) ||
    compareQuality(left.quality, right.quality) ||
    left.name.localeCompare(right.name)
  );
}
