export function orderSlugs(saved: string[], all: string[]): string[] {
  const existing = new Set(all);
  return [...new Set([...saved.filter((slug) => existing.has(slug)), ...all])];
}

export function swapPositions(list: string[], from: number, to: number): string[] {
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
