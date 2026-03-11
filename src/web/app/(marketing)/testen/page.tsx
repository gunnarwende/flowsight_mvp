import type { Metadata } from "next";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "Kostenlos testen — FlowSight",
  description:
    "Wir bauen Lisa persönlich für Ihren Betrieb. 14 Tage kostenlos testen — Website, Telefonassistentin, Dashboard, SMS, Bewertungen.",
};

function PhoneIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function ClipboardIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function StarIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

export default function TestenPage() {
  return (
    <>
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Headline */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Wir bauen Lisa für Ihren Betrieb.
            </h1>
            <p className="mt-4 text-lg text-navy-400">
              Persönlich. In 48 Stunden. 14 Tage kostenlos.
            </p>
          </div>

          {/* How it works */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <PhoneIcon className="h-5 w-5" />,
                title: "1. Sie melden sich",
                desc: "Firma, Telefon, PLZ — mehr brauchen wir nicht.",
              },
              {
                icon: <ClipboardIcon className="h-5 w-5" />,
                title: "2. Wir bauen",
                desc: "Website, Lisa, Dashboard — persönlich für Ihren Betrieb. In 48h.",
              },
              {
                icon: <StarIcon className="h-5 w-5" />,
                title: "3. Sie testen",
                desc: "Rufen Sie Ihre Nummer an. 14 Tage kostenlos. Kein Vertrag.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-navy-200/60 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section */}
      <section
        id="formular"
        className="scroll-mt-20 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Lisa für Ihren Betrieb bauen.
            </h2>
            <p className="mt-4 text-lg text-navy-200">
              Sagen Sie uns, wer Sie sind — wir kümmern uns um den Rest.
            </p>
          </div>

          <div className="mt-12">
            <DemoForm />
          </div>
        </div>
      </section>
    </>
  );
}
