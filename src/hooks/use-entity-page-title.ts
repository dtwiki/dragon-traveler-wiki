import { useEffect } from 'react';
import { setPageTitle } from '@/utils/document-head';

/**
 * Replaces the generic route title with the entity's name once it has loaded.
 * RouteMeta writes the generic title in a layout effect, so this always wins.
 */
export function useEntityPageTitle(name: string | undefined): void {
  useEffect(() => {
    if (name) setPageTitle(name);
  }, [name]);
}
