import Link from "next/link";

export const metadata = {
  title: "Trial abgelaufen",
};

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">⏱️</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Ihr Trial ist abgelaufen
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Ihr 14-Tage Testzeitraum ist beendet. Falls Sie das System
          weiterhin nutzen möchten, melden Sie sich bei uns &mdash; wir
          kümmern uns um alles Weitere.
        </p>
        <div className="space-y-3">
          <a
            href="tel:+41445520919"
            className="block w-full bg-[#d4a853] text-[#0b1120] font-semibold py-3 px-6 rounded-lg hover:bg-[#c49a48] transition-colors"
          >
            044 552 09 19 anrufen
          </a>
          <Link
            href="/"
            className="block text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
