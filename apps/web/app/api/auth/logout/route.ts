import { type NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/stellar-auth";
import { blacklistToken } from "@/lib/auth/token-blacklist";

/**
 * POST /api/auth/logout
 *
 * Logs out the current user by:
 * 1. Blacklisting the JWT (if Redis is configured) so it can't be reused
 * 2. Clearing the auth-token cookie
 *
 * This route always succeeds, even if no user is logged in.
 */
export async function POST(request: NextRequest) {
  // Try to blacklist the current token before clearing it
  const token = request.cookies.get("auth-token")?.value;
  if (token) {
    try {
      const payload = verifyJwt(token);
      if (payload?.jti && payload?.exp) {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        await blacklistToken(payload.jti, ttl);
      }
    } catch {
      // Token may already be invalid — continue with cookie cleanup
    }
  }

  const response = NextResponse.json(
    { success: true, data: { message: "Logged out successfully" } },
    { status: 200 }
  );

  // Clear the auth-token cookie by setting it with maxAge: 0
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}
