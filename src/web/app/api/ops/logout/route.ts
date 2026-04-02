import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { APP_BASE_URL } from "@/src/lib/config/appUrl";

export async function POST(req: NextRequest) {
  const redirectResponse = NextResponse.redirect(new URL("/ops/login", APP_BASE_URL), {
    status: 303,
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookie deletions directly onto the redirect response
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.signOut({ scope: "local" });
  }

  return redirectResponse;
}
