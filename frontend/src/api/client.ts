import axios from "axios";
import { env } from "../lib/env";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
