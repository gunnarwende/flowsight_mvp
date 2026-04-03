"use client";

import { useEffect, useState } from "react";

export function TenantAppClient({ name, tenantId, slug }: { name: string; tenantId: string; slug: string }) {
  const [status, setStatus] = useState("Leitsystem wird geladen...");

  useEffect(() => {
    // Navigate to the API route which sets the cookie via Set-Cookie header
    // and redirects to /ops/cases. This is a full page navigation (not fetch),
    // so the browser processes the Set-Cookie before following the redirect.
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
