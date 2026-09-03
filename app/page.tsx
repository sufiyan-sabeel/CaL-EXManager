"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[var(--surface-base)]">
      <Logo variant="icon" size="xl" />
      <h1 className="text-xl font-semibold mt-4 tracking-tight" style={{ fontFamily: "var(--font-family-base)" }}>
        <span className="font-bold">CAL-EX</span><span className="font-medium">MANAGER</span>
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-2">Personal Digital Command Center</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-4">Redirecting to dashboard…</p>
      <a href="/CaL-EXManager/dashboard/" className="mt-4 text-sm text-[var(--accent-signal)] underline">
        Go to Dashboard →
      </a>
      <noscript>
        <p className="text-sm mt-4">
          <a href="/CaL-EXManager/dashboard/">Continue to Dashboard</a>
        </p>
      </noscript>
    </div>
  );
}
