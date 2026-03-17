import type { Metadata } from "next";
import { ServiceWorkerRegistration } from "@/src/components/ops/ServiceWorkerRegistration";

/** Clean title for the login page — no FlowSight branding (Identity R4). */
export const metadata: Metadata = {
  title: { absolute: "Leitsystem" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
      <ServiceWorkerRegistration />
    </div>
  );
}
