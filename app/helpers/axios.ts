"use client";
import axios from "axios";
import Cookies from "js-cookie";
import { decryptToken } from "./decryptToken";

/**
 * Axios instance for CYPHER Ecommerce Platform.
 * Configured with base URL and credentials for JWT handling.
 */
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
const token_name = process.env.NEXT_PUBLIC_TOKEN_NAME!;

const token = decryptToken(Cookies.get(token_name)!);

export const apiInstance = axios.create({
  baseURL,
  withCredentials: true, // Required for HttpOnly Cookies
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
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
