/**
 * Pusher Auth Handler — Server-side module
 *
 * This handler proxies the auth request from the Pusher client to the backend.
 * The backend validates the httpOnly cookie and returns signed auth credentials.
 *
 * Usage: Import this handler in a Next.js API route shell at `app/api/pusher/auth/route.ts`
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthCookie } from "@/app/helpers/session";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("[pusher-auth] BACKEND_URL environment variable is not set.");
}

/**
 * POST /api/pusher/auth
 *
 * Pusher-js sends a POST request to the auth endpoint with:
 *   - socket_id: The Pusher socket ID
 *   - channel_name: The channel to authenticate for
 *
 * This handler forwards the request (including auth cookies) to the backend,
 * which returns signed Pusher auth credentials.
 */
export async function pusherAuthHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authCookie = await getAuthCookie();
    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized — no auth cookie found" }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get("socket_id");
    const channelName = formData.get("channel_name");

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 },
      );
    }

    const backendUrl = `${BACKEND_URL}/api/pusher/auth`;
    const body = new URLSearchParams();
    body.set("socket_id", socketId.toString());
    body.set("channel_name", channelName.toString());

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `cypher_auth_token=${encodeURIComponent(authCookie)}`,
      },
      body: body.toString(),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("[Pusher Auth] Backend rejected auth:", backendResponse.status, errorText);
      return NextResponse.json(
        { error: "Pusher auth failed" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Pusher Auth] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
