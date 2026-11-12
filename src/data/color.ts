const WHITE = "#ffffff";
const INK = "#2b1d17";
const MIN_CONTRAST = 4.5;

const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const toHex = (rgb: number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

const luminance = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
};

// Cores de destaque vêm do CMS: escolhe o texto mais legível e, se nem branco nem tinta
// alcançam WCAG AA, escurece o fundo aos poucos mantendo o texto branco.
export function readableButton(bg: string): { backgroundColor: string; color: string } {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(bg)) return { backgroundColor: bg, color: WHITE };
  const color = contrast(bg, WHITE) >= contrast(bg, INK) ? WHITE : INK;
  if (contrast(bg, color) >= MIN_CONTRAST) return { backgroundColor: bg, color };

  const rgb = toRgb(bg);
  let darker = bg;
  for (let k = 0.95; k > 0 && contrast(darker, WHITE) < MIN_CONTRAST; k -= 0.05) {
    darker = toHex(rgb.map((c) => c * k));
  }
  return { backgroundColor: darker, color: WHITE };
}
