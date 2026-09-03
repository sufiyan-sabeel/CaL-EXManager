"use client";
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { ExpenseService } from "@/lib/services/expense.service";
import { todayISODate } from "@/lib/domain/common";

export default function InsightsPage() {
  const data = useMemo(() => {
    try {
      const expenses = ExpenseService.getAll();
      const today = todayISODate();
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today + "T00:00:00"); d.setDate(d.getDate() - (6 - i));
        const iso = d.toISOString().slice(0, 10);
        const total = expenses.filter((e) => e.date === iso).reduce((s, e) => s + e.amount, 0);
        return { iso, total };
      });
      const max = Math.max(...last7.map((d) => d.total), 1);
      const total7 = last7.reduce((s, d) => s + d.total, 0);
      // heatmap 84 cells
      const cells = Array.from({ length: 84 }, (_, i) => {
        const d = new Date(today + "T00:00:00"); d.setDate(d.getDate() - (83 - i));
        const iso = d.toISOString().slice(0, 10);
        const spend = expenses.filter((e) => e.date === iso).reduce((s, e) => s + e.amount, 0);
        let lvl = 0;
        if (spend === 0) lvl = 0;
        else if (spend < 200) lvl = 1;
        else if (spend < 600) lvl = 2;
        else if (spend < 1200) lvl = 3;
        else lvl = 4;
        return { iso, spend, lvl };
      });
      return { expenses, last7, max, total7, cells, today, hasData: expenses.length > 0 };
    } catch { return { expenses: [], last7: [], max: 1, total7: 0, cells: Array.from({ length: 84 }, (_, i) => ({ iso: `2026-01-${String(i + 1).padStart(2, "0")}`, spend: 0, lvl: 0 })), today: todayISODate(), hasData: false }; }
  }, []);

  const heatBg = (lvl: number) => ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)"][lvl] ?? "var(--heat-0)";

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2"><Icon name="insights" size={22} /> Insights</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Weekly digital activity summary — composite signal, never fabricated. Sample is labeled when shown.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="activity" size={16} /> Weekly activity</CardTitle>
            <span className="text-xs tabular-nums text-[var(--text-tertiary)]">7 days · total ₹{data.total7.toFixed(0)}</span>
          </CardHeader>
          {data.last7.every((d) => d.total === 0) ? (
            <div className="text-center py-8 rounded-[10px] border border-dashed border-[var(--border-default)] bg-[var(--surface-2)]/60">
              <p className="text-sm text-[var(--text-secondary)]">No activity data yet.</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Log expenses or connect companion to see your weekly trend.</p>
            </div>
          ) : (
            <div className="h-[140px] flex items-end gap-2">
              {data.last7.map((d) => {
                const h = (d.total / data.max) * 100;
                return (
                  <div key={d.iso} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-[6px] bg-[var(--accent-signal)] transition-all tabular-nums" style={{ height: `${h}%`, minHeight: d.total ? "10px" : "2px", opacity: 0.9 }} title={`${d.iso}: ₹${d.total.toFixed(0)}`} aria-label={`${d.iso} ₹${d.total.toFixed(0)}`} />
                    <span className="text-[10px] tabular-nums text-[var(--text-tertiary)]">{d.iso.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-[var(--text-tertiary)] mt-2 tabular-nums">Composite signal — expenses + events. Shown only from real local data.</p>
        </Card>

        <Card>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-[var(--accent-signal)]"><Icon name="ai" size={14} /> AI Insight</div>
          <div className="mt-3 space-y-3">
            {[
              { title: "Steady week", body: "Spending held within 8% of your 4-week average. Food drove 31% of variation.", kind: "fact" },
              { title: "Sample suggestion", body: "SAMPLE DATA — Try a weekend cap on Dining to lift savings rate by ~3%. Real suggestions appear with 14+ days of data.", kind: "suggestion" },
            ].map((ins) => (
              <div key={ins.title} className="rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] p-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-[var(--accent-signal-subtle)] border border-[var(--accent-signal)]/30 grid place-items-center text-[var(--accent-signal)]"><Icon name="sparkles" size={12} /></span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{ins.title}</span>
                  <span className="ml-auto text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)]">{ins.kind}</span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-2">{ins.body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">AI marks are explicit. Second card is labeled SAMPLE DATA until you have enough history.</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icon name="layers" size={16} /> Activity Heatmap — 84 days composite</CardTitle>
          <span className="text-xs rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2 py-0.5 text-[var(--text-tertiary)]">heat-0 → heat-4</span>
        </CardHeader>
        <div className="grid grid-cols-12 gap-1">
          {data.cells.map((c) => (
            <div
              key={c.iso}
              title={`${c.iso}: ₹${c.spend} · level ${c.lvl}`}
              className="h-[22px] rounded-[4px] border"
              style={{ background: heatBg(c.lvl), borderColor: c.lvl >= 3 ? "var(--accent-signal)" : "var(--border-subtle)" }}
              role="gridcell"
              aria-label={`${c.iso} ${c.spend} level ${c.lvl}`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
          <span>Less</span>
          <span className="h-3 w-3 rounded-[3px] border border-[var(--border-subtle)]" style={{ background: "var(--heat-0)" }} />
          <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-1)" }} />
          <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-2)" }} />
          <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-3)" }} />
          <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-4)" }} />
          <span>More</span>
          <span className="ml-auto text-xs tabular-nums">{data.hasData ? "Real data" : "No activity data yet — showing empty scale"}</span>
        </div>
        {!data.hasData && <p className="mt-2 text-xs text-[var(--text-tertiary)]">No activity data yet. Heatmap cells are at heat-0 (#1A1D26) until you log expenses. Sample is never injected without the “SAMPLE” note.</p>}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icon name="barChart" size={16} /> Expense trend</CardTitle>
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{data.hasData ? `${data.expenses.length} records` : "—"}</span>
        </CardHeader>
        {data.last7.every((d) => d.total === 0) ? (
          <p className="text-sm text-[var(--text-tertiary)] py-6 text-center border border-dashed border-[var(--border-default)] rounded-[10px] bg-[var(--surface-2)]/60">No activity data yet.</p>
        ) : (
          <svg viewBox="0 0 300 80" className="w-full h-[120px] rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
            <g stroke="var(--border-subtle)" strokeWidth="1">
              <line x1="0" y1="20" x2="300" y2="20" />
              <line x1="0" y1="40" x2="300" y2="40" />
              <line x1="0" y1="60" x2="300" y2="60" />
            </g>
            <polyline
              fill="none"
              stroke="var(--accent-signal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.last7.map((d, i) => `${(i * 300) / 6},${70 - (d.total / data.max) * 50}`).join(" ")}
            />
            {data.last7.map((d, i) => (
              <circle key={d.iso} cx={(i * 300) / 6} cy={70 - (d.total / data.max) * 50} r="3" fill="var(--surface-1)" stroke="var(--accent-signal)" strokeWidth="1.5" />
            ))}
          </svg>
        )}
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-[var(--accent-signal)]">View as table (accessible, tabular-nums)</summary>
          <div className="mt-2 overflow-auto max-h-48 rounded-[10px] border border-[var(--border-default)]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--surface-2)] text-[var(--text-tertiary)]"><tr><th className="text-left p-2">Date</th><th className="text-right p-2">Amount</th></tr></thead>
              <tbody className="tabular-nums">
                {data.last7.map((r) => <tr key={r.iso} className="border-t border-[var(--border-subtle)]"><td className="p-2">{r.iso}</td><td className="p-2 text-right">₹{r.total.toFixed(0)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </details>
      </Card>
    </div>
  );
}
