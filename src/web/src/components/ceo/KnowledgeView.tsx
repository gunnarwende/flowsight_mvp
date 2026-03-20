"use client";

import { useEffect, useState, useMemo } from "react";

interface RunbookSummary {
  slug: string;
  title: string;
  size_bytes: number;
}

interface RunbookDetail {
  slug: string;
  title: string;
  content: string;
}

/* ── Minimal markdown to HTML ──────────────────────────────────────── */
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (``` ... ```)
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_m, _lang, code) =>
        `<pre class="bg-navy-50 border border-navy-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed"><code>${escapeHtml(code.trimEnd())}</code></pre>`,
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-navy-50 px-1.5 py-0.5 rounded text-sm font-mono text-navy-700">$1</code>',
    )
    // Headings
    .replace(
      /^#### (.+)$/gm,
      '<h4 class="text-sm font-semibold text-navy-800 mt-5 mb-2">$1</h4>',
    )
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-base font-semibold text-navy-800 mt-6 mb-2">$1</h3>',
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-lg font-bold text-navy-900 mt-8 mb-3">$1</h2>',
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="text-xl font-bold text-navy-900 mt-6 mb-4">$1</h1>',
    )
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-4 border-navy-100" />')
    // Unordered list items
    .replace(
      /^[-*] (.+)$/gm,
      '<li class="ml-4 list-disc text-navy-700">$1</li>',
    )
    // Ordered list items
    .replace(
      /^\d+\.\s+(.+)$/gm,
      '<li class="ml-4 list-decimal text-navy-700">$1</li>',
    )
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-gold-600 hover:text-gold-700 underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    // Paragraphs: wrap standalone lines (not already wrapped in HTML)
    .replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, (line) => {
      if (line.startsWith("<")) return line;
      return `<p class="text-navy-700 leading-relaxed mb-2">${line}</p>`;
    });

  // Group adjacent <li> items
  html = html.replace(
    /(<li class="ml-4 list-disc[^"]*">[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`,
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal[^"]*">[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ol class="my-2 space-y-1">${match}</ol>`,
  );

  return html;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ── Helper: format file size ──────────────────────────────────────── */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/* ── Component ─────────────────────────────────────────────────────── */
export function KnowledgeView() {
  const [runbooks, setRunbooks] = useState<RunbookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<RunbookDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ceo/knowledge")
      .then((r) => r.json())
      .then((d) => setRunbooks(d.runbooks ?? []))
      .catch(() => setRunbooks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return runbooks;
    const q = search.toLowerCase();
    return runbooks.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q),
    );
  }, [runbooks, search]);

  async function openRunbook(slug: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/ceo/knowledge/${slug}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: RunbookDetail = await res.json();
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  // ── Detail view ─────────────────────────────────────────────────────
  if (detail) {
    return (
      <div>
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Zurück zur Übersicht
        </button>

        <div className="bg-white rounded-2xl border border-navy-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-navy-900">{detail.title}</h1>
            <span className="text-xs text-navy-400 font-mono">
              {detail.slug}.md
            </span>
          </div>
          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(detail.content),
            }}
          />
        </div>
      </div>
    );
  }

  // ── List view ───────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Wissen</h1>
          <p className="text-sm text-navy-500 mt-0.5">
            Runbooks & Betriebsanleitungen
          </p>
        </div>
        <span className="text-xs text-navy-400 font-medium">
          {runbooks.length} Dokumente
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Runbook suchen..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-100 bg-white text-sm text-navy-800 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-navy-400 text-sm">
          Lade Runbooks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-navy-400 text-sm">
          {search ? "Keine Runbooks gefunden." : "Keine Runbooks vorhanden."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rb) => (
            <button
              key={rb.slug}
              onClick={() => openRunbook(rb.slug)}
              disabled={detailLoading}
              className="bg-white border border-navy-100 rounded-2xl p-4 text-left hover:shadow-md hover:border-navy-200 transition-all duration-150 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-50 transition-colors">
                  <svg
                    className="w-4 h-4 text-navy-400 group-hover:text-gold-600 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-navy-800 leading-tight truncate">
                    {rb.title}
                  </h3>
                  <p className="text-xs text-navy-400 mt-1 font-mono truncate">
                    {rb.slug}.md
                  </p>
                  <p className="text-[11px] text-navy-300 mt-1">
                    {formatSize(rb.size_bytes)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
