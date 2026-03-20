import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

const REQUIRED_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "RETELL_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "ECALL_API_USERNAME",
  "SENTRY_DSN",
  "TELEGRAM_BOT_TOKEN",
  "GITHUB_ISSUES_TOKEN",
  "LIFECYCLE_TICK_SECRET",
  "FOUNDER_EMAIL",
  "APP_URL",
] as const;

const CATEGORY_MAP: Record<string, string> = {
  SUPABASE_URL: "Database",
  SUPABASE_SERVICE_ROLE_KEY: "Database",
  RESEND_API_KEY: "Email",
  RETELL_API_KEY: "Voice",
  TWILIO_ACCOUNT_SID: "SMS",
  ECALL_API_USERNAME: "SMS",
  SENTRY_DSN: "Monitoring",
  TELEGRAM_BOT_TOKEN: "Monitoring",
  GITHUB_ISSUES_TOKEN: "Ops",
  LIFECYCLE_TICK_SECRET: "Ops",
  FOUNDER_EMAIL: "Ops",
  APP_URL: "Ops",
};

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const vars = REQUIRED_VARS.map((name) => ({
    name,
    category: CATEGORY_MAP[name] ?? "Other",
    configured: !!process.env[name],
  }));

  return NextResponse.json({ vars });
}
