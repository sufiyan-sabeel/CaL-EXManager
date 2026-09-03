"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

type LogoVariant = "mark" | "wordmark" | "stacked" | "icon";
type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showText?: boolean;
}

export function Logo({ variant = "mark", size = "md", className, showText = true }: LogoProps) {
  const sizes: Record<LogoSize, { box: string; text: string }> = {
    sm: { box: "h-7 w-7", text: "text-sm" },
    md: { box: "h-8 w-8", text: "text-[15px]" },
    lg: { box: "h-10 w-10", text: "text-base" },
    xl: { box: "h-12 w-12", text: "text-lg" },
  };
  const s = sizes[size];

  const Mark = ({ boxClass }: { boxClass: string }) => (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center shrink-0 select-none",
        "bg-[var(--accent-signal)] text-white",
        boxClass,
        className
      )}
      style={{ borderRadius: "10px" }}
    >
      <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none" aria-hidden>
        <rect x="4" y="6" width="24" height="20" rx="3.5" fill="white" opacity="0.96" />
        <rect x="4" y="6" width="24" height="6" rx="3.5" fill="#EEF1FF" />
        <rect x="8.5" y="4.2" width="2.2" height="5" rx="1.1" fill="white" stroke="#5B6EF5" strokeWidth="0.7" />
        <rect x="21.3" y="4.2" width="2.2" height="5" rx="1.1" fill="white" stroke="#5B6EF5" strokeWidth="0.7" />
        <circle cx="10" cy="15.5" r="1.2" fill="#5B6EF5" />
        <circle cx="16" cy="15.5" r="1.2" fill="#D0D0D3" />
        <circle cx="22" cy="15.5" r="1.2" fill="#D0D0D3" />
        <circle cx="10" cy="20.2" r="1.2" fill="#D0D0D3" />
        <circle cx="16" cy="20.2" r="1.45" fill="#5B6EF5" />
        <circle cx="22" cy="20.2" r="1.2" fill="#22B8B0" />
        <rect x="10" y="11.2" width="12" height="0.9" rx="0.45" fill="#5B6EF5" opacity="0.85" />
      </svg>
    </div>
  );

  // Premium wordmark: CAL-EX (700) + MANAGER (500) as single unit per design.md §3
  const Wordmark = ({ textClass }: { textClass: string }) => (
    <span className={cn("tracking-[-0.02em] leading-none", textClass)} style={{ fontFamily: "var(--font-family-base)" }}>
      <span className="font-bold">CAL-EX</span><span className="font-medium">MANAGER</span>
    </span>
  );

  if (variant === "mark") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <Mark boxClass={s.box} />
        {showText && (
          <div className="flex flex-col leading-none">
            <Wordmark textClass={cn(s.text, "text-[var(--text-primary)]")} />
            <span className="text-[10px] leading-[1] tracking-[0.08em] font-medium text-[var(--text-tertiary)] uppercase hidden sm:block">
              Personal Digital Command Center
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <Mark boxClass={s.box} />
        <Wordmark textClass={cn(s.text, "text-[var(--text-primary)]")} />
      </div>
    );
  }

  if (variant === "icon") {
    return <Mark boxClass={s.box} />;
  }

  return (
    <div className={cn("flex flex-col items-center text-center gap-3", className)}>
      <Mark boxClass={s.box} />
      <div>
        <div className={cn("tracking-[-0.025em] text-[var(--text-primary)]", s.text)}><Wordmark textClass={s.text} /></div>
        <div className="text-xs tracking-[0.08em] font-medium text-[var(--text-secondary)] uppercase">Personal Digital Command Center</div>
      </div>
    </div>
  );
}

export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#5B6EF5"/><rect x="4" y="6" width="24" height="20" rx="3.5" fill="white" opacity="0.96"/><rect x="4" y="6" width="24" height="6" rx="3.5" fill="#EEF1FF"/><rect x="8.5" y="4.2" width="2.2" height="5" rx="1.1" fill="white" stroke="#5B6EF5" stroke-width="0.7"/><rect x="21.3" y="4.2" width="2.2" height="5" rx="1.1" fill="white" stroke="#5B6EF5" stroke-width="0.7"/><circle cx="10" cy="15.5" r="1.2" fill="#5B6EF5"/><circle cx="16" cy="15.5" r="1.2" fill="#D0D0D3"/><circle cx="22" cy="15.5" r="1.2" fill="#D0D0D3"/><circle cx="10" cy="20.2" r="1.2" fill="#D0D0D3"/><circle cx="16" cy="20.2" r="1.45" fill="#5B6EF5"/><circle cx="22" cy="20.2" r="1.2" fill="#22B8B0"/><rect x="10" y="11.2" width="12" height="0.9" rx="0.45" fill="#5B6EF5" opacity="0.85"/></svg>`;
