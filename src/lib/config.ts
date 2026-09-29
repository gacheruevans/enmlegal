/**
 * Application environment configuration.
 * Pulls variables from Vite environment (.env) with safe fallbacks and normalizes the API base path.
 */

const getBaseApiUrl = (): string => {
  let url =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.VITE_API_URL || import.meta.env?.API_URL));

  // Clean trailing slashes
  url = url.replace(/\/+$/, "");

  // Ensure /api/v1 prefix is present to match NestJS app.setGlobalPrefix('api/v1')
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }

  return url;
};

// API URL: Points directly to the NestJS global prefix /api/v1
export const API_URL: string = getBaseApiUrl();

// Session Cookie name
export const SESSION_COOKIE: string =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SESSION_COOKIE || import.meta.env?.SESSION_COOKIE)) ||
  "session";

// Session / JWT Key (client-side reference if needed)
export const SESSION_KEY: string =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SESSION_KEY || import.meta.env?.SESSION_KEY)) ||
  "";
