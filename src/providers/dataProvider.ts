import { DataProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const getEndpoint = (resource: string) => {
  if (resource === "blog_posts") return "/posts";
  return `/${resource}`;
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    const endpoint = getEndpoint(resource);
    const params: any = {};

    if (pagination && pagination.current && pagination.pageSize) {
      params.page = pagination.current;
      params.limit = pagination.pageSize;
    }

    // Admin panel requests ALL statuses (DRAFT & PUBLISHED)
    if (resource === "blog_posts") {
      params.status = "ALL";
    }

    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter && "value" in filter) {
          if (filter.field === "categoryId") {
            params.categoryId = filter.value;
          } else if (filter.field === "authorId") {
            params.authorId = filter.value;
          }
        }
      });
    }

    const { data } = await axiosInstance.get(endpoint, { params });

    if (data && data.nodes) {
      return {
        data: data.nodes,
        total: data.totalCount || data.nodes.length,
      };
    }

    return {
      data: Array.isArray(data) ? data : [data],
      total: Array.isArray(data) ? data.length : 1,
    };
  },

  getOne: async ({ resource, id }) => {
    const endpoint = getEndpoint(resource);
    const { data } = await axiosInstance.get(`${endpoint}/${id}`);
    return { data };
  },

  create: async ({ resource, variables }) => {
    const endpoint = getEndpoint(resource);
    const { data } = await axiosInstance.post(endpoint, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const endpoint = getEndpoint(resource);
    const { data } = await axiosInstance.patch(`${endpoint}/${id}`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const endpoint = getEndpoint(resource);
    const { data } = await axiosInstance.delete(`${endpoint}/${id}`);
    return { data };
  },

  getApiUrl: () => API_URL,
};
