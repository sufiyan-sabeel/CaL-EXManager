import { StorageKeys } from "../storage/keys";
import { loadListSync, saveListSync } from "./base";
import type { Alarm } from "../domain/models";
import { generateId, nowIso } from "../domain/common";

export const AlarmService = {
  getAll(): Alarm[] { return loadListSync<Alarm>(StorageKeys.alarms).sort((a,b)=> a.time.localeCompare(b.time)); },
  create(data: Omit<Alarm,"id"|"createdAt"|"updatedAt">): Alarm {
    const now=nowIso(); const al:Alarm={...data, id:generateId(), createdAt:now, updatedAt:now};
    saveListSync(StorageKeys.alarms, [...loadListSync<Alarm>(StorageKeys.alarms), al]); return al;
  },
  update(id:string,patch:Partial<Alarm>): Alarm {
    const all=loadListSync<Alarm>(StorageKeys.alarms); const idx=all.findIndex(a=>a.id===id); if(idx===-1) throw new Error("Alarm not found");
    const merged={...all[idx]!, ...patch, updatedAt:nowIso()} as Alarm; all[idx]=merged; saveListSync(StorageKeys.alarms, all); return merged;
  },
  toggle(id:string){ const a=this.getAll().find(x=>x.id===id); if(!a) throw new Error("Not found"); return this.update(id,{enabled:!a.enabled}); },
  delete(id:string){ saveListSync(StorageKeys.alarms, loadListSync<Alarm>(StorageKeys.alarms).filter(a=>a.id!==id)); },
};
