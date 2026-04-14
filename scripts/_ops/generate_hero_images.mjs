#!/usr/bin/env node
/**
 * generate_hero_images.mjs — Generate hero images via Nano Banana Pro (Gemini Flash Image)
 *
 * Generates 5 hero image candidates per business for the Website-Pipeline v2.
 * Each prompt is crafted to match the business's Wahrnehmungs-Profil (TRADITION/KOMPETENZ/NAEHE).
 *
 * Usage:
 *   node --env-file=.env.local scripts/_ops/generate_hero_images.mjs --slug=doerfler-ag
 *   node --env-file=.env.local scripts/_ops/generate_hero_images.mjs --slug=all
 *   node --env-file=.env.local scripts/_ops/generate_hero_images.mjs --slug=doerfler-ag --count=3
 *
 * Output: production/hero_candidates/{slug}/hero_01.jpg ... hero_05.jpg
 */

import fs from "node:fs";
import path from "node:path";

// ── Args ──────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const idx = a.indexOf("=");
    if (idx === -1) return [a.replace(/^--/, ""), "true"];
    return [a.substring(0, idx).replace(/^--/, ""), a.substring(idx + 1)];
  })
);

const targetSlug = args.slug;
const count = parseInt(args.count || "5", 10);

if (!targetSlug) {
  console.error("Usage: generate_hero_images.mjs --slug=<slug|all> [--count=5]");
  process.exit(1);
}

// ── API Key ───────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in environment");
  process.exit(1);
}

// ── Prompts per business (profile-matched) ────────────────────────

const PROMPTS = {
  "doerfler-ag": {
    profile: "TRADITION",
    prompt: `Create a premium, photorealistic hero image for a traditional Swiss plumbing and heating company established in 1926. Third-generation family business in Oberrieden, Lake Zurich.

The scene: a traditional plumbing workshop interior. Warm morning light streams through a frosted window on the left. A solid wooden workbench fills the lower frame, with aged but well-maintained brass fittings, copper pipe sections, and quality hand tools arranged with craftsman's care. Patina on metal surfaces tells the story of decades of skilled work. A worn leather tool belt hangs from a hook on the wall.

The space is clean, dignified, authentic — not staged, not a museum. It feels like a real working workshop that has been in use for generations. Think Swiss quality, Swiss restraint, Swiss precision — but warm, human, honest.

Color palette: warm brass and copper tones in the center, aged wood, morning light. No cold LED, no industrial feel. The warmth comes from the materials and the light, not from color grading.

Composition: 16:9 horizontal. The upper third should have enough calm space for a headline text overlay. The workbench and tools anchor the lower two-thirds. Shallow depth of field — foreground tools sharp, background softly blurred.

No people visible. No logos. No text. No modern elements (no screens, no LED strips, no plastic). This must feel timeless — it could be 1970 or 2026.

One single 16:9 still image. Ultra-high photorealism. Restrained, warm, dignified.`,
  },

  "walter-leuthold": {
    profile: "NAEHE",
    prompt: `Create a premium, photorealistic hero image for a solo Swiss plumber and roofer business on the shores of Lake Zurich. One-man operation since 2001, deeply rooted in the local community of Oberrieden.

The scene: a quiet residential street in a Swiss lakeside village at golden hour. A well-maintained white van with clean lines (no visible logos or text) is parked in front of a charming Swiss residential building — stucco facade, dark wood shutters, tidy garden. The front door of the house is slightly open, suggesting someone just arrived for a service call. A leather tool bag sits on the doorstep.

Through a gap between buildings, Lake Zurich is faintly visible in the warm evening light — mountains on the far shore just hinted at. The overall feeling is: this is a neighborhood where everyone knows the local tradesman by first name.

Color palette: warm golden hour light, white/cream building facades, dark green shutters, hints of lake blue in the distance. The feeling is warm, local, intimate, trustworthy. Not commercial, not polished, not urban.

Composition: 16:9 horizontal. The scene is shot from slightly across the street, like a passerby noticing a familiar service van. The upper third has enough sky for a text overlay. The building and van fill the middle, the doorstep with tool bag creates human presence without showing a person.

No people visible. No logos. No text on the van or building. No generic stock-photo feeling. This must feel like a real moment in a real Swiss village — quiet, reliable, neighborly.

One single 16:9 still image. Ultra-high photorealism. Warm, local, intimate.`,
  },

  "orlandini": {
    profile: "KOMPETENZ",
    prompt: `Create a premium, photorealistic hero image for a professional Swiss plumbing and heating company in Horgen. Established 1972, known for working with major premium brands (Geberit, Grohe, Duravit). Professional, efficient, technically excellent.

The scene: a modern, well-organized plumbing workshop or installation room. Cool LED ceiling lights illuminate a clean space. On the left wall, a professional tool board with color-coded, precisely arranged tools. In the center, a sleek stainless steel work surface with a premium chrome mixer tap and a Geberit-style concealed cistern frame, partially assembled — showing technical expertise mid-project.

The floor is clean polished concrete. Everything is orderly, efficient, professional. This is not a rustic workshop — it's a precision workspace. Think Swiss engineering meets modern installation.

Color palette: cool tones — stainless steel, chrome, polished concrete, white LED light. The only warmth comes from a subtle copper accent on some pipe fittings. Overall cool, clean, professional, contemporary.

Composition: 16:9 horizontal. Shot from a slightly low angle to emphasize the professional workspace. The upper portion has clean wall space for a headline overlay. The tool board on the left and the work surface in the center create visual interest. Moderate depth of field — everything reasonably sharp, suggesting clarity and precision.

No people visible. No logos or brand names readable. No text. This must feel like a high-end installation workshop — competent, organized, technically excellent. Not a bathroom showroom, not a retail space, not a catalog.

One single 16:9 still image. Ultra-high photorealism. Cool, precise, professional.`,
  },
};

