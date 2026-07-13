import { AuthProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:3000";

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/",
    };
  },
  check: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return {};
  },
  getPermissions: async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return null;
  },
  getIdentity: async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};
