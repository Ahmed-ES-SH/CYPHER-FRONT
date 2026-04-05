import { cookies } from "next/headers";
import { decryptToken } from "./decryptToken";

export default async function FetchData<T = any>(
  api: string,
  paginationState: boolean = false,
  tags?: string[],
): Promise<{ data: T; pagination?: any } | T | boolean> {
  try {
    const cookieStore = cookies();

    const tokenValue = await (
      await cookieStore
    ).get(process.env.NEXT_PUBLIC_TOKEN_NAME!);
    const token = tokenValue ? decryptToken(tokenValue.value) : undefined;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept-Language": "en",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${api}`,
      {
        method: "GET",
        credentials: "include",
        headers,

        // next: {
        //   revalidate: 60,
        //   tags,
        // },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (paginationState) {
      return {
        data: result.data || [],
        pagination: result.pagination || {},
      };
    }

    return result;
  } catch (error) {
    console.error("Error fetching data:", error);

    return false;
  }
}
