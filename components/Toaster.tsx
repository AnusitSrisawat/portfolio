"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; kind: "ok" | "error"; text: string };
type Listener = (t: Toast) => void;

// Module-level bus so a toast outlives the form that raised it
// (e.g. a deleted row's form is unmounted as soon as the page refreshes).
const listeners = new Set<Listener>();
let nextId = 1;

export function toast(kind: Toast["kind"], text: string) {
  const t = { id: nextId++, kind, text };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [current, setCurrent] = useState<Toast | null>(null);

  useEffect(() => {
    const l: Listener = (t) => setCurrent(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), current.kind === "error" ? 4000 : 1800);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-ink px-5 py-2 text-sm font-semibold shadow-lg ${
        current.kind === "ok" ? "bg-amber text-ink" : "bg-red-500 text-white"
      }`}
    >
      {current.kind === "ok" ? `✓ ${current.text}` : current.text}
    </div>
  );
}
