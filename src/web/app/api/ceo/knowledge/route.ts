import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import fs from "node:fs/promises";
import path from "node:path";

const RUNBOOKS_DIR = path.join(process.cwd(), "..", "..", "docs", "runbooks");

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const entries = await fs.readdir(RUNBOOKS_DIR);
    const mdFiles = entries.filter(
      (f) => f.endsWith(".md") && f !== "README.md",
    );

    const runbooks = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(RUNBOOKS_DIR, filename);
        const content = await fs.readFile(filePath, "utf-8");
        const stat = await fs.stat(filePath);
        const slug = filename.replace(/\.md$/, "");

        // Extract first heading as title
        const headingMatch = content.match(/^#\s+(.+)$/m);
        const title = headingMatch ? headingMatch[1].trim() : slug;

        return {
          slug,
          title,
          size_bytes: stat.size,
        };
      }),
    );

    // Sort alphabetically by title
    runbooks.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json({ runbooks });
  } catch (err) {
    console.error("Failed to read runbooks directory:", err);
    return NextResponse.json({ runbooks: [] });
  }
}
