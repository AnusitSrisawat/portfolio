"use client";

import { useState } from "react";
import { COLOR_FIELDS, DEFAULT_COLORS, type ColorKey } from "@/lib/theme";

export function ColorFields({ initial }: { initial: Record<ColorKey, string> }) {
  const [vals, setVals] = useState(initial);
  const isDefault = COLOR_FIELDS.every((f) => vals[f.key].toLowerCase() === DEFAULT_COLORS[f.key]);

  return (
    <fieldset className="space-y-3 rounded-2xl border-2 border-ink p-4">
      <legend className="px-2 text-sm font-semibold">Theme colors</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {COLOR_FIELDS.map((f) => (
          <label key={f.key} className="flex items-center gap-3">
            <input
              type="color"
              name={f.key}
              value={vals[f.key]}
              onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border-2 border-ink bg-white p-0.5"
            />
            <span>
              <span className="block text-sm font-semibold">{f.label} <span className="font-mono text-xs font-normal opacity-60">{vals[f.key]}</span></span>
              <span className="block text-xs opacity-60">{f.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="button" className="btn text-sm" disabled={isDefault} onClick={() => setVals({ ...DEFAULT_COLORS })}>
        Revert to default
      </button>
      <span className="ml-3 text-xs opacity-60">then press Save to apply</span>
    </fieldset>
  );
}
