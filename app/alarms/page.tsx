"use client";
import React, { useEffect, useState } from "react";
import { AlarmService } from "@/lib/services/alarm.service";
import type { Alarm } from "@/lib/domain/models";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

const DAYS: Alarm["repeat"] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

export default function AlarmsPage() {
  const { toast } = useToast();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ label: string; time: string; repeat: string[]; snooze: number; enabled: boolean }>({
    label: "",
    time: "07:00",
    repeat: [],
    snooze: 5,
    enabled: true,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = () => setAlarms(AlarmService.getAll());
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("calexpenses:refresh", h as EventListener);
    return () => window.removeEventListener("calexpenses:refresh", h as EventListener);
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ label: "", time: "07:00", repeat: [], snooze: 5, enabled: true });
    setOpen(true);
  };
  const openEdit = (a: Alarm) => {
    setEditing(a.id);
    setForm({ label: a.label, time: a.time, repeat: [...a.repeat], snooze: a.snoozeMinutes, enabled: a.enabled });
    setOpen(true);
  };

  const toggleRepeat = (d: string) => setForm((f) => ({ ...f, repeat: f.repeat.includes(d) ? f.repeat.filter((x) => x !== d) : [...f.repeat, d] }));

  const save = () => {
    if (!form.label.trim()) { toast("Label required", "error"); return; }
    if (!form.time) { toast("Time required", "error"); return; }
    try {
      if (editing) {
        AlarmService.update(editing, { label: form.label.trim(), time: form.time, repeat: form.repeat as Alarm["repeat"], snoozeMinutes: form.snooze, enabled: form.enabled });
        toast("Alarm updated", "success");
      } else {
        AlarmService.create({ label: form.label.trim(), time: form.time, repeat: form.repeat as Alarm["repeat"], snoozeMinutes: form.snooze, enabled: form.enabled, routineId: null });
        toast("Alarm created", "success");
      }
      setOpen(false);
      setEditing(null);
      refresh();
      window.dispatchEvent(new Event("calexpenses:refresh"));
    } catch (e) { toast((e as Error).message, "error"); }
  };

  const toggleEnabled = (id: string) => {
    try { AlarmService.toggle(id); refresh(); toast("Toggled", "info"); } catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2"><Icon name="alarm" size={22} /> Alarms</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Local alarms · Stored in this device. Routine association coming soon.</p>
        </div>
        <Button onClick={openNew} aria-label="Create alarm"><Icon name="add" size={14} /> New alarm</Button>
      </div>

      {alarms.length === 0 ? (
        <Card className="text-center py-10 border-dashed" style={{ borderColor: "var(--border-strong)" }}>
          <div className="mx-auto h-10 w-10 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-tertiary)]"><Icon name="alarm" size={18} /></div>
          <h3 className="font-semibold mt-3 text-[var(--text-primary)]">No alarms yet. Create your first alarm.</h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Alarms fire via system notification + sound. Pair with a routine later.</p>
          <Button className="mt-4" onClick={openNew}>Create alarm</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {alarms.map((a) => (
            <Card key={a.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[22px] font-bold tabular-nums tracking-tight text-[var(--text-primary)]">{a.time}</span>
                  <span className={`h-2 w-2 rounded-full ${a.enabled ? "bg-[var(--success)]" : "bg-[var(--text-tertiary)]"}`} aria-hidden />
                  <span className="text-sm font-medium truncate text-[var(--text-primary)]">{a.label}</span>
                  {a.repeat.length === 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)]">Once</span>
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">{a.repeat.map((d) => DAY_LABEL[d]).join(" ")}</span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Snooze {a.snoozeMinutes}m · Routine: <span className="text-[var(--text-secondary)]">— placeholder</span></div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={a.enabled} onChange={() => toggleEnabled(a.id)} className="sr-only peer" aria-label={`Enable ${a.label}`} />
                <div className="w-11 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] peer-focus:ring-2 peer-focus:ring-[var(--accent-signal)]/30 peer-checked:bg-[var(--accent-signal)] peer-checked:border-[var(--accent-signal)] transition-colors" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" aria-hidden />
              </label>
              <Button variant="secondary" size="sm" onClick={() => openEdit(a)} aria-label={`Edit ${a.label}`}>Edit</Button>
              <button onClick={() => setDeleteId(a.id)} aria-label={`Delete ${a.label}`} className="h-9 w-9 grid place-items-center rounded-[10px] border border-[var(--border-default)] hover:bg-[var(--error-subtle)] hover:border-[var(--error)]/30 text-[var(--text-tertiary)] hover:text-[var(--error)]">
                <Icon name="x" size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal — surface-3 dark */}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-3)] p-5 shadow-[var(--elevation-3)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{editing ? "Edit alarm" : "New alarm"}</h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Time is required. Repeat = days alarm fires. Routine is a placeholder for now.</p>
          <div className="mt-4 space-y-4">
            <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Morning workout" required />
            <div>
              <label htmlFor="alarm-time" className="text-xs font-semibold text-[var(--text-secondary)]">Time *</label>
              <input
                id="alarm-time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="mt-1 h-11 w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-signal)] focus:ring-2 focus:ring-[var(--accent-signal)]/20 outline-none"
                aria-label="Alarm time"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Repeat</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {DAYS.map((d) => {
                  const active = form.repeat.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleRepeat(d)}
                      className={`h-8 px-3 rounded-full border text-xs font-medium ${active ? "bg-[var(--accent-signal)] text-white border-[var(--accent-signal)]" : "bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"}`}
                      aria-pressed={active}
                    >
                      {DAY_LABEL[d]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Snooze</div>
              <div className="flex gap-2 mt-2">
                {[5, 10, 15].map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, snooze: s })}
                    className={`flex-1 h-9 rounded-[10px] border text-sm font-medium ${form.snooze === s ? "bg-[var(--accent-signal)] text-white border-[var(--accent-signal)]" : "bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-secondary)]"}`}
                  >
                    {s} min
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-default)] accent-[var(--accent-signal)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Enabled</span>
            </label>

            <div className="rounded-[10px] border border-dashed border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2">
              <div className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5"><Icon name="layers" size={12} /> Routine association</div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Link an automation routine to fire when this alarm rings — placeholder.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={save}>{editing ? "Save changes" : "Create alarm"}</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete alarm?"
        description="This will permanently delete the alarm. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) { AlarmService.delete(deleteId); setDeleteId(null); refresh(); window.dispatchEvent(new Event("calexpenses:refresh")); }
        }}
      />
    </div>
  );
}
