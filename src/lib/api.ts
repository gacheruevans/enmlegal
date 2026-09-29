import axios from "axios";
import { isTokenExpired, handleSessionExpired, clearAuth } from "./auth";
import { API_URL } from "./config";

const api = axios.create({
	baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("token");
		if (token) {
			if (isTokenExpired(token)) {
				// Token has expired: clean up and handle session expiration
				clearAuth();
				if (window.location.pathname.startsWith("/admin")) {
					handleSessionExpired();
					return Promise.reject(new axios.Cancel("Session expired. Please log in again."));
				}
			} else {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Backend rejected the token as invalid or expired
			handleSessionExpired();
		}
		return Promise.reject(error);
	}
);

export default api;
