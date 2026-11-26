import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { setPageTitle } from '@/utils/document-head';

/**
 * Replaces the generic route title with the entity's name once it has loaded.
 * RouteMeta writes the generic title in a layout effect whenever the path
 * changes, so this re-applies on path changes too, e.g. after a legacy slug
 * redirects to the same entity under its current slug.
 */
export function useEntityPageTitle(name: string | undefined): void {
  const { pathname } = useLocation();
  useEffect(() => {
    if (name) setPageTitle(name);
  }, [name, pathname]);
}
