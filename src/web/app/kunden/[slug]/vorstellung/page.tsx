import { notFound } from "next/navigation";
import { getCustomer } from "@/src/lib/customers/registry";
import {
  getVorstellung,
  getAllVorstellungSlugs,
} from "@/src/lib/customers/vorstellung";
import type { Metadata } from "next";
import type { VorstellungModule } from "@/src/lib/customers/vorstellung";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Static Generation                                                 */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return getAllVorstellungSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCustomer(slug);
  const v = getVorstellung(slug);
  if (!c || !v) return {};
  return {
    title: `${c.companyName} — Persönliche Vorstellung`,
    description: `Eine persönliche Vorstellung des Leitsystems, vorbereitet für ${c.companyName}.`,
    robots: { index: false, follow: false },
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default async function VorstellungPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCustomer(slug);
  const v = getVorstellung(slug);
  if (!c || !v) notFound();

  const accent = c.brandColor ?? "#2b6cb0";

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── Personal Header ──────────────────────────────── */}
      <header className="mx-auto max-w-2xl px-5 pt-12 pb-2 sm:pt-16">
        <div className="flex items-start gap-5">
          <Image
            src="/vorstellung/gunnar.png"
            alt={v.contact.name}
            width={80}
            height={80}
            className="h-20 w-20 flex-shrink-0 rounded-full object-cover shadow-sm"
            priority
          />
          <div className="min-w-0 pt-1">
            <p className="text-sm font-medium text-gray-500">
              {v.contact.name} · {v.contact.location}
            </p>
            <h1 className="mt-1 text-xl font-semibold leading-snug text-gray-900 sm:text-2xl whitespace-pre-line">
              {v.headline}
            </h1>
          </div>
        </div>

        {/* Intro */}
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-gray-700">
          {v.intro.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Subtle divider */}
        <div className="mt-10 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Übersicht
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </header>

      {/* ── Modules ──────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-5 pt-8 pb-4">
        <ol className="space-y-6">
          {v.modules.map((mod, i) => (
            <ModuleCard
              key={i}
              index={i + 1}
              module={mod}
              accent={accent}
              isLast={i === v.modules.length - 1}
            />
          ))}
        </ol>
      </main>

      {/* ── Personal Closing ─────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-5 pt-6 pb-4">
        <div className="mt-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-start gap-4">
            <Image
              src="/vorstellung/gunnar.png"
              alt={v.contact.name}
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
            <div className="space-y-3 text-[15px] leading-relaxed text-gray-700">
              {v.closing.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Footer ───────────────────────────────── */}
      <footer className="mx-auto max-w-2xl px-5 pt-6 pb-16">
        <div className="text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700">{v.contact.name}</p>
          <p className="mt-1">
            <a
              href={`tel:${v.contact.phone.replace(/\s/g, "")}`}
              className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
            >
              {v.contact.phone}
            </a>
            {" · "}
            <a
              href={`mailto:${v.contact.email}`}
              className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
            >
              {v.contact.email}
            </a>
          </p>
          <p className="mt-1">{v.contact.location}</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Module Card Component                                             */
/* ------------------------------------------------------------------ */

function ModuleCard({
  index,
  module: mod,
  accent,
  isLast,
}: {
  index: number;
  module: VorstellungModule;
  accent: string;
  isLast: boolean;
}) {
  return (
    <li className="relative">
      {/* Vertical connector line between modules */}
      {!isLast && (
        <div
          className="absolute left-[19px] top-[44px] bottom-[-24px] w-px"
          style={{ backgroundColor: `${accent}20` }}
        />
      )}

      <div className="flex gap-4">
        {/* Number circle */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          {index}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-base font-semibold text-gray-900">
            {mod.title}
          </h3>
          <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
            {mod.subtitle}
          </p>

          {/* Video area */}
          <div className="mt-4">
            {mod.videoUrl ? (
              <VideoEmbed url={mod.videoUrl} title={mod.title} duration={mod.duration} accent={accent} />
            ) : (
              <VideoPlaceholder title={mod.title} accent={accent} />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Video Embed (Loom)                                                */
/* ------------------------------------------------------------------ */

function loomEmbedUrl(url: string): string | null {
  // https://www.loom.com/share/abc123 → https://www.loom.com/embed/abc123
  const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (match) return `https://www.loom.com/embed/${match[1]}?hide_owner=true&hide_share=true&hide_title=true`;
  // Already an embed URL
  if (url.includes("/embed/")) return url;
  return null;
}

function VideoEmbed({
  url,
  title,
  duration,
  accent,
}: {
  url: string;
  title: string;
  duration?: string;
  accent: string;
}) {
  const embedUrl = loomEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-200">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            title={title}
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen"
          />
        </div>
        {duration && (
          <div className="border-t border-gray-100 bg-white px-3 py-1.5 text-xs text-gray-400">
            {duration}
          </div>
        )}
      </div>
    );
  }

  // Fallback: external link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}15` }}
      >
        <PlayIcon accent={accent} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Video ansehen
        </p>
        {duration && (
          <p className="text-xs text-gray-400">{duration}</p>
        )}
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Placeholder (before videos are recorded)                          */
/* ------------------------------------------------------------------ */

function VideoPlaceholder({ accent }: { title?: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white/60 p-4">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}10` }}
      >
        <PlayIcon accent={accent} />
      </div>
      <p className="text-sm text-gray-400">
        Video wird vorbereitet
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Play Icon SVG                                                     */
/* ------------------------------------------------------------------ */

function PlayIcon({ accent }: { accent: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 3.5V12.5L13 8L5 3.5Z"
        fill={accent}
        opacity={0.7}
      />
    </svg>
  );
}
