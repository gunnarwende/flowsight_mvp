"use client";

import { useState, useEffect } from "react";

interface StaffMember {
  id: string;
  display_name: string;
  role: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

interface StaffManagerProps {
  /** Pass tenant_id for admin users (otherwise API resolves from session) */
  tenantId?: string;
  /** Hide the top header (when embedded in another section) */
  embedded?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  techniker: "Techniker",
  projektleiter: "Projektleiter",
  buero: "Büro",
  inhaber: "Inhaber",
  lernender: "Lernender",
};

export function StaffManager({ tenantId, embedded }: StaffManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("techniker");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    const res = await fetch("/api/ops/staff");
    if (res.ok) {
      const data = await res.json();
      setStaff(data);
    }
    setLoading(false);
  }

  function resetForm() {
    setName("");
    setRole("techniker");
    setPhone("");
    setEmail("");
    setEditingId(null);
    setShowForm(false);
    setErrorMsg("");
  }

  function startEdit(s: StaffMember) {
    setName(s.display_name);
    setRole(s.role);
    setPhone(s.phone ?? "");
    setEmail(s.email ?? "");
    setEditingId(s.id);
    setShowForm(true);
    setErrorMsg("");
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg("");

    const body: Record<string, unknown> = {
      display_name: name.trim(),
      role,
      phone: phone.trim() || null,
      email: email.trim() || null,
    };

    // Include tenant_id for admin users
    if (tenantId) {
      body.tenant_id = tenantId;
    }

    try {
      const url = editingId ? `/api/ops/staff/${editingId}` : "/api/ops/staff";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Fehler (${res.status})`);
      }

      resetForm();
      fetchStaff();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
    setSaving(false);
  }

  async function handleDeactivate(id: string) {
    await fetch(`/api/ops/staff/${id}`, { method: "DELETE" });
    fetchStaff();
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Laden…</p>;
  }

  return (
    <div>
      {!embedded && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Team</h2>
            <p className="text-sm text-gray-500">Team verwalten — für Fall-Zuweisung und Einsatzplanung</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-700 shadow-sm transition-colors"
            >
              + Mitarbeiter
            </button>
          )}
        </div>
      )}

      {embedded && !showForm && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-700 shadow-sm transition-colors"
          >
            + Mitarbeiter
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {editingId ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Muster"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rolle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30"
              >
                <option value="techniker">Techniker</option>
                <option value="projektleiter">Projektleiter</option>
                <option value="buero">Büro</option>
                <option value="inhaber">Inhaber</option>
                <option value="lernender">Lernender</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@firma.ch"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30"
              />
              <p className="mt-1 text-[11px] text-gray-400">Für Kalendereinladungen bei Terminzuweisung</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+41 79 123 45 67"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              {saving ? "Speichern…" : editingId ? "Aktualisieren" : "Hinzufügen"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            {errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
          </div>
        </div>
      )}

      {/* Staff list */}
      {staff.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Noch keine Mitarbeiter erfasst.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200 bg-slate-50/80">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Rolle</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">E-Mail</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Telefon</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.display_name}</td>
                  <td className="px-4 py-3 text-gray-600">{ROLE_LABELS[s.role] ?? s.role}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(s)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeactivate(s.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors ml-2"
                      >
                        Entfernen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
