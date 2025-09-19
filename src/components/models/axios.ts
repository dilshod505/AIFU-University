import axios from "axios";
import Cookies from "js-cookie";

export const baseBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://aifu-library.duckdns.org\n";

export const api = axios.create({
  baseURL: baseBackendUrl + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // "Access-Control-Allow-Origin": "*",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("aifu-token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const makeFullUrl = (path?: string | null): string | null => {
  if (!path) return null;

  // Allaqachon to‘liq URL bo‘lsa
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Nisbiy bo‘lsa, bazaviy domenni qo‘shib yuboramiz
  return `https://aifu-library.duckdns.org${path}`;
};
