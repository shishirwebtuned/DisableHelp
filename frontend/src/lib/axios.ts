import axios from "axios";
import { toast } from "sonner";

declare module "axios" {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1/en/",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase() || "";
    // const url = response.config.url || "";

    // console.log("axios url:", response.config.url);

    // const silentUrls = ["/message/mark-read", "/message/", "/notifications/mark-read"];

    // const isSilent = silentUrls.some((u) => url.includes(u));

    if (
      ["post", "put", "patch", "delete"].includes(method) &&
      !response.config.silent
    ) {
      const successMessage =
        response.data?.message || "Operation completed successfully";
      toast.success(successMessage);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "An error occurred";

      switch (status) {
        case 400:
          toast.error(errorMessage || "Bad request");
          break;
        case 401: {
          toast.error(errorMessage);
          // Avoid forcing a full-page redirect if we're already on the login page
          // or if the failing request is the login endpoint itself. In those cases,
          // let the UI handle the error without refreshing the page.
          // if (typeof window !== 'undefined') {
          //     const currentPath = window.location.pathname || '';
          //     const requestUrl = String(error.config?.url || '').toLowerCase();
          //     const isLoginRequest = requestUrl.includes('/login');
          //     const onLoginPage = currentPath === '/login' || currentPath === '/auth/login';

          //     if (!isLoginRequest && !onLoginPage) {
          //         setTimeout(() => {
          //             window.location.href = '/login';
          //         }, 1500);
          //     }
          // }
          break;
        }
        case 403:
          toast.error(
            errorMessage || "Access forbidden. You don't have permission.",
          );
          break;
        case 404:
          toast.error("Resource not found");
          break;
        case 422:
          toast.error(errorMessage || "Validation error");
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        case 503:
          toast.error("Service unavailable. Please try again later.");
          break;
        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      console.error("Network Error:", error.request);
      toast.error("Network error. Please check your connection.");
    } else {
      console.error("Error:", error.message);
      toast.error(error.message || "An unexpected error occurred");
    }
    return Promise.reject(error);
  },
);

export default api;
