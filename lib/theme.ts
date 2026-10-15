export const DEFAULT_COLORS = {
  colorCream: "#f6f1e7",
  colorInk: "#141414",
  colorAmber: "#f5a623",
  colorAmberDeep: "#e8890c",
} as const;

export type ColorKey = keyof typeof DEFAULT_COLORS;

export const COLOR_FIELDS: { key: ColorKey; label: string; hint: string }[] = [
  { key: "colorCream", label: "Background", hint: "Page background & open skill panels" },
  { key: "colorInk", label: "Text / dark", hint: "Text, borders, dark sections" },
  { key: "colorAmber", label: "Accent", hint: "Buttons, badges, project links" },
  { key: "colorAmberDeep", label: "Accent (hover)", hint: "Hover state of the accent" },
];

export const isHexColor = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
