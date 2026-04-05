// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptToken } from "@/app/helpers/encryptToken";

export async function POST(request: Request) {
  const { token } = await request.json();

  const hashedToken = encryptToken(token);

  const cookieStore = await cookies();
  cookieStore.set(process.env.NEXT_PUBLIC_TOKEN_NAME!, hashedToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 5,
  });

  return NextResponse.json({ success: true });
}
