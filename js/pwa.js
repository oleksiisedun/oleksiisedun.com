/**
 * Registers the service worker for offline support and installability.
 * No-ops if the browser doesn't support service workers; registration
 * failures are swallowed since this is a progressive enhancement.
 * @returns {void}
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
