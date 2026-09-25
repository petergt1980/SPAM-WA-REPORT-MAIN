export interface StoredReport {
  id: string;
  number: string;
  reason: string;
  timestamp: string;
  status: "pending" | "processing" | "resolved";
}

const KEY = "spamwa_reports_v1";

export function getReports(): StoredReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredReport[];
  } catch {
    return [];
  }
}

export function addReport(number: string, reason: string): void {
  const reports = getReports();
  const statuses: StoredReport["status"][] = ["pending", "processing", "resolved", "resolved", "resolved"];
  const newReport: StoredReport = {
    id: crypto.randomUUID(),
    number: maskNumber(number),
    reason,
    timestamp: new Date().toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
  const updated = [newReport, ...reports].slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(updated));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function getStats(reports: StoredReport[]) {
  const total = reports.length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const rate = total === 0 ? 0 : Math.round((resolved / total) * 1000) / 10;

  const reasonCounts: Record<string, number> = {};
  for (const r of reports) {
    reasonCounts[r.reason] = (reasonCounts[r.reason] ?? 0) + 1;
  }
  const topReason =
    Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return { total, resolved, pending, rate, topReason };
}

function maskNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6) return raw;
  const prefix = digits.slice(0, Math.max(3, digits.length - 4));
  const suffix = digits.slice(-2);
  const masked = prefix.replace(/\d/g, "X") + "XX" + suffix;
  return "+" + masked;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
