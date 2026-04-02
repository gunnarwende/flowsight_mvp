"use client";

import { useState, useCallback, useRef } from "react";

export interface UpdateChange {
  label: string;
  detail: string;
}

/**
 * Hook for detecting data changes between snapshots.
 * Used by Pulse + Betriebe to show "N updates available" badges.
 *
 * Usage:
 *   const { changes, hasUpdates, updateCount, captureSnapshot, detectChanges, acknowledge } = useUpdateDetection();
 *   // On first load: captureSnapshot(data)
 *   // On poll: detectChanges(oldSnapshot, newData)
 *   // On user click: acknowledge() → resets badge
 */
export function useUpdateDetection() {
  const [changes, setChanges] = useState<UpdateChange[]>([]);
  const snapshotRef = useRef<string>("");

  const captureSnapshot = useCallback((versionString: string) => {
    snapshotRef.current = versionString;
    setChanges([]);
  }, []);

  const detectChanges = useCallback((newVersionString: string, diffFn: (oldV: string, newV: string) => UpdateChange[]) => {
    if (!snapshotRef.current || snapshotRef.current === newVersionString) return;
    const diff = diffFn(snapshotRef.current, newVersionString);
    if (diff.length > 0) {
      setChanges(diff);
    }
  }, []);

  const acknowledge = useCallback((newVersionString: string) => {
    snapshotRef.current = newVersionString;
    setChanges([]);
  }, []);

  return {
    changes,
    hasUpdates: changes.length > 0,
    updateCount: changes.length,
    captureSnapshot,
    detectChanges,
    acknowledge,
  };
}

/**
 * Compute diff between two Pulse snapshots.
 * Returns human-readable change descriptions.
 */
export function diffPulseData(
  oldData: { cases24h: number; backlogNew: number; done7d: number; reviews7d: number; scheduledToday: number },
  newData: { cases24h: number; backlogNew: number; done7d: number; reviews7d: number; scheduledToday: number },
): UpdateChange[] {
  const changes: UpdateChange[] = [];

  const caseDiff = newData.cases24h - oldData.cases24h;
  if (caseDiff > 0) changes.push({ label: "Neue Fälle", detail: `+${caseDiff} in den letzten 24h` });
  if (caseDiff < 0) changes.push({ label: "Fälle aktualisiert", detail: `${newData.cases24h} in den letzten 24h (vorher ${oldData.cases24h})` });

  const backlogDiff = newData.backlogNew - oldData.backlogNew;
  if (backlogDiff > 0) changes.push({ label: "Backlog gewachsen", detail: `+${backlogDiff} neue offene Fälle` });
  if (backlogDiff < 0) changes.push({ label: "Backlog abgebaut", detail: `${Math.abs(backlogDiff)} Fälle bearbeitet` });

  const doneDiff = newData.done7d - oldData.done7d;
  if (doneDiff > 0) changes.push({ label: "Fälle erledigt", detail: `+${doneDiff} in den letzten 7 Tagen` });

  const reviewDiff = newData.reviews7d - oldData.reviews7d;
  if (reviewDiff > 0) changes.push({ label: "Bewertungen", detail: `+${reviewDiff} neue Anfragen` });

  const scheduleDiff = newData.scheduledToday - oldData.scheduledToday;
  if (scheduleDiff !== 0) changes.push({ label: "Termine heute", detail: `${newData.scheduledToday} (vorher ${oldData.scheduledToday})` });

  return changes;
}

/**
 * Compute diff between two tenant version strings.
 * Version format: "case_count|last_case_at|staff_count"
 */
export function diffTenantVersion(oldV: string, newV: string): UpdateChange[] {
  const changes: UpdateChange[] = [];
  const [oldCases, , oldStaff] = oldV.split("|");
  const [newCases, , newStaff] = newV.split("|");

  const caseDiff = parseInt(newCases) - parseInt(oldCases);
  if (caseDiff > 0) changes.push({ label: "Neue Fälle", detail: `+${caseDiff} Fälle` });
  if (caseDiff < 0) changes.push({ label: "Fälle entfernt", detail: `${Math.abs(caseDiff)} Fälle weniger` });

  const staffDiff = parseInt(newStaff) - parseInt(oldStaff);
  if (staffDiff > 0) changes.push({ label: "Neue Mitarbeiter", detail: `+${staffDiff} Mitarbeiter` });
  if (staffDiff < 0) changes.push({ label: "Mitarbeiter entfernt", detail: `${Math.abs(staffDiff)} weniger` });

  return changes;
}
