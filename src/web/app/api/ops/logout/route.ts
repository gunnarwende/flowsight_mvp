import { NextResponse } from "next/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

export async function POST() {
  const supabase = await getAuthClient();
  // scope: 'local' — only clears this session's cookies, doesn't call
  // Supabase auth server. Faster logout, no side effects on rate limits.
  await supabase.auth.signOut({ scope: "local" });

  return NextResponse.redirect(new URL("/ops/login", process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000"), {
    status: 303, // POST → GET redirect
  });
}
