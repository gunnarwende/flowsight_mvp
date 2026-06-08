"use client";

/** Druckt die Setup-Zusammenfassung (Browser → „Als PDF sichern"). M3. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{ flexShrink: 0, borderRadius: 10, border: "none", background: "#b8902f", color: "#1a1a1a", fontWeight: 700, fontSize: 13, padding: "9px 16px", cursor: "pointer" }}
    >
      📄 Als PDF sichern / drucken
    </button>
  );
}
