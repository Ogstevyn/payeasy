import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(JSON.stringify({}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
}

