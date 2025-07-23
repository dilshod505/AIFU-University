import axios from "axios";
import Cookies from "js-cookie";

export const baseBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://10.10.1.137:8080";

export const api = axios.create({
  baseURL: baseBackendUrl + "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});
//
api.interceptors.request.use((config) => {
  const token = Cookies.get("ar-book-token");
  if (token) {
    config.headers["ar-book-token"] = `${token}`;
  }
  return config;
});
//
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response.status === 401) {
//       Cookies.remove("ar-book-token");
//       localStorage.removeItem("ar-books");
//
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );
