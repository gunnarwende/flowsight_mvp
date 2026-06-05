#!/usr/bin/env node
/**
 * upload_canonical_t1.mjs — lädt die EINE, betriebsübergreifende T1 (Founder-Intro,
 * face-only, kein Text) einmalig zu Bunny hoch und gibt die GUID aus.
 *
 * Hintergrund (Founder 05.06., bewiesen via md5): take1.wav + take1_face.mp4 sind über
 * ALLE Betriebe bit-identisch → T1 ist tenant-agnostisch. Statt pro Betrieb zu generieren+
 * hochzuladen, gibt es EINE canonical GUID, die jede proof_page als videos.t1 referenziert.
 *
 * Die ausgegebene GUID wird als CANONICAL_T1_GUID in _lib/bunny.mjs hinterlegt.
 * Quelle = die abgenommene Dörfler-Variante (e924ee8…), unser T1-Goldstandard.
 *
 * Usage: node --env-file=src/web/.env.local scripts/_ops/upload_canonical_t1.mjs
 */
import { bunnyEnv, createAndUpload } from "./_lib/bunny.mjs";

const SRC = "docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/take1_faceonly.mp4";
const env = bunnyEnv();
const guid = await createAndUpload(env, "FlowSight — T1 Founder-Intro (canonical, alle Betriebe)", SRC);
console.log("\nCANONICAL_T1_GUID:", guid);
console.log("→ in scripts/_ops/_lib/bunny.mjs als export const CANONICAL_T1_GUID hinterlegen.");
