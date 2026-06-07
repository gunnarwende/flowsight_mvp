"use client";

/**
 * Lisa-Testanruf-Beweis-Loop (Onboarding-Cockpit Phase 2, OC6).
 *
 * „Lisa jetzt anrufen" im Cockpit: der Betrieb hört SEINE Lisa (mit seinem
 * Firmennamen + seinem Wissen) live im Browser. Der Web-Call läuft gegen einen
 * geteilten Cockpit-Test-Agenten; die Draft-Config wird serverseitig als
 * `retell_llm_dynamic_variables` pro Call injiziert (kein Publish, kein
 * Per-Session-Agent). Der entstehende Fall trägt `is_demo` → fällt aus den KPIs
 * (G6: der erste ECHTE Anruf bleibt der erste Fall).
 *
 * Der Retell-Server-SDK-Call passiert in /api/aufbau/[token]/testcall; hier nur
 * der Browser-Teil (Mikrofon + WebRTC via retell-client-js-sdk).
 */

import { RetellWebClient } from "retell-client-js-sdk";

export type TestCallPhase = "idle" | "connecting" | "active" | "ended" | "error";

let activeClient: RetellWebClient | null = null;

/**
 * Startet (oder beendet) einen Lisa-Testanruf. Idempotent: ein laufender Call
 * wird beim erneuten Aufruf sauber beendet. Meldet Phasenwechsel via onPhase.
 */
export async function startLisaTestCall(
  token: string,
  onPhase: (p: TestCallPhase) => void,
): Promise<void> {
  // Läuft schon ein Call? → beenden (Button wird zum „auflegen").
  if (activeClient) {
    try {
      activeClient.stopCall();
    } catch {
      /* noop */
    }
    activeClient = null;
    onPhase("ended");
    return;
  }

  onPhase("connecting");
  try {
    const res = await fetch(`/api/aufbau/${token}/testcall`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    if (!res.ok) {
      onPhase("error");
      return;
    }
    const { accessToken } = (await res.json()) as { accessToken?: string };
    if (!accessToken) {
      onPhase("error");
      return;
    }

    const client = new RetellWebClient();
    activeClient = client;
    client.on("call_started", () => onPhase("active"));
    client.on("call_ended", () => {
      onPhase("ended");
      activeClient = null;
    });
    client.on("error", () => {
      try {
        client.stopCall();
      } catch {
        /* noop */
      }
      onPhase("error");
      activeClient = null;
    });

    // Fragt im Browser nach Mikrofon-Erlaubnis + verbindet.
    await client.startCall({ accessToken });
  } catch {
    onPhase("error");
    activeClient = null;
  }
}
