import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    env: process.env.VERCEL_ENV ?? "development",
  });
}
