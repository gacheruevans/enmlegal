/**
 * Application environment configuration.
 * Pulls variables from Vite environment (.env) with safe fallbacks.
 */

// API URL: Can be specified via VITE_API_URL or API_URL in .env
export const API_URL: string =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_API_URL || import.meta.env?.API_URL)) ||
  "http://localhost:3000";

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
