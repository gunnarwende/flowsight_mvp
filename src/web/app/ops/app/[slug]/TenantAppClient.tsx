"use client";

import { useEffect } from "react";

export function TenantAppClient({
  name,
  tenantId: _tenantId,
  slug,
  isPub,
}: {
  name: string;
  tenantId: string;
  slug: string;
  isPub: boolean;
}) {
  const status = isPub ? "Loading your dashboard..." : "Leitsystem wird geladen...";

  useEffect(() => {
    // Full-page navigation to API route (Set-Cookie header + redirect to the
    // tenant's home: /ops/pub-dashboard for pub tenants, /ops/cases otherwise).
    window.location.href = "/api/ops/tenant-app/" + encodeURIComponent(slug) + "?_t=" + Date.now();
  }, [slug]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "24px",
      padding: "24px",
      backgroundColor: "#0b1120",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        width: "80px",
        height: "80px",
        borderRadius: "20px",
        backgroundColor: "#1a2744",
        border: "2px solid #c8965a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: "#c8965a",
        }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0" }}>
          {name}
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          {status}
        </p>
      </div>
    </div>
  );
}
