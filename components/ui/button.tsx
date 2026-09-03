"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "destructive" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-[10px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants: Record<Variant, string> = {
    primary: "bg-[var(--accent-signal)] text-[var(--text-inverse)] hover:bg-[var(--accent-signal-strong)] border border-transparent",
    secondary: "bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]",
    destructive: "bg-[var(--error)] text-white hover:bg-[#D63A4E] border border-transparent",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] border border-transparent",
  };
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-[14px] min-h-[40px]",
    lg: "h-12 px-6 text-[15px] min-h-[48px]",
    icon: "h-10 w-10 p-0 min-h-[40px] min-w-[40px]",
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      ) : (
        children
      )}
    </button>
  );
}
