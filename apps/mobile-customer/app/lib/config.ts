/**
 * eseller.mn — App Configuration
 */

export const CONFIG = {
  // API base URL (no trailing slash)
  API_URL: __DEV__
    ? 'http://192.168.1.9:3000/api'   // local dev server
    : 'https://eseller.mn/api',         // production

  // Request timeout (ms)
  TIMEOUT: 10000,

  // Web URL
  WEB_URL: 'https://eseller.mn',

  // Storage keys
  STORAGE_TOKEN: 'eseller-auth-token',
  STORAGE_USER: 'eseller-auth-user',
  STORAGE_ROLES: '@eseller_role_store',
};
