"use client";
import { useEffect, useState } from "react";
import { cn } from "./ui";

export const ACCENTS = [["orange", "#f97316"], ["blue", "#2563eb"], ["green", "#16a34a"], ["violet", "#7c3aed"], ["rose", "#e11d48"]] as const;
type Mode = "light" | "dark";

function apply(mode: Mode, accent: string) {
  const h = document.documentElement;
  h.dataset.theme = mode; h.dataset.accent = accent;
  localStorage.setItem("sa-theme", mode); localStorage.setItem("sa-accent", accent);
  document.cookie = `sa-theme=${mode}; path=/; max-age=31536000; samesite=lax`;
  document.cookie = `sa-accent=${accent}; path=/; max-age=31536000; samesite=lax`;
}

/** Inline script: sets theme before first paint (no flash). */
export const THEME_INIT = `(function(){try{var h=document.documentElement;var m=localStorage.getItem("sa-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var a=localStorage.getItem("sa-accent")||"orange";h.dataset.theme=m;h.dataset.accent=a;}catch(e){}})();`;

export function ThemeControls({ compact }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("light");
  const [accent, setAccent] = useState<string>("orange");
  useEffect(() => { const h = document.documentElement; setMode((h.dataset.theme as Mode) || "light"); setAccent(h.dataset.accent || "orange"); }, []);
  const set = (m: Mode, a: string) => { setMode(m); setAccent(a); apply(m, a); };
  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "justify-between")}>
      <div className="flex items-center gap-1.5">
        {ACCENTS.map(([k, c]) => (
          <button key={k} aria-label={`${k} theme`} title={k} onClick={() => set(mode, k)} style={{ background: c }}
            className={cn("h-5 w-5 rounded-full transition ring-offset-2 ring-offset-card", accent === k ? "ring-2 ring-current scale-110" : "opacity-70 hover:opacity-100")} />
        ))}
      </div>
      <button onClick={() => set(mode === "dark" ? "light" : "dark", accent)} aria-label="Toggle dark mode"
        className="h-8 px-2.5 rounded-lg text-xs font-medium bg-current/15 hover:bg-current/25 inline-flex items-center gap-1.5">
        {mode === "dark" ? "☾ Dark" : "☀ Light"}
      </button>
    </div>
  );
}
