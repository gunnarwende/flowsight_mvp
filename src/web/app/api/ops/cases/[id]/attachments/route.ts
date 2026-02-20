import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUCKET = "case-attachments";
const DOWNLOAD_URL_TTL = 3600; // 1 hour
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf"] as const;

function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}

/** Sanitize filename: keep alphanumeric, dot, hyphen, underscore only. */
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function getAuthenticatedUser() {
  const supabase = await getAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ---------------------------------------------------------------------------
// GET /api/ops/cases/[id]/attachments — list with signed download URLs
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getServiceClient();

  // Verify case exists
  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .select("id")
    .eq("id", id)
    .single();

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  // Fetch attachments
  const { data: rows, error: listErr } = await supabase
    .from("case_attachments")
    .select("id, file_name, mime_type, size_bytes, created_at, storage_path")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  if (listErr) {
    Sentry.captureException(listErr, {
      tags: { area: "api", feature: "attachments", case_id: id },
    });
    return NextResponse.json(
      { error: "Failed to list attachments." },
      { status: 500 },
    );
  }

  // Generate signed download URLs
  const attachments = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data: urlData } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path, DOWNLOAD_URL_TTL);

      return {
        id: row.id,
        file_name: row.file_name,
        mime_type: row.mime_type,
        size_bytes: row.size_bytes,
        created_at: row.created_at,
        download_url: urlData?.signedUrl ?? null,
      };
    }),
  );

  return NextResponse.json({ attachments });
}

// ---------------------------------------------------------------------------
// POST /api/ops/cases/[id]/attachments — request-upload | confirm
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = body.action;
  if (action !== "request-upload" && action !== "confirm") {
    return NextResponse.json(
      { error: 'Invalid action. Use "request-upload" or "confirm".' },
      { status: 400 },
    );
  }

  const supabase = getServiceClient();

  // Verify case exists
  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .select("id")
    .eq("id", id)
    .single();

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  // ── request-upload ────────────────────────────────────────────────────
  if (action === "request-upload") {
    const fileName = typeof body.file_name === "string" ? body.file_name : "";
    const mimeType = typeof body.mime_type === "string" ? body.mime_type : "";
    const sizeBytes = typeof body.size_bytes === "number" ? body.size_bytes : 0;

    if (!fileName) {
      return NextResponse.json(
        { error: "file_name is required." },
        { status: 400 },
      );
    }

    if (mimeType && !isAllowedMime(mimeType)) {
      return NextResponse.json(
        { error: "File type not allowed. Use images or PDF." },
        { status: 400 },
      );
    }

    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 400 },
      );
    }

    const safeName = sanitizeFileName(fileName);
    const uid = crypto.randomUUID().slice(0, 8);
    const storagePath = `${id}/${uid}-${safeName}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (uploadErr) {
      Sentry.captureException(uploadErr, {
        tags: { area: "api", feature: "attachments", case_id: id },
      });
      return NextResponse.json(
        { error: "Failed to create upload URL. Is the storage bucket configured?" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      upload_url: uploadData.signedUrl,
      storage_path: storagePath,
    });
  }

  // ── confirm ───────────────────────────────────────────────────────────
  const storagePath =
    typeof body.storage_path === "string" ? body.storage_path : "";
  const fileName = typeof body.file_name === "string" ? body.file_name : "";
  const mimeType =
    typeof body.mime_type === "string" ? body.mime_type : null;
  const sizeBytes =
    typeof body.size_bytes === "number" ? body.size_bytes : null;

  if (!storagePath || !fileName) {
    return NextResponse.json(
      { error: "storage_path and file_name are required." },
      { status: 400 },
    );
  }

  // Safety: storage_path must start with case_id/
  if (!storagePath.startsWith(`${id}/`)) {
    return NextResponse.json(
      { error: "storage_path does not match case." },
      { status: 400 },
    );
  }

  const { data: row, error: insertErr } = await supabase
    .from("case_attachments")
    .insert({
      case_id: id,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      created_by: user.id,
    })
    .select("id, file_name, created_at")
    .single();

  if (insertErr) {
    Sentry.captureException(insertErr, {
      tags: { area: "api", feature: "attachments", case_id: id },
    });
    return NextResponse.json(
      { error: "Failed to save attachment record." },
      { status: 500 },
    );
  }

  console.log(
    JSON.stringify({
      _tag: "attachments",
      decision: "confirmed",
      case_id: id,
      attachment_id: row.id,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
    }),
  );

  return NextResponse.json({ ok: true, attachment: row }, { status: 201 });
}
