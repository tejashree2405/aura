const KEY = "aura.redirect";

export function setRedirect(url: string) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(KEY, url); } catch { /* ignore */ }
}

export function takeRedirect(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(KEY);
    if (v) sessionStorage.removeItem(KEY);
    return v;
  } catch { return null; }
}
