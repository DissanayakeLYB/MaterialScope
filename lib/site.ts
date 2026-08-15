/**
 * Canonical site origin. Set NEXT_PUBLIC_SITE_URL in production (see
 * .env.example); falls back to localhost so dev/OG URLs always resolve.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
