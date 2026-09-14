const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !rawApiBaseUrl) {
  throw new Error('Missing required environment variable: VITE_API_BASE_URL');
}

function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // In local development / LAN, always match the browser's current hostname (localhost or Wi-Fi IP)
    // so that cookies (SameSite) and CSRF tokens match origins and are never blocked as cross-site
    if (!import.meta.env.PROD) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      return `${protocol}//${hostname}:3000`;
    }

    return rawApiBaseUrl;
  }

  return rawApiBaseUrl || 'http://localhost:3000';
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl()
};
