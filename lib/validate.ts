// Accept only safe link schemes (blocks javascript:, data:, etc.)
export function safeUrl(input: string, allowMail = false): string | null {
  const v = input.trim();
  if (!v) return "";
  try {
    const u = new URL(v);
    const ok = ["http:", "https:", ...(allowMail ? ["mailto:"] : [])];
    return ok.includes(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}

export const str = (fd: FormData, k: string, max = 500) =>
  String(fd.get(k) ?? "").trim().slice(0, max);
