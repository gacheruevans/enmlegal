export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodes and parses a JWT token payload safely.
 */
export function parseJwt(token: string | null): JwtPayload | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks if the JWT token is expired (or will expire within 5 seconds).
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload) return true;
  if (!payload.exp) return false;

  // exp is in seconds, Date.now() is in ms. 5-second buffer for in-flight requests.
  return Date.now() >= payload.exp * 1000 - 5000;
}

/**
 * Gets the number of milliseconds remaining until the token expires.
 * Returns 0 if already expired, or null if no expiration date is present.
 */
export function getTimeUntilExpiration(token: string | null): number | null {
  if (!token) return 0;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return null;

  const msRemaining = payload.exp * 1000 - Date.now();
  return msRemaining > 0 ? msRemaining : 0;
}

/**
 * Clears authentication tokens and cached user data from localStorage,
 * and notifies any listeners.
 */
export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:logout"));
  }
}

/**
 * Centralized session expiry handler.
 * Clears auth state and redirects to the login page if the user is in the admin section.
 */
export function handleSessionExpired() {
  clearAuth();
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/admin")) {
      // Use replace so navigating back doesn't trap the user in the expired session
      window.location.replace("/login?expired=1");
    }
  }
}
