import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import fs from "node:fs/promises";
import path from "node:path";

const RUNBOOKS_DIR = path.join(process.cwd(), "..", "..", "docs", "runbooks");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  // Security: no path traversal
  if (!slug || slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const filePath = path.join(RUNBOOKS_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const headingMatch = content.match(/^#\s+(.+)$/m);
    const title = headingMatch ? headingMatch[1].trim() : slug;

    return NextResponse.json({ slug, title, content });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
