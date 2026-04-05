import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { decryptToken } from "@/app/helpers/decryptToken";
import { API_ENDPOINTS } from "@/constants/endpoints";

export async function POST() {
  const cookieStore = await cookies();
  const tokenName = process.env.NEXT_PUBLIC_TOKEN_NAME!;
  const encryptedToken = cookieStore.get(tokenName)?.value;

  if (!encryptedToken) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  try {
    const token = decryptToken(encryptedToken);

    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
      { token },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    cookieStore.delete(tokenName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(
      "Backend Blacklist Error:",
      error.response?.data || error.message,
    );

    cookieStore.delete(tokenName);

    return NextResponse.json({
      success: true,
      warning: "Local logout success, backend failed",
    });
  }
}
