import { StorageKeys } from "../storage/keys";
import { loadListSync, saveListSync } from "./base";
import type { Note, NoteFolder } from "../domain/models";
import { generateId, nowIso } from "../domain/common";

export const NoteService = {
  getAll(): Note[] {
    return loadListSync<Note>(StorageKeys.notes).sort((a,b)=> (a.pinned===b.pinned? b.updatedAt.localeCompare(a.updatedAt) : a.pinned?-1:1));
  },
  getFolders(): NoteFolder[] { return loadListSync<NoteFolder>(StorageKeys.noteFolders); },
  create(data: Omit<Note,"id"|"createdAt"|"updatedAt">): Note {
    const now=nowIso(); const n: Note={...data, id:generateId(), createdAt:now, updatedAt:now};
    saveListSync(StorageKeys.notes, [...loadListSync<Note>(StorageKeys.notes), n]); return n;
  },
  update(id:string,patch:Partial<Note>): Note {
    const all=loadListSync<Note>(StorageKeys.notes); const idx=all.findIndex(n=>n.id===id); if(idx===-1) throw new Error("Note not found");
    const merged={...all[idx]!, ...patch, updatedAt:nowIso()} as Note; all[idx]=merged; saveListSync(StorageKeys.notes, all); return merged;
  },
  delete(id:string){ saveListSync(StorageKeys.notes, loadListSync<Note>(StorageKeys.notes).filter(n=>n.id!==id)); },
  createFolder(name:string,color:string="#5B6EF5"): NoteFolder {
    const now=nowIso(); const f:NoteFolder={id:generateId(), name, color, createdAt:now, updatedAt:now};
    saveListSync(StorageKeys.noteFolders, [...loadListSync<NoteFolder>(StorageKeys.noteFolders), f]); return f;
  },
};
