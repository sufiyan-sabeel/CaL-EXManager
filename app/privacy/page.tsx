"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { buildExportPackage, downloadBlob, downloadPdfReport } from "@/lib/export";
import { StorageKeys } from "@/lib/storage/keys";

type PrivacyPrefs = {
  expenseAiAllowed: boolean;
  calendarAiAllowed: boolean;
  notesAiAllowed: boolean;
  connectedDevice: boolean;
  aiProcessing: boolean;
};

const DEFAULT_PREFS: PrivacyPrefs = {
  expenseAiAllowed: false,
  calendarAiAllowed: false,
  notesAiAllowed: false,
  connectedDevice: false,
  aiProcessing: false,
};

function loadPrefs(): PrivacyPrefs {
  try { const raw = localStorage.getItem(StorageKeys.privacy); if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }; } catch {}
  return { ...DEFAULT_PREFS };
}
function savePrefs(p: PrivacyPrefs) { localStorage.setItem(StorageKeys.privacy, JSON.stringify(p)); localStorage.setItem("calexpenses:v1:privacy", JSON.stringify(p)); }

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" aria-label={label} />
      <div className="w-11 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] peer-focus:ring-2 peer-focus:ring-[var(--accent-signal)]/30 peer-checked:bg-[var(--accent-signal)] peer-checked:border-[var(--accent-signal)] transition-colors" />
      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export default function PrivacyPage() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULT_PREFS);
  const [audit, setAudit] = useState<{ at: string; action: string }[]>([]);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteAccountInput, setDeleteAccountInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setMounted(true);
    try { const raw = localStorage.getItem("calexpenses:v1:auditLog"); if (raw) setAudit(JSON.parse(raw)); } catch {}
  }, []);

  const update = (patch: Partial<PrivacyPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next); savePrefs(next);
    const entry = { at: new Date().toISOString(), action: `Updated ${Object.keys(patch).join(", ")}` };
    const nextAudit = [entry, ...audit].slice(0, 20);
    setAudit(nextAudit);
    try { localStorage.setItem("calexpenses:v1:auditLog", JSON.stringify(nextAudit)); } catch {}
    toast("Preference saved", "success");
  };

  const exportJson = () => {
    const pkg = buildExportPackage();
    downloadBlob(JSON.stringify(pkg, null, 2), `cal-expenses-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    const nextAudit = [{ at: new Date().toISOString(), action: "Export JSON" }, ...audit].slice(0, 20);
    setAudit(nextAudit);
    try { localStorage.setItem("calexpenses:v1:auditLog", JSON.stringify(nextAudit)); } catch {}
    toast("Backup downloaded", "success");
  };
  const exportCsv = () => {
    const pkg = buildExportPackage();
    const rows = pkg.expenses.map((e)=>({ date:e.date, amount:e.amount, categoryId:e.categoryId, description:e.description??"" }));
    const csv = ["date,amount,categoryId,description", ...rows.map((r)=>`${r.date},${r.amount},${r.categoryId},"${r.description.replace(/"/g,'""')}"`)].join("\n");
    downloadBlob(csv, `expenses-${new Date().toISOString().slice(0,10)}.csv`, "text/csv");
    toast("CSV downloaded","success");
  };

  const clearData = () => {
    if (deleteInput !== "DELETE") { toast("Type DELETE to confirm", "error"); return; }
    const keys = Object.values(StorageKeys) as string[];
    const pkg = buildExportPackage();
    try { localStorage.setItem(StorageKeys.snapshotPreClear, JSON.stringify(pkg)); } catch {}
    keys.forEach((k)=>{ if(!k.includes("schemaMeta")) try{ localStorage.removeItem(k);}catch{} });
    try { localStorage.removeItem("calexpenses:v1:auditLog"); } catch {}
    toast("Data cleared — snapshot saved", "success");
    setDeleteInput("");
    setTimeout(()=>location.reload(),600);
  };
  const deleteAccount = () => {
    if (deleteAccountInput !== "DELETE") { toast("Type DELETE to confirm account deletion", "error"); return; }
    try { localStorage.clear(); } catch {}
    toast("Account data cleared", "success");
    setTimeout(()=>location.reload(),600);
  };

  const revokeDevice = () => { update({ connectedDevice: false }); toast("Device revoked", "success"); };

  if (!mounted) return <div className="space-y-4"><div className="skeleton h-24 w-full rounded-[14px]" /><div className="skeleton h-40 w-full rounded-[14px]" /></div>;

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2"><Icon name="privacy" size={22} /> Privacy</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Your data, your controls — plain language. Everything is local-first unless you export.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="shield" size={16} /> Data Permissions</CardTitle><span className="text-xs text-[var(--text-tertiary)]">Default OFF · opt-in per module</span></CardHeader>
        <div className="divide-y divide-[var(--border-subtle)]">
          {[
            { key: "expenseAiAllowed" as const, label: "Expenses · AI assistance", hint: "Allow AI to read expense descriptions to categorize and summarize. No network call when off." },
            { key: "calendarAiAllowed" as const, label: "Calendar · AI assistance", hint: "Allow AI to read event titles to suggest times and reminders." },
            { key: "notesAiAllowed" as const, label: "Notes · AI assistance", hint: "Allow AI to summarize and tag notes. Local notes always work without AI." },
            { key: "connectedDevice" as const, label: "Device modules · Performance / Apps / Notifications", hint: "Allow companion app to share system stats and usage. Gated by Android permission." },
          ].map((r)=>(
            <div key={r.key} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-sm font-medium text-[var(--text-primary)]">{r.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-relaxed">{r.hint}</div>
                <span className={`mt-1 inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${prefs[r.key] ? "bg-[var(--success-subtle)] border-[var(--success)]/30 text-[var(--success)]" : "bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-tertiary)]"}`}>{prefs[r.key] ? "Allowed" : "Not allowed · default"}</span>
              </div>
              <Toggle checked={prefs[r.key]} onChange={(v)=>update({[r.key]:v} as Partial<PrivacyPrefs>)} label={r.label} />
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-3">Each toggle is independent. Turning a toggle off immediately stops that AI or companion access — no extra step needed.</p>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="smartphone" size={16} /> Connected Devices</CardTitle><span className={`text-xs px-2 py-0.5 rounded-full border ${prefs.connectedDevice ? "bg-[var(--success-subtle)] border-[var(--success)]/30 text-[var(--success)]" : "bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-tertiary)]"}`}>{prefs.connectedDevice ? "Paired" : "Not paired"}</span></CardHeader>
        <div className="flex items-center gap-3 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] p-3">
          <span className={`h-2 w-2 rounded-full ${prefs.connectedDevice ? "bg-[var(--success)]" : "bg-[var(--text-tertiary)]"}`} aria-hidden />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--text-primary)]">{prefs.connectedDevice ? "Android Companion · paired" : "No device paired"}</div>
            <div className="text-xs text-[var(--text-tertiary)]">{prefs.connectedDevice ? "Last sync — just now · revoke at any time" : "Pair from Performance → Connect device. Permissions are on-device only."}</div>
          </div>
          {prefs.connectedDevice ? <Button variant="secondary" size="sm" onClick={revokeDevice}>Revoke</Button> : <Button variant="secondary" size="sm" onClick={()=>toast("Open Performance → Connect device to pair", "info")}>How to pair</Button>}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="ai" size={16} /> AI Processing Controls</CardTitle></CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 pr-3">
            <div className="text-sm font-medium text-[var(--text-primary)]">Allow AI processing</div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">When off, CAL-EXMANAGER never makes a network call for AI. All features work manually. When on, only the modules you allowed above send their text to your chosen AI layer — never your whole database. Summaries are ephemeral and not stored unless you save them. Turn this off at any time to go fully offline.</p>
          </div>
          <Toggle checked={prefs.aiProcessing} onChange={(v)=>update({aiProcessing:v})} label="Allow AI processing" />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="layers" size={16} /> Local vs Cloud</CardTitle></CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { mod: "CAL-EXPENSES", where: "Local" },
            { mod: "Calendar & Events", where: "Local" },
            { mod: "Notes & Folders", where: "Local" },
            { mod: "Alarms", where: "Local" },
            { mod: "AI Summaries", where: prefs.aiProcessing ? "Cloud (when used)" : "Local/off" },
            { mod: "Device Health", where: "On-device via companion" },
          ].map((r)=>(
            <div key={r.mod} className="flex items-center justify-between rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 py-2">
              <span className="font-medium text-[var(--text-secondary)]">{r.mod}</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${r.where.includes("Local")||r.where.includes("On-device") ? "bg-[var(--success-subtle)] border-[var(--success)]/30 text-[var(--success)]" : "bg-[var(--warning-subtle)] border-[var(--warning)]/30 text-[var(--warning)]"}`}>{r.where}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="layers" size={16} /> Integration Permissions</CardTitle></CardHeader>
        <div className="divide-y divide-[var(--border-subtle)] text-sm">
          {[
            { name: "Calendar sync", status: "Not connected", hint: "Would read event titles only when you enable calendar AI." },
            { name: "Storage import", status: "Local file only", hint: "CSV/JSON import runs entirely on-device; files never leave your browser." },
            { name: "Share sheet", status: "On demand", hint: "Uses Web Share API only when you tap Share — no background access." },
          ].map((r)=>(
            <div key={r.name} className="flex items-center justify-between gap-3 py-3">
              <div><div className="font-medium text-[var(--text-primary)]">{r.name}</div><div className="text-xs text-[var(--text-tertiary)]">{r.hint}</div></div>
              <span className="text-xs px-2 py-1 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)]">{r.status}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Export Data</CardTitle><span className="text-xs text-[var(--text-tertiary)]">JSON · CSV · PDF (client-side)</span></CardHeader>
        <p className="text-sm text-[var(--text-secondary)]">Exports are generated in your browser — no server. JSON is a full backup for re-import; PDF is a printable report.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button variant="secondary" onClick={exportJson}><Icon name="receipt" size={14} /> Export JSON</Button>
          <Button variant="secondary" onClick={exportCsv}><Icon name="barChart" size={14} /> Export CSV</Button>
          <Button onClick={()=>{ downloadPdfReport(); toast("Opening print preview — Save as PDF","success"); }}><Icon name="receipt" size={14} /> Export PDF</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Icon name="activity" size={16} /> Audit log</CardTitle><span className="text-xs tabular-nums text-[var(--text-tertiary)]">{audit.length} entries</span></CardHeader>
        {audit.length===0 ? <p className="text-sm text-[var(--text-tertiary)] py-4 text-center border border-dashed border-[var(--border-default)] rounded-[10px] bg-[var(--surface-2)]/60">No actions yet — exports and permission changes appear here.</p> : (
          <div className="divide-y divide-[var(--border-subtle)] rounded-[10px] border border-[var(--border-default)] overflow-hidden">
            {audit.slice(0,8).map((a,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 bg-[var(--surface-1)]">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-signal)] shrink-0" aria-hidden />
                <span className="flex-1 text-sm text-[var(--text-primary)]">{a.action}</span>
                <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{new Date(a.at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="rounded-[14px] border p-4 space-y-4" style={{ borderColor: "var(--error)", background: "var(--error-subtle)" }}>
        <h3 className="font-semibold flex items-center gap-2 text-[var(--error)]"><Icon name="alert" size={16} /> Danger zone</h3>

        <div className="rounded-[10px] border border-[var(--error)]/40 bg-[var(--surface-1)] p-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Delete Data</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Permanently deletes all local data (expenses, notes, alarms, etc.) after saving a pre-clear snapshot. Type DELETE to confirm.</p>
          <div className="flex gap-2 mt-3">
            <input value={deleteInput} onChange={(e)=>setDeleteInput(e.target.value)} placeholder='Type DELETE' aria-label="Type DELETE to confirm data deletion" className="flex-1 h-10 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20 outline-none" />
            <Button variant="destructive" onClick={clearData} disabled={deleteInput!=="DELETE"}>Delete Data</Button>
          </div>
        </div>

        <div className="rounded-[10px] border border-[var(--error)]/40 bg-[var(--surface-1)] p-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Delete Account</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Clears all storage and signs you out. This cannot be undone without a backup. Type DELETE to confirm.</p>
          <div className="flex gap-2 mt-3">
            <input value={deleteAccountInput} onChange={(e)=>setDeleteAccountInput(e.target.value)} placeholder='Type DELETE' aria-label="Type DELETE to confirm account deletion" className="flex-1 h-10 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20 outline-none" />
            <Button variant="destructive" onClick={deleteAccount} disabled={deleteAccountInput!=="DELETE"}>Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
