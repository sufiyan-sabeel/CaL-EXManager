"use client";
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type AppRow = { id: string; name: string; icon: string; time: string; category: string; spark: number[] };

const SAMPLE: AppRow[] = [
  { id: "1", name: "Instagram", icon: "📷", time: "2h 14m", category: "Social", spark: [3, 5, 2, 6, 4, 7, 3] },
  { id: "2", name: "YouTube", icon: "▶️", time: "1h 42m", category: "Entertainment", spark: [2, 3, 5, 4, 6, 2, 5] },
  { id: "3", name: "Slack", icon: "💬", time: "58m", category: "Productivity", spark: [1, 2, 1, 3, 2, 4, 2] },
];

const CATEGORIES = ["All", "Social", "Entertainment", "Productivity", "Tools"];

export default function AppsPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"time" | "name">("time");
  const connect = () => toast("Connect your Android device via CAL-EXMANAGER companion to see app usage", "info");

  const filtered = useMemo(() => {
    let r = SAMPLE.filter((a) => (cat === "All" ? true : a.category === cat)).filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    // time sort keep original high->low (already)
    return r;
  }, [q, cat, sort]);

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2">
          <Icon name="apps" size={22} /> Apps
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">App usage · Requires Android Companion. Honest empty — sample rows are labeled.</p>
      </div>

      <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-1)] px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-[var(--warning-subtle)] border border-[var(--warning)]/30 grid place-items-center text-[var(--warning)]">
            <Icon name="lock" size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              Requires Android Companion
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-tertiary)]">
                <Icon name="lock" size={10} /> Locked
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Connect your Android device to see app usage. No data leaves the device without permission.</p>
          </div>
        </div>
        <Button onClick={connect} aria-label="Connect Android device for app usage">
          <Icon name="smartphone" size={14} /> Connect device
        </Button>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
            <input
              aria-label="Search apps"
              placeholder="Search apps"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-signal)] focus:ring-2 focus:ring-[var(--accent-signal)]/20 outline-none"
            />
          </div>
          <select
            aria-label="Sort apps"
            value={sort}
            onChange={(e) => setSort(e.target.value as never)}
            className="h-11 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-signal)] outline-none"
          >
            <option value="time">Most used</option>
            <option value="name">A–Z</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${cat === c ? "bg-[var(--accent-signal)] text-white border-[var(--accent-signal)]" : "bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"}`}
              aria-pressed={cat === c}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="apps" size={16} /> App usage</CardTitle>
            <span className="text-xs rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2 py-0.5 text-[var(--text-tertiary)]">Sample data</span>
          </CardHeader>

          <div className="rounded-[10px] border border-dashed border-[var(--border-default)] bg-[var(--surface-2)]/60 px-3 py-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Icon name="info" size={14} /> Connect your Android device to see app usage — rows below are{" "}
            <span className="font-semibold text-[var(--text-secondary)]">SAMPLE DATA</span> for preview only.
          </div>

          <div className="mt-3 divide-y divide-[var(--border-subtle)] rounded-[10px] border border-[var(--border-default)] overflow-hidden">
            {filtered.map((a) => {
              const max = Math.max(...a.spark);
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-[var(--surface-1)]">
                  <div className="h-10 w-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-lg" aria-hidden>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{a.name}</span>
                      <span className="hidden sm:inline-flex rounded-full bg-[var(--warning-subtle)] border border-[var(--warning)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning)]">SAMPLE DATA</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{a.category}</span>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] tabular-nums">{a.time} today · sample</div>
                  </div>
                  <div className="flex items-end gap-[2px] h-6 w-[56px]" aria-hidden>
                    {a.spark.map((v, i) => (
                      <div key={i} className="flex-1 rounded-[2px] bg-[var(--accent-signal)]/60" style={{ height: `${(v / max) * 100}%` }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium tabular-nums text-[var(--text-secondary)]">{a.time}</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="p-6 text-center text-sm text-[var(--text-tertiary)]">No apps match “{q}”.</div>}
          </div>

          <p className="mt-2 text-xs text-[var(--text-tertiary)]">Mini sparkline is illustrative sample data. Real usage appears after companion permission.</p>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Icon name="barChart" size={16} /> Category breakdown</CardTitle>
              <span className="text-xs text-[var(--text-tertiary)]">Donut · sample</span>
            </CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative h-[112px] w-[112px] shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--border-subtle)" strokeWidth="14" />
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--accent-signal)" strokeWidth="14" strokeDasharray="226" strokeDashoffset="60" strokeLinecap="round" opacity={0.9} />
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--chart-2)" strokeWidth="14" strokeDasharray="226" strokeDashoffset="140" strokeLinecap="round" style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }} />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <span className="text-xs font-semibold text-[var(--text-tertiary)]">Sample</span>
                </div>
              </div>
              <div className="space-y-2 text-xs flex-1">
                {[
                  { label: "Social", col: "var(--accent-signal)", v: "42%" },
                  { label: "Entertainment", col: "var(--chart-2)", v: "28%" },
                  { label: "Productivity", col: "var(--border-strong)", v: "18%" },
                  { label: "Tools", col: "var(--border-subtle)", v: "12%" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.col }} aria-hidden />
                    <span className="flex-1 text-[var(--text-secondary)]">{r.label}</span>
                    <span className="tabular-nums font-medium text-[var(--text-primary)]">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-3">Sample donut for layout — real breakdown after companion.</p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Icon name="activity" size={16} /> Most Distracting Apps</CardTitle>
            </CardHeader>
            <div className="divide-y divide-[var(--border-subtle)] rounded-[10px] border border-[var(--border-default)] overflow-hidden">
              {SAMPLE.slice(0, 3).map((a, idx) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-[var(--surface-1)]">
                  <span className="h-6 w-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-xs font-bold text-[var(--text-tertiary)]">{idx + 1}</span>
                  <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{a.name}</span>
                  <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{a.time}</span>
                  <span className="rounded-full bg-[var(--warning-subtle)] border border-[var(--warning)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning)]">SAMPLE</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">Ranked by sample time — requires companion for real ranking.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
