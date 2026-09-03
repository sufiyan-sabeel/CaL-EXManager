"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-semibold text-[var(--text-secondary)]" style={{ letterSpacing: "0.01em" }}>
          {label} {props.required && <span className="text-[var(--error)]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          "h-10 w-full rounded-[10px] border bg-[var(--surface-2)] px-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent-signal)]/30 outline-none transition-colors",
          error ? "border-[var(--error)]" : "border-[var(--border-default)]",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" aria-live="polite" className="text-xs text-[var(--error)] flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, error, className, id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const inputId = id ?? (label ? `ta-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-[12px] font-semibold text-[var(--text-secondary)]">{label}</label>}
      <textarea
        id={inputId}
        aria-invalid={!!error}
        className={cn("w-full rounded-[10px] border bg-[var(--surface-2)] p-3 text-[14px] min-h-[96px] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent-signal)]/30 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]", error ? "border-[var(--error)]" : "border-[var(--border-default)]", className)}
        {...props}
      />
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, id, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  const inputId = id ?? (label ? `sel-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-[12px] font-semibold text-[var(--text-secondary)]">{label}</label>}
      <select
        id={inputId}
        className={cn("h-10 w-full rounded-[10px] border bg-[var(--surface-2)] px-3 text-[14px] focus:border-[var(--border-strong)] outline-none text-[var(--text-primary)]", error ? "border-[var(--error)]" : "border-[var(--border-default)]", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  );
}
