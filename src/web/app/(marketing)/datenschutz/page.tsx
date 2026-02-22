import type { Metadata } from "next";
import { SITE } from "@/src/lib/marketing/constants";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Datenschutzerklärung
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Stand: Februar 2026
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-slate-700">
          {/* 1. Verantwortlich */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              1. Verantwortliche Stelle
            </h2>
            <div className="mt-3 space-y-1">
              <p className="font-semibold">{SITE.legalName}</p>
              <p>{SITE.address.street}</p>
              <p>
                {SITE.address.zip} {SITE.address.city}
              </p>
              <p>
                E-Mail:{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {SITE.email}
                </a>
              </p>
            </div>
          </div>

          {/* 2. Erhobene Daten */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              2. Welche Daten wir erheben
            </h2>
            <p className="mt-3">
              Wir verarbeiten personenbezogene Daten nur, soweit dies zur
              Bereitstellung unserer Dienstleistung erforderlich ist:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <strong>Schadensmeldungen (Voice / Web):</strong> Postleitzahl,
                Ort, Kategorie, Dringlichkeit, Problembeschreibung,
                Kontaktdaten (Name, E-Mail, Telefon). Keine
                Gesprächsaufnahmen.
              </li>
              <li>
                <strong>Ops-Dashboard:</strong> E-Mail-Adresse zur
                Authentifizierung, Fallbearbeitungs-Daten (Termine, Notizen,
                Anhänge).
              </li>
              <li>
                <strong>Website:</strong> Standardmässige Server-Logs
                (IP-Adresse, Zeitstempel, aufgerufene Seiten). Keine
                Tracking-Cookies, kein Analytics.
              </li>
            </ul>
          </div>

          {/* 3. Zweck */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              3. Zweck der Datenverarbeitung
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Entgegennahme und Weiterleitung von Schadensmeldungen</li>
              <li>E-Mail-Benachrichtigung an den Auftraggeber</li>
              <li>Bestätigungs-E-Mail an den Melder</li>
              <li>Fallverwaltung im Ops-Dashboard</li>
              <li>Terminplanung und Review-Anfragen</li>
            </ul>
          </div>

          {/* 4. Drittanbieter */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              4. Eingesetzte Drittanbieter
            </h2>
            <p className="mt-3">
              Zur Erbringung unserer Dienstleistung setzen wir folgende
              Drittanbieter ein:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Anbieter</th>
                    <th className="pb-3 pr-4">Zweck</th>
                    <th className="pb-3">Standort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 pr-4 font-medium">Supabase</td>
                    <td className="py-3 pr-4">Datenbank, Authentifizierung</td>
                    <td className="py-3">EU (Frankfurt)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Resend</td>
                    <td className="py-3 pr-4">E-Mail-Versand</td>
                    <td className="py-3">USA</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Twilio</td>
                    <td className="py-3 pr-4">Telefonie (Nummer, SIP)</td>
                    <td className="py-3">USA / EU</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Retell AI</td>
                    <td className="py-3 pr-4">Voice Agent (Sprachverarbeitung)</td>
                    <td className="py-3">USA</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Vercel</td>
                    <td className="py-3 pr-4">Hosting, Serverless Functions</td>
                    <td className="py-3">USA / EU</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Sentry</td>
                    <td className="py-3 pr-4">Fehlerüberwachung</td>
                    <td className="py-3">USA</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Mit allen Anbietern bestehen Auftragsverarbeitungsverträge
              (AVV) oder gleichwertige Datenschutzvereinbarungen.
            </p>
          </div>

          {/* 5. Speicherdauer */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              5. Speicherdauer
            </h2>
            <p className="mt-3">
              Personenbezogene Daten werden nur so lange gespeichert, wie
              dies für die Erfüllung des Vertragszwecks erforderlich ist
              oder gesetzliche Aufbewahrungspflichten bestehen.
            </p>
          </div>

          {/* 6. Rechte */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              6. Ihre Rechte
            </h2>
            <p className="mt-3">
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung,
              Löschung und Einschränkung der Verarbeitung Ihrer Daten.
              Bitte kontaktieren Sie uns unter{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-blue-600 hover:underline"
              >
                {SITE.email}
              </a>
              .
            </p>
          </div>

          {/* 7. Keine Aufnahmen */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              7. Telefongespräche
            </h2>
            <p className="mt-3">
              Telefongespräche mit dem Voice Agent werden{" "}
              <strong>nicht aufgezeichnet</strong>. Es werden ausschliesslich
              die vom Anrufer mitgeteilten Sachinformationen (Ort, Kategorie,
              Dringlichkeit, Problembeschreibung) in strukturierter Form
              erfasst. Keine personenbezogenen Daten (Namen, Telefonnummern,
              exakte Adressen) werden in die Fallbeschreibung übernommen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
