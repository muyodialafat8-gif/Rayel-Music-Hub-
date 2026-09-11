/**
 * Safely resolves the application's base URL using the browser's current origin.
 * Automatically works in AI Studio preview, Vercel production, preview deployments,
 * and localhost without requiring any environment variables.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

