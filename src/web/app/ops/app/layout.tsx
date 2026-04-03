/**
 * Layout for /ops/app/[slug] — NO OpsShell, NO auth requirement.
 * This is a lightweight entry point for per-tenant PWA installation.
 * The page auto-redirects to /ops/cases after setting the tenant cookie.
 */
export default function TenantAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
