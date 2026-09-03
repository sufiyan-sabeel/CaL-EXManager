"use client";
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

export default function NotificationsPage() {
  const { toast } = useToast();
  const connect = () => toast("Notification analytics need Notification Access — grant to CAL-EXMANAGER companion in Android settings", "info");

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2"><Icon name="notifications" size={22} /> Notifications</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">On-device analytics only. No cloud. Permission-gated.</p>
      </div>

      <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-1)] p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex gap-3">
          <span className="h-9 w-9 rounded-full bg-[var(--error-subtle)] border border-[var(--error)]/30 grid place-items-center text-[var(--error)]"><Icon name="lock" size={18} /></span>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              Notification Access required
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--error-subtle)] border border-[var(--error)]/30 px-2 py-0.5 text-xs font-semibold text-[var(--error)]"><Icon name="lock" size={10} /> Permission denied</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[640px] leading-relaxed">Notification analytics need <span className="font-medium text-[var(--text-primary)]">Notification Access</span>, granted to the CAL-EXMANAGER companion in your Android settings. Until then, all counts remain — and no data is collected.</p>
          </div>
        </div>
        <Button onClick={connect} className="shrink-0"><Icon name="shield" size={14} /> How to grant</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="text-xs font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">Today&apos;s notifications</div>
          <div className="metric-hero tabular-nums mt-2 text-[var(--text-primary)]">0</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">No notifications today — honest empty</div>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text-tertiary)]"><Icon name="lock" size={10} /> Locked until permission granted</span>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="barChart" size={16} /> By app</CardTitle>
            <span className="text-xs text-[var(--text-tertiary)]">Bar list · no real data</span>
          </CardHeader>
          <div className="space-y-2">
            {["Messages", "Social", "Work", "System"].map((app) => (
              <div key={app} className="flex items-center gap-3">
                <span className="w-[84px] text-xs font-medium text-[var(--text-secondary)] truncate">{app}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] border border-[var(--border-subtle)] overflow-hidden relative">
                  <div className="absolute inset-0 grid place-items-center text-[10px] text-[var(--text-tertiary)]">—</div>
                </div>
                <span className="text-xs tabular-nums text-[var(--text-tertiary)] w-8 text-right">—</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">Honest empty — bars remain at zero until the companion is granted Notification Access.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="activity" size={16} /> Hour of day — 24h</CardTitle>
            <span className="text-xs text-[var(--text-tertiary)]">0 notifications</span>
          </CardHeader>
          <div className="h-[140px] rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 relative overflow-hidden">
            <div className="absolute inset-3 flex flex-col justify-between pointer-events-none" aria-hidden>
              <div className="h-px bg-[var(--border-subtle)]" />
              <div className="h-px bg-[var(--border-subtle)]" />
              <div className="h-px bg-[var(--border-subtle)]" />
            </div>
            <div className="relative h-full flex items-end gap-[2px]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-[2px] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)]/40" style={{ height: "8px" }} />
                  <span className="text-[8px] text-[var(--text-tertiary)]">{i}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <span className="rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-tertiary)]">No hour data — permission required</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="trendingUp" size={16} /> Most active</CardTitle>
            <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)]">Ranked list</span>
          </CardHeader>
          <div className="rounded-[10px] border border-dashed border-[var(--border-default)] bg-[var(--surface-2)]/60 p-6 text-center">
            <div className="mx-auto h-8 w-8 rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] grid place-items-center text-[var(--text-tertiary)]"><Icon name="notifications" size={16} /></div>
            <p className="text-sm font-medium text-[var(--text-primary)] mt-2">No activity yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Ranked list appears after Notification Access is granted via the Android companion. We never guess.</p>
          </div>
          <ol className="mt-3 divide-y divide-[var(--border-subtle)] rounded-[10px] border border-[var(--border-default)] overflow-hidden">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-center gap-3 p-3 bg-[var(--surface-1)] opacity-60">
                <span className="h-6 w-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-xs font-bold text-[var(--text-tertiary)]">{n}</span>
                <span className="flex-1 text-sm text-[var(--text-tertiary)]">— locked —</span>
                <span className="text-xs tabular-nums text-[var(--text-tertiary)]">—</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
