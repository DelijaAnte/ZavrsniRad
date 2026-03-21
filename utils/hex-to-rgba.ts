/** Used when the string is not a valid 3- or 6-digit hex color. */
const FALLBACK_TRANSPARENT = "rgba(0,0,0,0)";

/**
 * Converts #RGB / #RRGGBB to rgba(). Clamps opacity to [0, 1].
 * Returns a transparent fallback for invalid input (never NaN components).
 */
export function hexToRgba(hex: string, opacity: number): string {
  const op = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0;
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return FALLBACK_TRANSPARENT;
  const n = Number.parseInt(h, 16);
  if (!Number.isFinite(n)) return FALLBACK_TRANSPARENT;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${op})`;
}
