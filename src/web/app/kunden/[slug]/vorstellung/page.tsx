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
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="mx-auto max-w-xl px-5 pt-10 sm:pt-14">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <Image
            src="/vorstellung/gunnar.png"
            alt={v.contact.name}
            width={64}
            height={64}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover shadow-sm"
            priority
          />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-400">
              {v.contact.name} · {v.contact.location}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
              {v.headline}
            </h1>
          </div>
        </div>

        {/* Question */}
        <blockquote
          className="mt-7 border-l-[3px] pl-4 text-[15px] font-medium leading-relaxed text-gray-800 sm:text-base"
          style={{ borderColor: accent }}
        >
          {v.question}
        </blockquote>

        {/* Value proposition */}
        <p className="mt-4 text-[14px] leading-relaxed text-gray-500">
          {v.valueProp}
        </p>
      </header>

      {/* ── Modules ──────────────────────────────────────── */}
      <main className="mx-auto max-w-xl px-5 pt-8 pb-2">
        <ol className="space-y-5">
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

      {/* ── Closing ──────────────────────────────────────── */}
      <footer className="mx-auto max-w-xl px-5 pt-8 pb-12">
        <div className="flex items-start gap-3">
          <Image
            src="/vorstellung/gunnar.png"
            alt={v.contact.name}
            width={40}
            height={40}
            className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
          <div className="space-y-3 text-[14px] leading-relaxed text-gray-600">
            {v.closing.split("\n\n").map((para, i) => (
              <p key={i}>
                {para.split("\n").map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 text-center text-[13px] text-gray-400">
          <a
            href={`tel:${v.contact.phone.replace(/\s/g, "")}`}
            className="underline decoration-gray-300 underline-offset-2 hover:text-gray-600"
          >
            {v.contact.phone}
          </a>
          {" · "}
          <a
            href={`mailto:${v.contact.email}`}
            className="underline decoration-gray-300 underline-offset-2 hover:text-gray-600"
          >
            {v.contact.email}
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Module Card                                                       */
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
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[15px] top-[36px] bottom-[-20px] w-px"
          style={{ backgroundColor: `${accent}25` }}
        />
      )}

      <div className="flex gap-3.5">
        {/* Number */}
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {index}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[15px] font-semibold leading-snug text-gray-900">
            {mod.title}
          </h3>
          <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">
            {mod.subtitle}
          </p>

          {/* Video */}
          <div className="mt-3">
            {mod.videoUrl ? (
              <VideoEmbed
                url={mod.videoUrl}
                title={mod.title}
                duration={mod.duration}
                accent={accent}
              />
            ) : (
              <VideoPlaceholder accent={accent} />
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
  const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (match)
    return `https://www.loom.com/embed/${match[1]}?hide_owner=true&hide_share=true&hide_title=true`;
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

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}15` }}
      >
        <PlayIcon accent={accent} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Video ansehen
        </p>
        {duration && <p className="text-xs text-gray-400">{duration}</p>}
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Placeholder                                                       */
/* ------------------------------------------------------------------ */

function VideoPlaceholder({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white/60 px-3 py-2.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}10` }}
      >
        <PlayIcon accent={accent} />
      </div>
      <p className="text-[13px] text-gray-400">Video wird vorbereitet</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Play Icon                                                         */
/* ------------------------------------------------------------------ */

function PlayIcon({ accent }: { accent: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M5 3.5V12.5L13 8L5 3.5Z" fill={accent} opacity={0.7} />
    </svg>
  );
}
