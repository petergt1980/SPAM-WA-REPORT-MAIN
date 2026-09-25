import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, Clock, BarChart3, Activity, TrendingUp, Globe, Zap, FileX } from "lucide-react";
import { getReports, getStats, formatDate, type StoredReport } from "@/lib/reports-store";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  scam: "Scam",
  harassment: "Harassment",
  fake_account: "Fake Account",
  other: "Other",
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending:    { color: "hsl(38 92% 65%)",  background: "hsl(38 92% 65% / 0.1)",  border: "1px solid hsl(38 92% 65% / 0.25)" },
  processing: { color: "hsl(213 94% 68%)", background: "hsl(213 94% 68% / 0.1)", border: "1px solid hsl(213 94% 68% / 0.25)" },
  resolved:   { color: "hsl(142 60% 55%)", background: "hsl(142 60% 55% / 0.1)", border: "1px solid hsl(142 60% 55% / 0.25)" },
};

export default function Stats() {
  const [reports, setReports] = useState<StoredReport[]>([]);

  useEffect(() => {
    const load = () => setReports(getReports());
    load();
    // Live update when a report is added (same tab or other tab)
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const stats = getStats(reports);
  const recent = reports.slice(0, 10);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="text-center fade-up">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "hsl(263 70% 60% / 0.1)",
            border: "1px solid hsl(263 70% 60% / 0.28)",
            color: "hsl(263 70% 75%)",
          }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Community Data
        </div>
        <h1 className="gradient-title text-4xl md:text-5xl font-extrabold tracking-tight mb-2" data-testid="text-stats-title">
          Statistics
        </h1>
        <p className="text-sm font-light" style={{ color: "hsl(var(--muted-foreground))" }}>
          Real reports submitted from this device
        </p>
      </div>

      {/* ── Live indicator ────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl fade-up"
        style={{
          background: "hsl(142 60% 45% / 0.06)",
          border: "1px solid hsl(142 60% 45% / 0.18)",
          animationDelay: "80ms",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-green-400 text-xs font-semibold">LIVE</span>
        </div>
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          Updated in real-time · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <Globe className="w-3.5 h-3.5 ml-auto" style={{ color: "hsl(263 70% 65%)" }} />
      </div>

      {/* ── Stats grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total Reports"
          value={stats.total.toLocaleString()}
          icon={<ShieldAlert className="w-4 h-4" style={{ color: "hsl(263 70% 72%)" }} />}
          delay="100ms"
          accent="hsl(263 70% 60%)"
          testId="stat-total"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending.toLocaleString()}
          icon={<Clock className="w-4 h-4" style={{ color: "hsl(38 92% 65%)" }} />}
          delay="180ms"
          accent="hsl(38 92% 55%)"
          testId="stat-pending"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved.toLocaleString()}
          icon={<CheckCircle className="w-4 h-4" style={{ color: "hsl(142 60% 55%)" }} />}
          delay="260ms"
          accent="hsl(142 60% 45%)"
          testId="stat-resolved"
        />
        <StatCard
          title="Top Reason"
          value={stats.topReason === "—" ? "—" : (REASON_LABELS[stats.topReason] ?? stats.topReason)}
          icon={<BarChart3 className="w-4 h-4" style={{ color: "hsl(263 70% 72%)" }} />}
          delay="340ms"
          accent="hsl(263 70% 60%)"
          testId="stat-top-reason"
          isText
        />
      </div>

      {/* ── Resolution rate bar ───────────────────────────────── */}
      {stats.total > 0 && (
        <div
          className="rounded-2xl p-5 fade-up space-y-3"
          style={{
            background: "hsl(265 30% 8%)",
            border: "1px solid hsl(265 25% 14%)",
            animationDelay: "420ms",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "hsl(263 70% 72%)" }} />
              <span className="text-white text-sm font-semibold">Resolution Rate</span>
            </div>
            <span className="font-bold text-sm" style={{ color: "hsl(142 60% 55%)" }}>
              {stats.rate}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(265 25% 14%)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${stats.rate}%`,
                background: "linear-gradient(90deg, hsl(263 70% 60%), hsl(142 60% 50%))",
                boxShadow: "0 0 12px hsl(142 60% 50% / 0.4)",
              }}
            />
          </div>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {stats.resolved} out of {stats.total} reports successfully resolved
          </p>
        </div>
      )}

      {/* ── Recent reports ────────────────────────────────────── */}
      <div
        className="form-card overflow-hidden fade-up"
        style={{ animationDelay: "480ms" }}
        data-testid="reports-table"
      >
        <div
          className="flex items-center gap-2.5 px-5 py-4"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <Activity className="w-4 h-4" style={{ color: "hsl(263 70% 72%)" }} />
          <h2 className="font-bold text-white text-sm">Recent Reports</h2>
          {recent.length > 0 && (
            <span
              className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "hsl(263 70% 60% / 0.12)", color: "hsl(263 70% 75%)" }}
            >
              {recent.length} latest
            </span>
          )}
        </div>

        {recent.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "hsl(263 70% 60% / 0.08)", border: "1px solid hsl(263 70% 60% / 0.18)" }}
            >
              <FileX className="w-5 h-5" style={{ color: "hsl(263 70% 65%)" }} />
            </div>
            <p className="text-sm font-medium text-white">No reports yet</p>
            <p className="text-xs text-center max-w-[200px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              Submit a report on the Report page — it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  {["Number", "Reason", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((report) => (
                  <tr
                    key={report.id}
                    style={{ borderBottom: "1px solid hsl(var(--border))" }}
                    className="transition-colors hover:bg-[hsl(263,70%,60%,0.04)]"
                  >
                    <td className="px-5 py-3.5 font-semibold text-white text-sm font-mono">
                      {report.number}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-light" style={{ color: "hsl(var(--foreground))" }}>
                      {REASON_LABELS[report.reason] ?? report.reason}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                        style={STATUS_STYLE[report.status] ?? {}}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-light" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {formatDate(report.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="px-5 py-3 text-center text-xs font-light"
          style={{ borderTop: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          Numbers are anonymized for privacy · stored locally on your device
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, icon, delay, accent, testId, isText = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  delay: string;
  accent: string;
  testId: string;
  isText?: boolean;
}) {
  return (
    <div
      className="stat-card fade-up"
      style={{ animationDelay: delay }}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>
          {title}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          {icon}
        </div>
      </div>
      <div
        className={`font-extrabold text-white ${isText ? "text-lg" : "text-3xl"}`}
        style={{ letterSpacing: isText ? "0" : "-0.03em" }}
      >
        {value}
      </div>
      <div
        className="mt-2 h-0.5 rounded-full w-8"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </div>
  );
}
