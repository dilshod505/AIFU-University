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

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response.status === 401) {
//       Cookies.remove("aifu-token");
//       localStorage.removeItem("ar-base-base-books.tsx");
//
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );
