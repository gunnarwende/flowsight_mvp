import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServiceClient } from "@/src/lib/supabase/server";
import { validateVerifyToken, validateShortVerifyToken } from "@/src/lib/sms/verifySmsToken";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUCKET = "case-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_PREFIXES = ["image/", "video/"] as const;

function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

// ---------------------------------------------------------------------------
// HMAC helper — loads case's created_at and validates the token
// ---------------------------------------------------------------------------

async function validateHmac(
  caseId: string,
  token: string,
): Promise<{ valid: boolean; caseExists: boolean }> {
  const supabase = getServiceClient();
  const { data: row, error } = await supabase
    .from("cases")
    .select("created_at")
    .eq("id", caseId)
    .single();

  if (error || !row) return { valid: false, caseExists: false };
  // Accept both full (64 hex) and short (16 hex) tokens — SMS sends short tokens
  const isFullToken = token.length === 64;
  return {
    valid: isFullToken
      ? validateVerifyToken(caseId, row.created_at, token)
      : validateShortVerifyToken(caseId, row.created_at, token),
    caseExists: true,
  };
}

// ---------------------------------------------------------------------------
// POST /api/verify/[caseId]/attachments
// Public endpoint — HMAC-protected (no auth).
// Actions: "request-upload" | "confirm"
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "Token required." }, { status: 400 });
  }

  const action = body.action;
  if (action !== "request-upload" && action !== "confirm") {
    return NextResponse.json(
      { error: 'Invalid action. Use "request-upload" or "confirm".' },
      { status: 400 },
    );
  }

  // HMAC validation
  const { valid, caseExists } = await validateHmac(caseId, token);
  if (!caseExists) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid token." }, { status: 403 });
  }

  const supabase = getServiceClient();

  // ── request-upload ──────────────────────────────────────────────────
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
        { error: "Dateityp nicht erlaubt. Bitte Bilder oder Videos." },
        { status: 400 },
      );
    }

    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Datei zu gross. Max ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 400 },
      );
    }

    const safeName = sanitizeFileName(fileName);
    const uid = crypto.randomUUID().slice(0, 8);
    const storagePath = `${caseId}/${uid}-${safeName}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (uploadErr) {
      Sentry.captureException(uploadErr, {
        tags: { area: "api", feature: "verify-attachments", case_id: caseId },
      });
      return NextResponse.json(
        { error: "Upload-URL konnte nicht erstellt werden." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      upload_url: uploadData.signedUrl,
      storage_path: storagePath,
    });
  }

  // ── confirm ─────────────────────────────────────────────────────────
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

  if (!storagePath.startsWith(`${caseId}/`)) {
    return NextResponse.json(
      { error: "storage_path does not match case." },
      { status: 400 },
    );
  }

  const { error: insertErr } = await supabase
    .from("case_attachments")
    .insert({
      case_id: caseId,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      created_by: null, // public upload — no authenticated user
    });

  if (insertErr) {
    Sentry.captureException(insertErr, {
      tags: { area: "api", feature: "verify-attachments", case_id: caseId },
    });
    return NextResponse.json(
      { error: "Datei konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }

  // Case event for audit trail
  await supabase
    .from("case_events")
    .insert({
      case_id: caseId,
      event_type: "photo_uploaded_by_reporter",
      title: `Foto hochgeladen: ${fileName}`,
      metadata: { storage_path: storagePath, mime_type: mimeType, source: "sms_verify" },
    })
    .then(({ error: evErr }) => {
      if (evErr) Sentry.captureException(evErr);
    });

  return NextResponse.json({ ok: true }, { status: 201 });
}
