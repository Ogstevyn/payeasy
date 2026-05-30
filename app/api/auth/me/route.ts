import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { findUserById, toPublicUser } from "@/lib/auth/users";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json(null);

  const payload = await verifyToken(token);
  if (!payload) {
    const res = NextResponse.json(null);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const user = findUserById(payload.userId);
  if (!user) {
    const res = NextResponse.json(null);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const res = NextResponse.json(toPublicUser(user));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
