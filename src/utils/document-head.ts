import { SITE_NAME } from '@/constants/route-meta';

export function upsertMetaTag(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`;
  let meta = document.querySelector<HTMLMetaElement>(selector);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
}

export function removeMetaTag(attr: 'name' | 'property', key: string): void {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

export function upsertCanonicalLink(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = href;
}

export function formatPageTitle(title: string): string {
  return title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
}

export function setPageTitle(title: string): void {
  const pageTitle = formatPageTitle(title);
  document.title = pageTitle;
  upsertMetaTag('property', 'og:title', pageTitle);
  upsertMetaTag('name', 'twitter:title', pageTitle);
}
