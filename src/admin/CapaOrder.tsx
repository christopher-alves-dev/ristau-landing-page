import { orderSlugs, swapPositions } from "../data/carrossel";

const font = "system-ui, sans-serif";

const files = import.meta.glob<string>("../content/capas/*/index.yaml", { eager: true, query: "?raw", import: "default" });

const names = new Map(
  Object.entries(files).map(([path, yaml]) => {
    const slug = path.split("/").at(-2)!;
    return [slug, /^name:\s*["']?(.+?)["']?\s*$/m.exec(yaml)?.[1] ?? slug];
  }),
);

const parse = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);

function Input({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const list = orderSlugs(value, [...names.keys()]);
  return (
    <div style={{ display: "grid", gap: 8, fontFamily: font }}>
      <div>
        <strong style={{ fontSize: 14 }}>Posição das capas</strong>
        <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.7 }}>
          Ao escolher uma posição ocupada, as duas capas trocam de lugar. "Crie do seu jeito" fica sempre por último.
        </p>
      </div>
      {list.map((slug, position) => (
        <label key={slug} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
          <select
            aria-label={`Posição de ${names.get(slug)}`}
            value={position}
            onChange={(e) => onChange(swapPositions(list, position, Number(e.target.value)))}
            style={{ font: `500 14px ${font}`, padding: "4px 8px", borderRadius: 6, border: "1px solid #d4d4d8" }}
          >
            {list.map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
          {names.get(slug)}
        </label>
      ))}
    </div>
  );
}

export function capaOrder() {
  return {
    kind: "form" as const,
    label: "Posição das capas",
    Input,
    defaultValue: (): string[] => [],
    parse,
    serialize: (value: string[]) => ({ value }),
    validate: (value: string[]) => value,
    reader: { parse },
  };
}
