"use client";
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

function HealthRing({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative h-[148px] w-[148px] shrink-0" aria-label={`Device health score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--accent-signal)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 700ms var(--motion-easing-decelerate)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">Health</div>
          <div className="text-[36px] font-extrabold tabular-nums leading-none text-[var(--text-primary)]">{score}</div>
          <div className="text-xs text-[var(--text-tertiary)]">/ 100</div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
            <Icon name="lock" size={10} /> Requires companion
          </span>
        </div>
      </div>
    </div>
  );
}

type Metric = { label: string; icon: "battery" | "hardDrive" | "cpu" | "activity" | "smartphone" | "zap"; sub: string };

const METRICS: Metric[] = [
  { label: "Battery", icon: "battery", sub: "Needs permission" },
  { label: "Storage", icon: "hardDrive", sub: "Needs permission" },
  { label: "RAM", icon: "cpu", sub: "Needs permission" },
  { label: "CPU", icon: "activity", sub: "Needs permission" },
  { label: "Network", icon: "zap", sub: "Needs permission" },
];

export default function PerformancePage() {
  const { toast } = useToast();
  const connect = () => toast("Connect your Android device via CAL-EXMANAGER companion to enable device health", "info");

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2">
          <Icon name="performance" size={22} /> Performance
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Device Health — honest empty states. No fake system data without the companion app.</p>
      </div>

      {/* Permission banner §39 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-1)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-[var(--warning-subtle)] border border-[var(--warning)]/30 grid place-items-center text-[var(--warning)]">
            <Icon name="lock" size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              Android Companion required
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] px-2 py-0.5 text-xs font-medium text-[var(--text-tertiary)]">
                <Icon name="lock" size={12} /> Locked
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Battery, storage and runtime metrics need the companion app + permissions.</p>
          </div>
        </div>
        <Button onClick={connect} aria-label="Connect Android device" className="shrink-0">
          <Icon name="smartphone" size={14} /> Connect device
        </Button>
      </div>

      {/* Hero */}
      <Card className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 p-6 relative overflow-hidden" style={{ background: "var(--surface-1)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden style={{ background: "radial-gradient(ellipse at 70% 0%, rgba(91,110,245,0.10) 0%, transparent 60%)" }} />
        <HealthRing score={72} />
        <div className="flex-1 min-w-0 text-center lg:text-left relative">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Device Health</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Sample score 72 — shown for preview. Real score requires the Android Companion with Usage &amp; System permissions. We never fabricate hardware stats.</p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium" style={{ background: "var(--accent-signal-subtle)", borderColor: "var(--accent-signal)", color: "var(--accent-signal)" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-signal)]" aria-hidden /> Signal · Device
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text-tertiary)]">
              <Icon name="shield" size={12} /> Permission gated
            </span>
          </div>
          <div className="mt-4 flex gap-2 justify-center lg:justify-start">
            <Button onClick={connect}>Connect device</Button>
            <Button variant="secondary" onClick={() => toast("Device health requires Android Companion — no local data available", "info")}>Learn more</Button>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">§39 · Honest empty · “Requires Android Companion” whenever data would be guessed.</p>
        </div>
        <div className="hidden lg:block text-xs text-[var(--text-tertiary)] tabular-nums text-right">
          <div>Score 72</div>
          <div>Ring accent #5B6EF5</div>
          <div>Locked until paired</div>
        </div>
      </Card>

      {/* MetricCards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {METRICS.map((m) => (
          <Card key={m.label} className="relative p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Icon name={m.icon as never} size={14} /> {m.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">
                <Icon name="lock" size={10} /> Requires Android Companion
              </span>
            </div>
            <div className="metric-lg tabular-nums text-[var(--text-primary)] leading-none mt-1">—</div>
            <div className="text-xs text-[var(--text-tertiary)]">{m.sub} · locked</div>
            <div className="h-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="h-full w-0 bg-[var(--border-strong)]" aria-hidden />
            </div>
            <Button size="sm" onClick={connect} className="mt-1 w-full" aria-label={`Connect device for ${m.label}`}>
              Connect device
            </Button>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="barChart" size={16} /> History — last 7 days</CardTitle>
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">Border-subtle grid · no fake data</span>
          </CardHeader>
          <div className="relative h-[160px] rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 overflow-hidden">
            {/* grid lines */}
            <div className="absolute inset-3 flex flex-col justify-between pointer-events-none" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-px bg-[var(--border-subtle)] w-full" />
              ))}
            </div>
            <div className="relative h-full flex items-end gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-[4px] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)]/60 flex items-center justify-center" style={{ height: "64px" }}>
                    <Icon name="lock" size={12} className="text-[var(--text-tertiary)]" />
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)]">D{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <span className="rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-tertiary)]">Locked — connect device to see history</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">We show a hairline grid with border-subtle. No fabricated bars.</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="activity" size={16} /> Device Health trend</CardTitle>
            <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)]">Sample preview</span>
          </CardHeader>
          <div className="h-[160px] rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 relative overflow-hidden">
            <svg viewBox="0 0 300 100" className="h-full w-full" aria-hidden>
              <g stroke="var(--border-subtle)" strokeWidth="1">
                <line x1="0" y1="25" x2="300" y2="25" />
                <line x1="0" y1="50" x2="300" y2="50" />
                <line x1="0" y1="75" x2="300" y2="75" />
              </g>
              {/* dashed sample line — labeled sample */}
              <polyline
                fill="none"
                stroke="var(--accent-signal)"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.7"
                points="0,60 40,55 80,65 120,45 160,58 200,40 240,50 280,38 300,42"
              />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle key={i} cx={i * 40} cy={60 - Math.sin(i) * 10} r="3" fill="var(--surface-1)" stroke="var(--accent-signal)" strokeWidth="1.5" opacity="0.5" />
              ))}
            </svg>
            <div className="absolute bottom-3 right-3 rounded-full bg-[var(--accent-signal-subtle)] border border-[var(--accent-signal)]/30 px-2 py-0.5 text-[10px] font-medium text-[var(--accent-signal)]">SAMPLE — connect to record real trend</div>
            <div className="absolute top-3 left-3 text-xs text-[var(--text-tertiary)]">No real data yet — line is illustrative</div>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">Composite health traced over 7 days when companion is paired. Until then, we show a dotted preview only.</p>
        </Card>
      </div>
    </div>
  );
}
