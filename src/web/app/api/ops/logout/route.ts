import { NextResponse } from "next/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

export async function POST() {
  const supabase = await getAuthClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/ops/login", process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000"), {
    status: 303, // POST → GET redirect
  });
}
