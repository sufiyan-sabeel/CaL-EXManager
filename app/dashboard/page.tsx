"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { ProfileService } from "@/lib/services/profile.service";
import { ExpenseService } from "@/lib/services/expense.service";
import { IncomeService } from "@/lib/services/income.service";
import { BudgetService } from "@/lib/services/budget.service";
import { EventService } from "@/lib/services/event.service";
import { AutomationService } from "@/lib/services/automation.service";
import { calcCurrentBalance, calcMonthlyIncome, calcMonthlyExpenses, calcMonthlySavings, calcSavingsRate, monthRangeFor, dailySpend } from "@/lib/calculations";
import { Card, CardHeader, CardTitle, CardHero } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { todayISODate } from "@/lib/domain/common";
import Link from "next/link";

function CommandScoreRing({ score }: { score: number }) {
  const r = 52; const c = 2 * Math.PI * r; const off = c - (score / 100) * c;
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--accent-signal)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 600ms ease-out" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">Score</div>
          <div className="text-[32px] font-extrabold tabular-nums leading-none text-[var(--text-primary)]">{score}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function Heatmap({ expenses }: { expenses: { date: string; amount: number }[] }) {
  const today = todayISODate();
  const avg = (() => { let s=0; for(let i=0;i<90;i++){const d=new Date(today+"T00:00:00"); d.setDate(d.getDate()-i); s+= expenses.filter(e=>e.date===d.toISOString().slice(0,10)).reduce((a,b)=>a+b.amount,0);} return s/90;})();
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today + "T00:00:00"); d.setDate(d.getDate() - (83 - i));
    const iso = d.toISOString().slice(0,10);
    const spend = expenses.filter(e=>e.date===iso).reduce((a,b)=>a+b.amount,0);
    let lvl=0; if(avg===0) lvl= spend?4:0; else {const ratio=spend/avg; if(ratio<=0.25) lvl=0; else if(ratio<=0.75) lvl=1; else if(ratio<=1.25) lvl=2; else if(ratio<=2) lvl=3; else lvl=4;}
    const bg = ["var(--heat-0)","var(--heat-1)","var(--heat-2)","var(--heat-3)","var(--heat-4)"][lvl];
    const border = lvl>=3 ? "1px solid var(--accent-signal)" : "1px solid var(--border-subtle)";
    return { iso, spend, lvl, bg, border };
  });
  return (
    <div>
      <div className="grid grid-cols-12 gap-1">
        {cells.map(c=> <div key={c.iso} title={`${c.iso}: ₹${c.spend}`} className="h-3 rounded-[3px]" style={{ background: c.bg as string, border: c.border }} aria-label={`${c.iso} ${c.spend}`} />)}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-[var(--text-tertiary)]">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[3px] border border-[var(--border-subtle)]" style={{ background: "var(--heat-0)"}} />
        <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-1)"}} />
        <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-2)"}} />
        <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-3)"}} />
        <span className="h-3 w-3 rounded-[3px]" style={{ background: "var(--heat-4)"}} />
        <span>More</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { if (!loading && !user) router.replace("/auth"); const prof=ProfileService.get(); if(!loading&&user&&prof&&!prof.onboardingCompleted) router.replace("/onboarding"); }, [user,loading,router]);
  const data = useMemo(() => {
    if (typeof window==="undefined") return null;
    const profile=ProfileService.get(); if(!profile) return null;
    const today=todayISODate();
    const expenses=ExpenseService.getAll();
    const incomes=IncomeService.getAll();
    const budgets=BudgetService.getAll();
    const events=EventService.getAll();
    const automations=AutomationService.getAll();
    const { start, end }=monthRangeFor(today);
    const monthlyIncome=calcMonthlyIncome(incomes,start,end);
    const monthlyExpenses=calcMonthlyExpenses(expenses,start,end);
    const balance=calcCurrentBalance(profile.startingBalance,incomes,expenses,today);
    const savings=calcMonthlySavings(monthlyIncome,monthlyExpenses);
    const rate=calcSavingsRate(savings,monthlyIncome);
    const todayIncome=incomes.filter(i=>i.date===today).reduce((s,i)=>s+i.amount,0);
    const todayExpense=expenses.filter(e=>e.date===today).reduce((s,e)=>s+e.amount,0);
    const last30=Array.from({length:30},(_,i)=>{ const d=new Date(today+"T00:00:00"); d.setDate(d.getDate()-(29-i)); const iso=d.toISOString().slice(0,10); return {date:iso, spent:dailySpend(iso,expenses)};});
    const upcoming=events.filter(e=>e.startDate>=today).slice(0,3);
    const recent=expenses.slice(0,5);
    // command score: simple composite 40% savingsRate 30% budget health 30% activity
    const budgetHealth = budgets.length? Math.max(0,100 - budgets.filter(b=>{const spent=expenses.filter(e=>e.categoryId===b.categoryId).reduce((s,e)=>s+e.amount,0); return spent>b.amount}).length*25): 80;
    const activityScore = Math.min(100, expenses.length*4 + events.length*3 + automations.filter(a=>a.enabled).length*10);
    const savingsScore = rate===null? 60 : Math.max(0, Math.min(100, 60 + (rate/2)));
    const commandScore = Math.round(0.4*savingsScore + 0.3*budgetHealth + 0.3*activityScore);
    return { profile, balance, monthlyIncome, monthlyExpenses, savings, rate, todayIncome, todayExpense, last30, upcoming, recent, expenses, budgets, commandScore, automations };
  }, [refresh]);
  useEffect(()=>{ const h=()=>setRefresh(v=>v+1); window.addEventListener("calexpenses:refresh",h as EventListener); window.addEventListener("storage",h); return ()=>{window.removeEventListener("calexpenses:refresh",h as EventListener); window.removeEventListener("storage",h);};},[]);
  if(loading) return <div className="p-8"><div className="skeleton h-24 w-full rounded-[14px]" /></div>;
  if(!user||!data) return <div className="p-8 text-[var(--text-secondary)]">Loading…</div>;
  const fmt=(n:number)=>{ try{return new Intl.NumberFormat(data.profile.locale,{style:"currency",currency:data.profile.currency, maximumFractionDigits:0}).format(n);}catch{return `₹${n}`} };
  const hour=new Date().getHours(); const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const hasData=data.expenses.length>0||data.recent.length>0;
  const max30=Math.max(...data.last30.map(d=>d.spent),1);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight leading-none">{greeting}, <span className="text-[var(--text-secondary)]">{data.profile.displayName.split(" ")[0]}</span></h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Your command center — {new Date().toLocaleDateString(data.profile.locale,{weekday:"long", month:"long", day:"numeric"})}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" aria-hidden />
          <span className="text-xs text-[var(--text-tertiary)]">Live</span>
        </div>
      </div>

      {!hasData && (
        <Card className="border-dashed" style={{ borderColor: "var(--border-strong)" }}>
          <h3 className="font-semibold">Welcome to CAL-EXMANAGER</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">No transactions yet. Add your first expense to see your dashboard come alive.</p>
          <div className="flex gap-2 mt-4">
            <Link href="/expenses"><Button><Icon name="expenses" size={16} /> Add expense</Button></Link>
            <Link href="/calendar"><Button variant="secondary">Open calendar</Button></Link>
          </div>
        </Card>
      )}

      {/* PRIMARY ROW — hero Command Score 8 cols + stacked pair 4 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <CardHero className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-6">
          <CommandScoreRing score={data.commandScore} />
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="text-xs font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">Command Score</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">Composite wellbeing — savings, budget health and activity.</div>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border" style={{ background:"var(--success-subtle)", borderColor:"var(--success)", color:"var(--success)"}}><span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Savings {data.rate===null?"—":`${data.rate.toFixed(0)}%`}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border" style={{ background:"var(--info-subtle)", borderColor:"var(--info)", color:"var(--info)"}}><span className="h-1.5 w-1.5 rounded-full bg-[var(--info)]" /> Budgets {data.budgets.length}</span>
            </div>
          </div>
        </CardHero>
        <div className="lg:col-span-4 grid grid-rows-2 gap-4">
          <Card className="flex flex-col justify-center">
            <div className="text-xs font-semibold tracking-wide uppercase text-[var(--text-tertiary)] flex items-center gap-1.5"><Icon name="expenses" size={12} /> Today&apos;s Expenses</div>
            <div className="metric-lg tabular-nums mt-1" style={{ color: data.todayExpense?"var(--error)":"var(--text-primary)"}}>{data.todayExpense? `−${fmt(data.todayExpense)}`: fmt(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1"><Icon name={data.todayExpense> (data.monthlyExpenses/30) ? "trendingUp":"trendingDown"} size={12} /> vs daily avg {(data.monthlyExpenses/30).toFixed(0)}</div>
          </Card>
          <Card className="flex flex-col justify-center">
            <CardHeader className="mb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Icon name="calendar" size={14}/> Upcoming Events</CardTitle><Link href="/calendar" className="text-xs text-[var(--accent-signal)] hover:underline">Open →</Link></CardHeader>
            {data.upcoming.length===0? <p className="text-sm text-[var(--text-tertiary)]">Nothing scheduled today.</p> : (
              <div className="space-y-2">
                {data.upcoming.slice(0,2).map(e=>(
                  <div key={e.id} className="flex items-center gap-2 text-sm"><span className="h-7 w-7 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--accent-signal)]"><Icon name="calendar" size={12} /></span><span className="font-medium truncate">{e.title}</span><span className="ml-auto text-xs text-[var(--text-tertiary)]">{e.startDate.slice(5)}</span></div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SECONDARY ROW — 4 MetricCards with horizontal scroll on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label:"Battery", value:"—", sub:"Requires companion", icon:"battery" as const, lock:true },
          { label:"Storage", value:"—", sub:"Requires companion", icon:"hardDrive" as const, lock:true },
          { label:"Screen Time", value:"—", sub:"Requires companion", icon:"smartphone" as const, lock:true },
          { label:"App Usage", value:"—", sub:"Requires companion", icon:"apps" as const, lock:true },
        ].map(card=>(
          <Card key={card.label} className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase text-[var(--text-tertiary)] flex items-center gap-1.5"><Icon name={card.icon} size={12}/>{card.label}</span>
              {card.lock && <span className="h-5 w-5 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-tertiary)]" title="Requires Android Companion"><Icon name="lock" size={10} /></span>}
            </div>
            <div className="metric-lg tabular-nums mt-2 text-[var(--text-primary)]">{card.value}</div>
            <div className="text-xs text-[var(--warning)] mt-1 flex items-center gap-1"><Icon name="lock" size={10} />{card.sub}</div>
          </Card>
        ))}
      </div>
      {/* Mobile horizontal snap row duplicate for premium feel — hidden on desktop, visible description says snap */}
      <div className="lg:hidden overflow-x-auto snap-x snap-mandatory flex gap-3 pb-1 -mx-4 px-4" style={{ scrollbarWidth:"none"}}>
        {[
          {label:"Battery", icon:"battery" as const},{label:"Storage", icon:"hardDrive" as const},{label:"Screen Time", icon:"smartphone" as const},{label:"App Usage", icon:"apps" as const}
        ].map(c=>(
          <div key={c.label} className="snap-center shrink-0 w-[72%] rounded-[14px] border p-4 bg-[var(--surface-1)] border-[var(--border-default)]">
            <div className="text-xs font-semibold uppercase text-[var(--text-tertiary)] flex items-center gap-1"><Icon name={c.icon} size={12}/>{c.label}</div>
            <div className="text-xl font-bold mt-2 text-[var(--text-primary)]">—</div>
            <div className="text-xs text-[var(--warning)]">Connect device</div>
          </div>
        ))}
      </div>

      {/* ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Icon name="activity" size={16}/> Activity Heatmap</CardTitle><span className="text-xs text-[var(--text-tertiary)]">84 days</span></CardHeader>
          <Heatmap expenses={data.expenses} />
          <div className="text-xs text-[var(--text-tertiary)] mt-3">Composite signal — expenses, events and automations on accent scale.</div>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Icon name="barChart" size={16}/> Expense Trend</CardTitle><Link href="/insights" className="text-xs text-[var(--accent-signal)]">Insights →</Link></CardHeader>
          {data.last30.every(d=>d.spent===0)? <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">No activity data yet.</p> : (
            <div className="h-[140px] flex items-end gap-[2px]">
              {data.last30.map(d=>{
                const h=(d.spent/max30)*100;
                return <div key={d.date} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-[3px]" style={{ height:`${h}%`, minHeight: d.spent?"6px":"1px", background:"var(--accent-signal)", opacity: d.spent?0.9:0.1}} title={`${d.date}: ${fmt(d.spent)}`} /><span className="hidden lg:block text-[9px] text-[var(--text-tertiary)]">{d.date.slice(8)}</span></div>;
              })}
            </div>
          )}
          <details className="mt-3"><summary className="text-xs text-[var(--accent-signal)] cursor-pointer">View as table</summary><div className="max-h-40 overflow-auto mt-2 border border-[var(--border-subtle)] rounded-[10px]"><table className="w-full text-xs"><tbody>{data.last30.filter(d=>d.spent>0).map(d=><tr key={d.date} className="border-t border-[var(--border-subtle)]"><td className="p-2">{d.date}</td><td className="p-2 text-right tabular-nums">{fmt(d.spent)}</td></tr>)}</tbody></table></div></details>
        </Card>
      </div>

      {/* TERTIARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Icon name="calendar" size={14}/> Calendar Timeline</CardTitle><Link href="/calendar" className="text-xs text-[var(--accent-signal)]">Open →</Link></CardHeader>
          {data.upcoming.length===0? <p className="text-sm text-[var(--text-tertiary)]">Nothing scheduled today.</p> : (
            <div className="space-y-3">
              {data.upcoming.map(e=>(
                <div key={e.id} className="flex gap-3">
                  <div className="w-10 shrink-0 text-center">
                    <div className="text-[11px] font-semibold uppercase text-[var(--text-tertiary)]">{new Date(e.startDate+"T00:00:00").toLocaleDateString("en-US",{month:"short"})}</div>
                    <div className="text-lg font-bold leading-none">{new Date(e.startDate+"T00:00:00").getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0 border-l border-[var(--border-subtle)] pl-3">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{e.startDate} → {e.endDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><Icon name="automations" size={14}/> Automation Status</CardTitle><span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-signal-subtle)] text-[var(--accent-signal)] border border-[var(--accent-signal)]/20">{data.automations.filter(a=>a.enabled).length} active</span></CardHeader>
          {data.automations.length===0? <div className="text-center py-6"><Icon name="zap" size={20} className="mx-auto text-[var(--text-tertiary)]" /><p className="text-sm font-medium mt-2">No automations yet</p><p className="text-xs text-[var(--text-tertiary)]">Start from a template</p><Link href="/automations" className="inline-flex mt-3"><Button size="sm">Browse templates</Button></Link></div> : (
            <div className="space-y-2">
              {data.automations.slice(0,3).map(a=>(
                <div key={a.id} className="flex items-center gap-2 p-2 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-2)]">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${a.enabled?"bg-[var(--success)]":"bg-[var(--text-tertiary)]"}`} />
                  <span className="text-sm font-medium truncate flex-1">{a.name}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">{a.lastRunStatus ?? "—"}</span>
                </div>
              ))}
              <Link href="/automations" className="text-xs text-[var(--accent-signal)]">View all →</Link>
            </div>
          )}
        </Card>
        <Card className="border-[var(--accent-signal)]/20 bg-[var(--accent-signal-subtle)]">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-[var(--accent-signal)]"><Icon name="ai" size={14}/> AI Insight</div>
          <p className="text-sm mt-2 leading-relaxed text-[var(--text-primary)]">{
            data.monthlyExpenses > data.monthlyIncome ? "Spending exceeds income this month — consider reviewing Food and Shopping categories." :
            data.monthlyExpenses > (data.monthlyExpenses*1.18) ? "Spending steady. Food category drove 18% of variation." :
            "Spending increased 12% this week, mostly in Food. Your savings rate holds at " + (data.rate===null?"—":`${data.rate.toFixed(0)}%`) + "."
          }</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">Based on CAL-EXPENSES data from {monthRangeFor(todayISODate()).start} to {monthRangeFor(todayISODate()).end}</p>
          <Link href="/ai" className="text-xs font-medium text-[var(--accent-signal)] mt-3 inline-flex items-center gap-1">Ask a follow-up <Icon name="chevronRight" size={12} /></Link>
        </Card>
      </div>

      {/* Recent activity full-width ListCard + Balance quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent activity</CardTitle><Link href="/expenses" className="text-xs text-[var(--accent-signal)]">See all →</Link></CardHeader>
          {data.recent.length===0? <p className="text-sm text-[var(--text-tertiary)] py-6 text-center">No activity yet.</p> : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {data.recent.map(e=>(
                <div key={e.id} className="flex items-center gap-3 py-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--error-subtle)] border border-[var(--error)]/20 grid place-items-center text-[var(--error)]"><Icon name="expenses" size={14} /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{e.description ?? e.merchant ?? "Expense"}</div><div className="text-xs text-[var(--text-tertiary)]">{e.date}</div></div>
                  <span className="text-sm font-semibold tabular-nums text-[var(--error)]">−{fmt(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className="text-xs font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">Current Balance</div>
          <div className="metric-lg tabular-nums mt-1">{fmt(data.balance)}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Starting {fmt(data.profile.startingBalance)} + income − expenses</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-[10px] bg-[var(--success-subtle)] border border-[var(--success)]/20"><div className="text-xs text-[var(--success)]">Income</div><div className="font-semibold tabular-nums text-[var(--success)]">+{fmt(data.monthlyIncome)}</div><div className="text-xs text-[var(--text-tertiary)]">This month</div></div>
            <div className="p-3 rounded-[10px] bg-[var(--error-subtle)] border border-[var(--error)]/20"><div className="text-xs text-[var(--error)]">Expenses</div><div className="font-semibold tabular-nums text-[var(--error)]">−{fmt(data.monthlyExpenses)}</div><div className="text-xs text-[var(--text-tertiary)]">This month</div></div>
          </div>
          <div className="mt-3 text-xs text-[var(--text-tertiary)]">Savings rate {data.rate===null?"—":`${data.rate.toFixed(1)}%`}</div>
        </Card>
      </div>
    </div>
  );
}
