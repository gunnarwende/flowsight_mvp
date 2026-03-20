import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * POST /api/ops/support/upload — Get signed upload URL for support attachment.
 * Uses same bucket as case-attachments but under support/ prefix.
 * Body: { file_name: string, mime_type: string, size_bytes: number }
 */

const BUCKET = "case-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf"] as const;

function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fileName = typeof body.file_name === "string" ? body.file_name : "";
  const mimeType = typeof body.mime_type === "string" ? body.mime_type : "";
  const sizeBytes = typeof body.size_bytes === "number" ? body.size_bytes : 0;

  if (!fileName) {
    return NextResponse.json({ error: "file_name required" }, { status: 400 });
  }
  if (mimeType && !isAllowedMime(mimeType)) {
    return NextResponse.json({ error: "Only images and PDFs allowed" }, { status: 400 });
  }
  if (sizeBytes > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Max 10 MB per file" }, { status: 400 });
  }

  const safeName = sanitizeFileName(fileName);
  const uid = crypto.randomUUID().slice(0, 8);
  const storagePath = `support/${uid}-${safeName}`;

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error) {
    return NextResponse.json({ error: "Upload URL creation failed" }, { status: 502 });
  }

  return NextResponse.json({
    upload_url: data.signedUrl,
    storage_path: storagePath,
  });
}
