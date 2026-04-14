/**
 * /ops/help — English help page for pub tenants.
 * Simple: contact info + email link. No FAQ needed.
 */
export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-900">Help & Support</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Need help?</h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          If you have any questions about your app, your website, or your digital assistant — just reach out. We&apos;re happy to help.
        </p>

        <div className="mt-6 space-y-4">
          <a
            href="mailto:support@flowsight.ch"
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Email us</p>
              <p className="text-xs text-gray-500">support@flowsight.ch</p>
            </div>
          </a>

          <a
            href="tel:+41445520919"
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Call us</p>
              <p className="text-xs text-gray-500">+41 44 552 09 19</p>
            </div>
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Your contact</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-600">
            GW
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Gunnar Wende</p>
            <p className="text-xs text-gray-500">FlowSight · Oberrieden</p>
            <p className="text-xs text-gray-400">gunnar.wende@flowsight.ch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
