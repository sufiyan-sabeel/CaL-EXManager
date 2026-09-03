"use client";
import React, { useEffect, useMemo, useState } from "react";
import { NoteService } from "@/lib/services/note.service";
import type { Note, NoteFolder } from "@/lib/domain/models";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export default function NotesPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [q, setQ] = useState("");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ title: string; content: string; folderId: string | null; tags: string; checklistText: string }>({ title: "", content: "", folderId: null, tags: "", checklistText: "" });
  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const refresh = () => { setNotes(NoteService.getAll()); setFolders(NoteService.getFolders()); };
  useEffect(() => { refresh(); const h=()=>refresh(); window.addEventListener("calexpenses:refresh", h as EventListener); return ()=>window.removeEventListener("calexpenses:refresh", h as EventListener); }, []);

  const filtered = useMemo(() => {
    return notes.filter((n) => (showArchived ? true : !n.archived)).filter((n) => (folderFilter === "all" ? true : folderFilter === "pinned" ? n.pinned : n.folderId === folderFilter)).filter((n) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.tags.join(" ").toLowerCase().includes(s);
    });
  }, [notes, q, folderFilter, showArchived]);

  const openNew = () => { setEditing(null); setForm({ title: "", content: "", folderId: null, tags: "", checklistText: "" }); setChecklist([]); setOpen(true); };
  const openEdit = (n: Note) => { setEditing(n.id); setForm({ title: n.title, content: n.content, folderId: n.folderId, tags: n.tags.join(", "), checklistText: "" }); setChecklist([...n.checklist]); setOpen(true); };

  const save = () => {
    if (!form.title.trim()) { toast("Title required", "error"); return; }
    const tags = form.tags.split(",").map((s)=>s.trim()).filter(Boolean);
    try {
      if (editing) NoteService.update(editing, { title: form.title.trim(), content: form.content, folderId: form.folderId, tags, checklist });
      else NoteService.create({ title: form.title.trim(), content: form.content, folderId: form.folderId, tags, pinned: false, archived: false, checklist });
      toast(editing ? "Note updated" : "Note created", "success"); setOpen(false); setEditing(null); refresh(); window.dispatchEvent(new Event("calexpenses:refresh"));
    } catch (e) { toast((e as Error).message, "error"); }
  };

  const togglePin = (id: string) => { const n = notes.find((x)=>x.id===id); if(n) { NoteService.update(id,{pinned:!n.pinned}); refresh(); } };
  const toggleArchive = (id: string) => { const n = notes.find((x)=>x.id===id); if(n) { NoteService.update(id,{archived:!n.archived}); refresh(); } };
  const toggleCheck = (idx: number) => setChecklist((c)=> c.map((x,i)=> i===idx ? {...x, done:!x.done}:x));

  const createFolder = () => {
    if(!newFolderName.trim()){ toast("Folder name required","error"); return; }
    NoteService.createFolder(newFolderName.trim()); setNewFolderName(""); refresh(); toast("Folder created","success");
  };

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2"><Icon name="notes" size={22} /> Notes</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Workspace · Tags, folders, pins and checklists. All local.</p>
        </div>
        <Button onClick={openNew}><Icon name="add" size={14} /> New note</Button>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search notes, tags…" aria-label="Search notes" className="h-11 w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-signal)] focus:ring-2 focus:ring-[var(--accent-signal)]/20 outline-none" />
          </div>
          <select value={folderFilter} onChange={(e)=>setFolderFilter(e.target.value)} className="h-11 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)]" aria-label="Filter by folder">
            <option value="all">All folders</option>
            <option value="pinned">★ Pinned</option>
            {folders.map((f)=><option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input type="checkbox" checked={showArchived} onChange={(e)=>setShowArchived(e.target.checked)} className="h-4 w-4 rounded accent-[var(--accent-signal)]" /> Show archived
          </label>
        </div>
        <div className="mt-3 flex gap-2 items-center">
          <input value={newFolderName} onChange={(e)=>setNewFolderName(e.target.value)} placeholder="New folder name" className="h-9 flex-1 max-w-[200px] rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" aria-label="New folder name" />
          <Button variant="secondary" size="sm" onClick={createFolder}>Create folder</Button>
          <span className="text-xs text-[var(--text-tertiary)]">{folders.length} folders</span>
        </div>
      </Card>

      {filtered.length===0 ? (
        <Card className="text-center py-12 border-dashed" style={{borderColor:"var(--border-strong)"}}>
          <div className="mx-auto h-10 w-10 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-tertiary)]"><Icon name="notes" size={18}/></div>
          <h3 className="font-semibold mt-3">No notes yet</h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Create your first note — use tags, folders and checklists.</p>
          <Button className="mt-4" onClick={openNew}>New note</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n)=> (
            <Card key={n.id} className="p-4 flex flex-col gap-3 relative group" style={{background:"var(--surface-1)"}}>
              {n.pinned && <span className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[var(--warning-subtle)] border border-[var(--warning)]/30 grid place-items-center text-[var(--warning)]" title="Pinned"><Icon name="sparkles" size={12}/></span>}
              <div className="pr-6">
                <div className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{n.title}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{new Date(n.updatedAt).toLocaleDateString()} · {folders.find(f=>f.id===n.folderId)?.name ?? "No folder"}</div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">{n.content || <span className="text-[var(--text-tertiary)]">— empty —</span>}</p>
              {n.tags.length>0 && <div className="flex flex-wrap gap-1">{n.tags.map((t)=><span key={t} className="rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">#{t}</span>)}</div>}
              {n.checklist.length>0 && (
                <div className="space-y-1 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
                  {n.checklist.map((c,i)=>(
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.done} onChange={()=>{ const updated=[...n.checklist]; updated[i]={...updated[i]!, done:!updated[i]!.done}; NoteService.update(n.id,{checklist:updated}); refresh(); }} className="h-4 w-4 rounded accent-[var(--accent-signal)]" />
                      <span className={`${c.done?"line-through text-[var(--text-tertiary)]":"text-[var(--text-primary)]"}`}>{c.text}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button variant="secondary" size="sm" onClick={()=>togglePin(n.id)} aria-label={n.pinned?"Unpin":"Pin"}><Icon name="sparkles" size={12} /> {n.pinned?"Unpin":"Pin"}</Button>
                <Button variant="secondary" size="sm" onClick={()=>toggleArchive(n.id)}>{n.archived?"Unarchive":"Archive"}</Button>
                <Button variant="ghost" size="sm" onClick={()=>toast("AI summary — coming via AI layer","info")}><Icon name="ai" size={12} /> Summarize</Button>
                <div className="ml-auto flex gap-1">
                  <button onClick={()=>openEdit(n)} className="h-8 w-8 grid place-items-center rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label={`Edit ${n.title}`}><Icon name="settings" size={14} /></button>
                  <button onClick={()=>setDeleteId(n.id)} className="h-8 w-8 grid place-items-center rounded-[10px] border border-[var(--border-default)] hover:bg-[var(--error-subtle)] text-[var(--text-tertiary)] hover:text-[var(--error)]" aria-label={`Delete ${n.title}`}><Icon name="x" size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-3)] p-5 max-h-[90vh] overflow-auto">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{editing?"Edit note":"New note"}</h2>
          <div className="mt-4 space-y-4">
            <Input label="Title *" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Meeting notes" />
            <Textarea label="Content" value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} placeholder="Write…" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Folder</label>
                <select value={form.folderId ?? ""} onChange={(e)=>setForm({...form, folderId:e.target.value||null})} className="mt-1 h-10 w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)]">
                  <option value="">No folder</option>
                  {folders.map((f)=><option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <Input label="Tags (comma separated)" value={form.tags} onChange={(e)=>setForm({...form, tags:e.target.value})} placeholder="work, ideas" />
            </div>

            <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)] p-3">
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Checklist</div>
              <div className="space-y-2 mt-2">
                {checklist.map((c,idx)=>(
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" checked={c.done} onChange={()=>toggleCheck(idx)} className="h-4 w-4 rounded accent-[var(--accent-signal)]" />
                    <span className={`flex-1 text-sm ${c.done?"line-through text-[var(--text-tertiary)]":"text-[var(--text-primary)]"}`}>{c.text}</span>
                    <button onClick={()=>setChecklist(c=>c.filter((_,i)=>i!==idx))} className="text-xs text-[var(--error)]">Remove</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={form.checklistText} onChange={(e)=>setForm({...form, checklistText:e.target.value})} placeholder="Add checklist item" className="flex-1 h-9 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-1)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" onKeyDown={(e)=>{ if(e.key==="Enter" && form.checklistText.trim()){ setChecklist([...checklist, {text:form.checklistText.trim(), done:false}]); setForm({...form, checklistText:""}); }}} />
                  <Button variant="secondary" size="sm" onClick={()=>{ if(form.checklistText.trim()){ setChecklist([...checklist, {text:form.checklistText.trim(), done:false}]); setForm({...form, checklistText:""}); }}}>Add</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={save}>{editing?"Save":"Create"}</Button>
            </div>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(v)=>!v && setDeleteId(null)} title="Delete note?" description="This will permanently delete the note." confirmLabel="Delete" onConfirm={()=>{ if(deleteId){ NoteService.delete(deleteId); setDeleteId(null); refresh(); }}} />
    </div>
  );
}
