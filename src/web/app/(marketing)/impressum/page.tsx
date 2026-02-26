import type { Metadata } from "next";
import { SITE } from "@/src/lib/marketing/constants";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <section className="bg-warm-white py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          Impressum
        </h1>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-navy-900/80">
          <div>
            <h2 className="text-lg font-semibold text-navy-900">
              Angaben gemäss Art. 3 UWG / Art. 5 DSG
            </h2>
            <div className="mt-4 space-y-1">
              <p className="font-semibold">{SITE.legalName}</p>
              <p>{SITE.address.street}</p>
              <p>
                {SITE.address.zip} {SITE.address.city}
              </p>
              <p>{SITE.address.country}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-navy-900">
              UID-Nummer
            </h2>
            <p className="mt-2">{SITE.uid}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-navy-900">Kontakt</h2>
            <div className="mt-2 space-y-1">
              <p>
                E-Mail:{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-gold-600 hover:text-gold-500"
                >
                  {SITE.email}
                </a>
              </p>
              <p>Telefon: {SITE.phone}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-navy-900">
              Verantwortlich für den Inhalt
            </h2>
            <p className="mt-2">{SITE.legalName}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-navy-900">
              Haftungsausschluss
            </h2>
            <p className="mt-2">
              Die Inhalte dieser Website werden mit grösstmöglicher Sorgfalt
              erstellt. Der Anbieter übernimmt jedoch keine Gewähr für die
              Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten
              Inhalte. Die Nutzung der Inhalte erfolgt auf eigene Gefahr.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-navy-900">
              Urheberrecht
            </h2>
            <p className="mt-2">
              Die durch den Betreiber dieser Seite erstellten Inhalte und Werke
              unterliegen dem schweizerischen Urheberrecht. Beiträge Dritter
              sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung
              oder Verbreitung ausserhalb der Grenzen des Urheberrechts bedarf
              der schriftlichen Zustimmung des Autors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
