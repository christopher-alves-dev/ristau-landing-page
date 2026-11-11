import { useEffect, useState, type CSSProperties } from "react";

const font = "system-ui, sans-serif";

// Um objeto com Input próprio no Keystatic precisa desenhar os filhos sozinho,
// porque o formulário padrão não é exportado. Aqui fica uma versão enxuta dele.

/* eslint-disable @typescript-eslint/no-explicit-any */
type PreviewProps = any;

export function previewValue(props: PreviewProps): unknown {
  if ("elements" in props) return props.elements.map(previewValue);
  if ("fields" in props) {
    return Object.fromEntries(Object.entries(props.fields).map(([key, child]) => [key, previewValue(child)]));
  }
  // Fotos novas ainda não têm URL; a prévia mantém a versão salva.
  if (props.value?.data instanceof Uint8Array) return null;
  return props.value;
}

type FieldProps = { props: PreviewProps; forceValidation: boolean };

export function FieldInput({ props, forceValidation }: FieldProps) {
  const { schema } = props;
  if (schema.kind === "form") {
    const Input = schema.Input;
    return <Input value={props.value} onChange={props.onChange} autoFocus={false} forceValidation={forceValidation} />;
  }
  if (schema.kind === "object") return <ObjectFields props={props} forceValidation={forceValidation} />;
  if (schema.kind === "array") return <ArrayInput props={props} forceValidation={forceValidation} />;
  return null;
}

export function ObjectFields({ props, forceValidation, heading }: FieldProps & { heading?: boolean }) {
  const { label, description } = props.schema;
  return (
    <div style={{ display: "grid", gap: 24, fontFamily: font }}>
      {heading && label && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{label}</h2>
          {description && <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.7 }}>{description}</p>}
        </div>
      )}
      {Object.entries(props.fields).map(([key, child]) => (
        <FieldInput key={key} props={child} forceValidation={forceValidation} />
      ))}
    </div>
  );
}

const small: CSSProperties = {
  font: `500 13px ${font}`,
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #d4d4d8",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

function ArrayInput({ props, forceValidation }: FieldProps) {
  const { schema, elements, onChange } = props;
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [openNew, setOpenNew] = useState(false);
  const keys = elements.map((el: PreviewProps) => ({ key: el.key }));

  const move = (i: number, dir: number) => {
    const next = [...keys];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(keys.filter((_: unknown, j: number) => j !== i));
  const add = () => {
    onChange([...keys, { key: undefined }]);
    setOpenNew(true);
  };

  useEffect(() => {
    if (!openNew || !elements.length) return;
    setOpen((s) => new Set(s).add(elements.at(-1).key));
    setOpenNew(false);
  }, [openNew, elements]);

  const toggle = (key: string, isOpen: boolean) =>
    setOpen((s) => {
      const next = new Set(s);
      if (isOpen) next.add(key);
      else next.delete(key);
      return next;
    });

  const controls = (i: number) => (
    // preventDefault: o clique nos botões não deve abrir/fechar o <details>.
    <span style={{ display: "flex", gap: 6, marginLeft: "auto" }} onClick={(e) => e.preventDefault()}>
      <button type="button" style={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para cima">
        ↑
      </button>
      <button
        type="button"
        style={small}
        disabled={i === elements.length - 1}
        onClick={() => move(i, 1)}
        aria-label="Mover para baixo"
      >
        ↓
      </button>
      <button type="button" style={{ ...small, color: "#c0392b" }} onClick={() => remove(i)}>
        Remover
      </button>
    </span>
  );

  const isLeaf = schema.element.kind === "form";

  return (
    <div style={{ display: "grid", gap: 10, fontFamily: font }}>
      <div>
        <strong style={{ fontSize: 14 }}>{schema.label}</strong>
        {schema.description && <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.7 }}>{schema.description}</p>}
      </div>
      {elements.map((el: PreviewProps, i: number) =>
        isLeaf ? (
          <div key={el.key} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <FieldInput props={el} forceValidation={forceValidation} />
            </div>
            {controls(i)}
          </div>
        ) : (
          <details
            key={el.key}
            open={forceValidation || open.has(el.key)}
            onToggle={(e) => toggle(el.key, e.currentTarget.open)}
            style={{ border: "1px solid #d4d4d8", borderRadius: 8, padding: "10px 14px" }}
          >
            <summary style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
              <span style={{ fontWeight: 600 }}>{schema.itemLabel?.(el) || `Item ${i + 1}`}</span>
              {controls(i)}
            </summary>
            <div style={{ marginTop: 16 }}>
              <FieldInput props={el} forceValidation={forceValidation} />
            </div>
          </details>
        ),
      )}
      <div>
        <button type="button" style={small} onClick={add}>
          + Adicionar
        </button>
      </div>
    </div>
  );
}
