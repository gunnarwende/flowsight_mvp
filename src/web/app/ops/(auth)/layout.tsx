import { ServiceWorkerRegistration } from "@/src/components/ops/ServiceWorkerRegistration";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
      <ServiceWorkerRegistration />
    </div>
  );
}
