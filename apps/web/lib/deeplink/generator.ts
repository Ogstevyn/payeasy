/**
 * @file generator.ts
 * @description Utility for generating shareable deep links for the PayEasy mobile app and web fallback.
 */

export interface DeepLinkParams {
  path: string;
  params?: Record<string, string | number | boolean>;
}

const NATIVE_SCHEMA = 'payeasy://';
const WEB_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://payeasy.com';

/**
 * Generates a deep link that works for both native apps and web fallbacks.
 * 
 * @param options - The path and parameters for the deep link
 * @returns An object containing the native link and the web fallback link
 */
export function generateDeepLink({ path, params = {} }: DeepLinkParams) {
  const queryPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Construct query string
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  const queryString = searchParams.toString();
  const suffix = queryString ? `${queryPath}?${queryString}` : queryPath;

  return {
    native: `${NATIVE_SCHEMA}${suffix}`,
    web: `${WEB_BASE_URL}/${suffix}`,
    // The link directed to our redirect service
    short: `${WEB_BASE_URL}/api/deeplink?path=${encodeURIComponent(queryPath)}&${queryString}`
  };
}

/**
 * Example usage:
 * const links = generateDeepLink({ 
 *   path: 'pay', 
 *   params: { recipient: 'user123', amount: 50 } 
 * });
 * console.log(links.short); 
 * // Output: https://payeasy.com/api/deeplink?path=pay&recipient=user123&amount=50
 */
