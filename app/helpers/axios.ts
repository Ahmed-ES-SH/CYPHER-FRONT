"use client";
import axios from "axios";

/**
 * Axios instance for CYPHER Ecommerce Platform.
 * Configured with base URL and credentials for JWT handling.
 */
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const apiInstance = axios.create({
  baseURL,
  withCredentials: true, // Required for HttpOnly Cookies
  timeout: 10000, // 10 seconds timeout
});

// --- Response Interceptor ---
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 403) {
      console.error("Access Denied: You don't have permission.");
    }

    return Promise.reject(error);
  },
);
