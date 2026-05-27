/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { ApiError } from "next/dist/server/api-utils";
import { PaginationMeta } from "../types/global";
import { getServerAuthCookieHeader } from "./session";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

/* =========================================================
   GLOBAL REQUEST
   ✔ credentials: "include"
   ✔ GET POST PATCH PUT DELETE
   ✔ auto json parse
   ✔ auto success/error handling
   ✔ transform response
========================================================= */

const DEBUG_MODE = true;
const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "global-request.log");

function debugLog(...args: any[]) {
  if (!DEBUG_MODE) return;
  try {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
    const timestamp = new Date().toISOString();
    const message = args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
    appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
  } catch {
    // silently fail
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface GlobalRequestOptions<TBody = any, TResult = any> {
  endpoint: string;
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  defaultErrorMessage?: string;
  transform?: (response: any) => TResult;
  returnRaw?: boolean;
  next?: RequestInit["next"];
  cache?: RequestCache;
  baseURL?: string;
}

interface GlobalResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  meta?: PaginationMeta;
}

/* =========================================================
   MAIN REQUEST
========================================================= */

export async function globalRequest<TBody = any, TResult = any>({
  endpoint,
  method = "GET",
  body,
  headers = {},
  defaultErrorMessage = "An unexpected error occurred",
  transform,
  returnRaw = false,
  next,
  cache = "no-store",
  baseURL,
}: GlobalRequestOptions<TBody, TResult>): Promise<GlobalResponse<TResult>> {
  const requestId = crypto.randomUUID?.() ?? Date.now().toString(36);
  const logCtx = { requestId, method, endpoint, hasBody: !!body };

  try {
    const resolvedBaseURL =
      baseURL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!resolvedBaseURL) {
      throw new Error(
        "globalRequest: API base URL is not configured. Set NEXT_PUBLIC_BACKEND_URL or pass baseURL.",
      );
    }
    const url = resolvedBaseURL + endpoint;

    debugLog("ENTRY", logCtx);
    debugLog("URL", { requestId, url });

    const requestHeaders = new Headers(headers);

    requestHeaders.set("Content-Type", "application/json");

    // This file runs exclusively on the server ("use server").
    // Node.js fetch does NOT send cookies automatically — they must be forwarded manually.
    // `credentials: "include"` has no effect in Node.js and is NOT used here.
    const authCookieHeader = await getServerAuthCookieHeader();

    debugLog("AUTH_COOKIE", { requestId, hasCookie: !!authCookieHeader });

    if (authCookieHeader) {
      const existingCookieHeader = requestHeaders.get("Cookie");
      requestHeaders.set(
        "Cookie",
        existingCookieHeader
          ? `${existingCookieHeader}; ${authCookieHeader}`
          : authCookieHeader,
      );
    }

    debugLog("FETCH_REQ", {
      requestId,
      method,
      url,
      headers: Object.fromEntries(requestHeaders.entries()),
      body: method === "GET" || method === "DELETE" ? undefined : body,
    });

    const response = await fetch(url, {
      method,
      cache,
      next,
      headers: requestHeaders,

      body:
        method === "GET" || method === "DELETE"
          ? undefined
          : JSON.stringify(body),
    });

    debugLog("FETCH_RES", {
      requestId,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    /* =============================
       Parse Response
    ============================== */

    let result: any = null;

    const contentType = response.headers.get("content-type") || "";

    debugLog("CONTENT_TYPE", { requestId, contentType });

    if (contentType.includes("application/json")) {
      result = await response.json();
      debugLog("PARSE_JSON", { requestId, result });
    } else {
      result = await response.text();
      debugLog("PARSE_TEXT", { requestId, result });
    }

    /* =============================
       Handle Error
    ============================== */

    if (!response.ok) {
      debugLog("ERROR_RESPONSE", {
        requestId,
        status: response.status,
        result,
      });
      return {
        success: false,
        message: result?.message || result?.error || defaultErrorMessage,
        statusCode: response.status,
      };
    }

    /* =============================
       Handle Success
    ============================== */

    const finalData = transform
      ? transform(result)
      : returnRaw
        ? result
        : result;

    debugLog("SUCCESS", { requestId, finalData });

    return {
      success: true,
      message: result?.message || "Request successful",
      data: finalData,
      statusCode: response.status,
    };
  } catch (error: any) {
    debugLog("CATCH", { requestId, error: error?.message ?? error, stack: error?.stack });
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      message: defaultErrorMessage,
    };
  }
}
