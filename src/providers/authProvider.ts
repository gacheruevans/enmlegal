import { AuthProvider } from "@refinedev/core";
import axios from "axios";
import { isTokenExpired, clearAuth } from "../lib/auth";
import { API_URL } from "../lib/config";

export const authProvider: AuthProvider = {
  login: async ({ credential }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/google`, { credential });
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return {
          success: true,
          redirectTo: "/admin",
        };
      }
      return {
        success: false,
        error: new Error("Authentication failed"),
      };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(error.response?.data?.message || error.message),
      };
    }
  },
  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Ignore network or authentication errors on logout
    }
    clearAuth();
    return {
      success: true,
      redirectTo: "/",
    };
  },
  check: async () => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      return {
        authenticated: true,
      };
    }
    const hadToken = Boolean(token);
    clearAuth();
    return {
      authenticated: false,
      redirectTo: hadToken ? "/login?expired=1" : "/login",
      logout: true,
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuth();
      return {
        logout: true,
        redirectTo: "/login?expired=1",
        error: new Error("Session expired. Please log in again."),
      };
    }
    return {};
  },
  getPermissions: async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role;
      } catch {
        return null;
      }
    }
    return null;
  },
  getIdentity: async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};
