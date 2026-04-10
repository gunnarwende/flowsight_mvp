"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ caseId, isDeleted }: { caseId: string; isDeleted: boolean }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const action = isDeleted ? "restore" : "delete";
  const label = isDeleted ? "Wiederherstellen" : "Löschen";
  const confirmText = isDeleted
    ? "Diesen Fall wirklich wiederherstellen?"
    : "Diesen Fall wirklich löschen?";

  async function handleAction() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_deleted: !isDeleted }),
      });
      if (res.ok) {
        router.refresh();
        setShowConfirm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={`p-1.5 rounded-lg transition-colors print:hidden ${
          isDeleted
            ? "text-green-500 hover:text-green-700 hover:bg-green-50"
            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
        }`}
        title={label}
      >
        {isDeleted ? (
          /* Restore icon (arrow-uturn-left) */
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        ) : (
          /* Trash icon */
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        )}
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4">
            <p className="text-gray-900 font-medium mb-4">{confirmText}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                disabled={loading}
              >
                Abbrechen
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                  isDeleted
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={loading}
              >
                {loading ? "..." : label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