// ── Nano Banana Pro API ───────────────────────────────────────────

const MODEL = "nano-banana-pro-preview";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function generateImage(prompt, outputPath) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "16:9" },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ API Error (${res.status}): ${err.substring(0, 200)}`);
    return false;
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
      const sizeKB = Math.round(fs.statSync(outputPath).size / 1024);
      console.log(`  ✅ ${path.basename(outputPath)} (${sizeKB} KB)`);
      return true;
    }
  }

  // Check for text response (safety filter or error)
  for (const part of parts) {
    if (part.text) console.log(`  ⚠ Text response: ${part.text.substring(0, 150)}`);
  }
  return false;
}

// ── Main ──────────────────────────────────────────────────────────

async function generateForSlug(slug) {
  const config = PROMPTS[slug];
  if (!config) {
    console.error(`  ❌ No prompt defined for: ${slug}`);
    return;
  }

  const outDir = `production/hero_candidates/${slug}`;
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  Hero Generator: ${slug.padEnd(28)}║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  Profile:    ${config.profile}`);
  console.log(`  Candidates: ${count}`);
  console.log(`  Output:     ${outDir}/\n`);

  let success = 0;
  for (let i = 1; i <= count; i++) {
    const filename = `hero_${String(i).padStart(2, "0")}.jpg`;
    const outputPath = path.join(outDir, filename);
    console.log(`  [${i}/${count}] Generating ${filename}...`);

    const ok = await generateImage(config.prompt, outputPath);
    if (ok) success++;

    // Rate limit: 1 request per 2 seconds
    if (i < count) await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n  Done: ${success}/${count} images generated → ${outDir}/`);
  console.log(`  Next: Founder picks best → copy to public/kunden/${slug}/hero.jpg`);
}

async function main() {
  const slugs = targetSlug === "all" ? Object.keys(PROMPTS) : [targetSlug];

  for (const slug of slugs) {
    await generateForSlug(slug);
  }

  console.log("\n═══════════════════════════════════════════════");
  console.log("  All done. Review candidates in production/hero_candidates/");
  console.log("  Pick the best hero per business and copy to public/kunden/{slug}/hero.jpg");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
