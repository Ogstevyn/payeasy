import { type NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/stellar-auth";
import { captureError } from "@/lib/error-capture";
import { getServerClient } from "@/lib/supabase/server";

/**
 * Build a successful JSON response.
 */
export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

/**
 * Build an error JSON response.
 */
export function errorResponse(message: string, status = 400, code?: string) {
  return Response.json(
    { success: false, error: { message, ...(code && { code }) } },
    { status }
  );
}

/**
 * Extract the authenticated user's Stellar public key from the JWT cookie.
 *
 * Returns `null` when the token is missing or invalid.
 */
export function getUserId(request: NextRequest | Request): string | null {
  // Try the auth-token cookie first (set by /api/auth/verify)
  let token: string | undefined;

  if ("cookies" in request && typeof (request as NextRequest).cookies?.get === "function") {
    token = (request as NextRequest).cookies.get("auth-token")?.value;
  }

  // Fallback: check the Authorization header (Bearer <token>)
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload || typeof payload.sub !== "string") return null;

  return payload.sub;
}

/**
 * Higher-order function to wrap API handlers with error capture.
 */
export function withErrorCapture(handler: (request: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      // Capture the error
      const userId = getUserId(request);
      await captureError(error, {
        userId: userId || undefined,
        url: request.url,
        severity: "critical",
        extras: {
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
        },
      });

      // Return a standard error response
      return errorResponse(
        process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Internal Server Error")
          : "An unexpected error occurred. Our team has been notified.",
        500
      );
    }
  };
}
