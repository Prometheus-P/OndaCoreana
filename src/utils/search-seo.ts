/**
 * Search SEO Utilities
 *
 * Dynamic SEO meta tag management for search pages.
 * Used by buscar.astro for client-side SEO updates.
 */

/**
 * Helper to update or create meta tag
 */
function setMetaTag(selector: string, attribute: string, value: string): void {
  const tag = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (tag) {
    if (attribute === 'content') {
      (tag as HTMLMetaElement).content = value;
    } else if (attribute === 'href') {
      (tag as HTMLLinkElement).href = value;
    }
  }
}

/**
 * Update SEO meta tags dynamically based on search query
 */
export function updateSEOMetaTags(query: string, resultCount: number = 0): void {
  const siteUrl = window.location.origin;
  const hasValidQuery = query.length >= 2;

  if (hasValidQuery) {
    const newTitle = `Resultados para "${query}" | Buscar | OndaCoreana`;
    const newDescription = `${resultCount} resultado${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''} para "${query}" en OndaCoreana. Explora K-Dramas, K-Pop, noticias y guías.`;
    const canonicalUrl = `${siteUrl}/buscar?q=${encodeURIComponent(query)}`;

    // Update title
    document.title = newTitle;
    setMetaTag('meta[name="title"]', 'content', newTitle);

    // Update description
    setMetaTag('meta[name="description"]', 'content', newDescription);

    // Update canonical URL
    setMetaTag('link[rel="canonical"]', 'href', canonicalUrl);

    // Update Open Graph tags
    setMetaTag('meta[property="og:title"]', 'content', newTitle);
    setMetaTag('meta[property="og:description"]', 'content', newDescription);
    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);

    // Update Twitter tags
    setMetaTag('meta[name="twitter:title"]', 'content', newTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', newDescription);
    setMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);

    // Remove noindex for valid queries (allow indexing)
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.remove();
    }
  } else {
    // Reset to default for empty queries
    const defaultTitle = 'Buscar | OndaCoreana';
    const defaultDescription = 'Busca contenido sobre K-Dramas, K-Pop, noticias y guías de cultura coreana en español.';
    const canonicalUrl = `${siteUrl}/buscar`;

    document.title = defaultTitle;
    setMetaTag('meta[name="title"]', 'content', defaultTitle);
    setMetaTag('meta[name="description"]', 'content', defaultDescription);
    setMetaTag('link[rel="canonical"]', 'href', canonicalUrl);
    setMetaTag('meta[property="og:title"]', 'content', defaultTitle);
    setMetaTag('meta[property="og:description"]', 'content', defaultDescription);
    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    setMetaTag('meta[name="twitter:title"]', 'content', defaultTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', defaultDescription);
    setMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);

    // Ensure noindex is present for empty queries
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      robotsMeta.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(robotsMeta);
    }
  }
}
