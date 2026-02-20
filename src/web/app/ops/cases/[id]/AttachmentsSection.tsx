"use client";

import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Attachment {
  id: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  download_url: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_UPLOAD = 5;
const ACCEPT = "image/*,.pdf";

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AttachmentsSection({ caseId }: { caseId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/api/ops/cases/${caseId}/attachments`);
      if (!res.ok) return;
      const data = await res.json();
      setAttachments(data.attachments ?? []);
    } catch {
      // silent — list will show empty
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate
    if (files.length > MAX_FILES_PER_UPLOAD) {
      setError(`Max ${MAX_FILES_PER_UPLOAD} Dateien gleichzeitig.`);
      e.target.value = "";
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" ist zu gross (max 10 MB).`);
        e.target.value = "";
        return;
      }
    }

    setError("");
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Step 1: Request signed upload URL
        const urlRes = await fetch(`/api/ops/cases/${caseId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request-upload",
            file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
          }),
        });

        if (!urlRes.ok) {
          const data = await urlRes.json().catch(() => ({}));
          throw new Error(data.error ?? `Upload-URL fehlgeschlagen (${urlRes.status})`);
        }

        const { upload_url, storage_path } = await urlRes.json();

        // Step 2: PUT file directly to Supabase Storage
        const putRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error(`Upload fehlgeschlagen für "${file.name}" (${putRes.status})`);
        }

        // Step 3: Confirm upload in DB
        const confirmRes = await fetch(`/api/ops/cases/${caseId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm",
            storage_path,
            file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
          }),
        });

        if (!confirmRes.ok) {
          const data = await confirmRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Bestätigung fehlgeschlagen.");
        }
      }

      // Refresh list
      await fetchAttachments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <h2 className="text-lg font-semibold mb-4">Anhänge</h2>

      {/* Upload */}
      <div className="mb-4">
        <label
          className={`inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:border-blue-500 hover:text-white ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {uploading ? "Hochladen\u2026" : "Dateien hochladen"}
          <input
            type="file"
            accept={ACCEPT}
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
        <span className="text-slate-500 text-xs ml-3">
          Bilder / PDF, max 10 MB, max 5 Dateien
        </span>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      {/* List */}
      {loading ? (
        <p className="text-slate-500 text-sm">Laden…</p>
      ) : attachments.length === 0 ? (
        <p className="text-slate-500 text-sm">Keine Anhänge.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between bg-slate-800/50 rounded px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="text-slate-200 truncate">{a.file_name}</p>
                <p className="text-slate-500 text-xs">
                  {formatBytes(a.size_bytes)} · {formatDate(a.created_at)}
                </p>
              </div>
              {a.download_url && (
                <a
                  href={a.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium ml-3 shrink-0"
                >
                  Download
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
