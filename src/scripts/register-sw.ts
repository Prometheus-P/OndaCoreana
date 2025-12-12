/**
 * Search service worker bootstrap.
 * Registration stays disabled until PUBLIC_ENABLE_SEARCH_SW === "true".
 */
const SEARCH_SW_PATH = '/service-worker.js';

export async function registerSearchServiceWorker() {
  if (
    import.meta.env.SSR ||
    import.meta.env.PUBLIC_ENABLE_SEARCH_SW !== 'true' ||
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    if (import.meta.env.DEV) {
      console.info('[search-sw] Registration skipped (missing prerequisites)');
    }
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SEARCH_SW_PATH, {
      type: 'module',
    });
    if (import.meta.env.DEV) {
      console.info('[search-sw] Registered', registration.scope);
    }
  } catch (error) {
    console.error('[search-sw] Failed to register service worker', error);
  }
}
