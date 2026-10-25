import { useLayoutEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import {
  BASE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_WIDTH,
  getRouteById,
  ROUTE_PATH,
  getRouteMetaEntry,
  SITE_NAME,
  type RouteMeta as RouteMetaType,
} from '@/constants/route-meta';
import {
  formatPageTitle,
  removeMetaTag,
  upsertCanonicalLink,
  upsertMetaTag,
} from '@/utils/document-head';

function getRouteMeta(pathname: string): RouteMetaType {
  const explicit = getRouteMetaEntry(pathname);

  if (explicit) {
    return explicit.meta;
  }

  const notFound = getRouteById('notFound');

  return (
    notFound?.meta ?? {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    }
  );
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  const routeMeta = useMemo(() => getRouteMeta(pathname), [pathname]);
  const showDefaultImage =
    pathname === ROUTE_PATH.home || getRouteMetaEntry(pathname) === undefined;

  useLayoutEffect(() => {
    const pageTitle = formatPageTitle(routeMeta.title);
    const pageUrl = `${BASE_URL}${pathname}`;
    const existingPageUrl = document
      .querySelector<HTMLMetaElement>('meta[property="og:url"]')
      ?.getAttribute('content');
    const existingImage = document
      .querySelector<HTMLMetaElement>('meta[property="og:image"]')
      ?.getAttribute('content');
    const preserveRelatedImage =
      !showDefaultImage &&
      existingPageUrl === pageUrl &&
      Boolean(existingImage && existingImage !== DEFAULT_IMAGE);

    document.title = pageTitle;
    upsertCanonicalLink(pageUrl);
    upsertMetaTag('name', 'description', routeMeta.description);

    upsertMetaTag('property', 'og:title', pageTitle);
    upsertMetaTag('property', 'og:description', routeMeta.description);
    upsertMetaTag('property', 'og:url', pageUrl);
    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:site_name', SITE_NAME);
    upsertMetaTag('name', 'twitter:title', pageTitle);
    upsertMetaTag('name', 'twitter:description', routeMeta.description);

    if (preserveRelatedImage) return;

    if (showDefaultImage) {
      upsertMetaTag('property', 'og:image', DEFAULT_IMAGE);
      upsertMetaTag('property', 'og:image:secure_url', DEFAULT_IMAGE);
      upsertMetaTag('property', 'og:image:width', DEFAULT_IMAGE_WIDTH);
      upsertMetaTag('property', 'og:image:height', DEFAULT_IMAGE_HEIGHT);
      upsertMetaTag('property', 'og:image:type', 'image/jpeg');
      upsertMetaTag('property', 'og:image:alt', DEFAULT_IMAGE_ALT);
      upsertMetaTag('name', 'twitter:card', 'summary_large_image');
      upsertMetaTag('name', 'twitter:image', DEFAULT_IMAGE);
      upsertMetaTag('name', 'twitter:image:alt', DEFAULT_IMAGE_ALT);
      return;
    }

    for (const key of [
      'og:image',
      'og:image:secure_url',
      'og:image:width',
      'og:image:height',
      'og:image:type',
      'og:image:alt',
    ]) {
      removeMetaTag('property', key);
    }
    removeMetaTag('name', 'twitter:image');
    removeMetaTag('name', 'twitter:image:alt');
    upsertMetaTag('name', 'twitter:card', 'summary');
  }, [pathname, routeMeta, showDefaultImage]);

  return null;
}
