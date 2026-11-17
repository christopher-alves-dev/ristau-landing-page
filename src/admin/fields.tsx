import { fields } from "@keystatic/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPriceInput, maskPrice, PRICE_REGEX, priceToCents } from "../data/price";
import { MAX_UPLOAD_MB, uploadError } from "../data/uploads";
import type { Home } from "../data/home";
import { CUSTOM_ID, type SiteDraft } from "../data/preview";
import { useDraft, usePublishCapa, usePublishColor, usePublishHome, usePublishImage, usePublishSite } from "./draft";
import { ObjectFields, previewValue } from "./FormFields";
import { suggestPalette } from "./palette";
import PreviewPanel from "./PreviewPanel";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Nome da capa. Também abre a prévia ao vivo, já que todo formulário de capa tem esse campo. */
export function capaName() {
  const base = fields.slug({ name: { label: "Nome", validation: { isRequired: true } } });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      const slug = useRef(props.value.slug).current;
      usePublishCapa("slug", slug);
      usePublishCapa("name", props.value.name);
      return (
        <>
          <base.Input {...props} />
          <PreviewPanel />
        </>
      );
    },
  };
}

export function customName() {
  const base = fields.text({ label: "Nome", validation: { isRequired: true } });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishCapa("slug", CUSTOM_ID);
      usePublishCapa("name", props.value);
      return (
        <>
          <base.Input {...props} />
          <PreviewPanel />
        </>
      );
    },
  };
}

export function liveText(key: "description" | "cta", label: string, extra: { description?: string; multiline?: boolean }) {
  const base = fields.text({ label, ...extra, validation: { isRequired: true } });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishCapa(key, props.value);
      return <base.Input {...props} />;
    },
  };
}

export function price() {
  const base = fields.text({
    label: "Preço",
    description: "Digite só os números: 9290 vira R$ 92,90. Valores redondos aparecem no site sem os centavos.",
    validation: { isRequired: true, pattern: { regex: PRICE_REGEX, message: "Use o formato R$ 89 ou R$ 89,90" } },
  });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishCapa("price", props.value);
      const wrapper = useRef<HTMLDivElement>(null);
      useEffect(() => {
        const input = wrapper.current?.querySelector("input");
        if (input) input.inputMode = "numeric";
      }, []);
      const shown = props.value ? formatPriceInput(priceToCents(props.value)) : "";
      return (
        <div ref={wrapper}>
          <base.Input {...props} value={shown} onChange={(typed) => props.onChange(maskPrice(typed))} />
        </div>
      );
    },
  };
}

export function color(key: "bg" | "blob" | "accent" | "ink", label: string, description: string) {
  const base = fields.text({
    label,
    description,
    validation: { isRequired: true, pattern: { regex: HEX, message: "Use o formato #rrggbb, por exemplo #f3e0ce" } },
  });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishColor(key, props.value);
      return (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <input
            type="color"
            aria-label={`Escolher a cor: ${label}`}
            value={HEX.test(props.value) ? props.value.toLowerCase() : "#000000"}
            onChange={(e) => props.onChange(e.target.value)}
            style={{ width: 48, height: 32, padding: 0, border: "1px solid #d4d4d8", borderRadius: 6, cursor: "pointer" }}
          />
          <div style={{ flex: 1 }}>
            <base.Input {...props} />
          </div>
        </div>
      );
    },
  };
}

export function photo(label: string, publicPath = "../") {
  const base = fields.image({
    label,
    publicPath,
    validation: { isRequired: true },
    description: `PNG ou WebP com fundo transparente, até ${MAX_UPLOAD_MB} MB. O site gera as versões otimizadas sozinho.`,
  });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishImage(props.value);
      const error = uploadError(props.value);
      return (
        <>
          <base.Input {...props} />
          {error && (
            <p role="alert" style={{ color: "#c0392b", fontFamily: "system-ui, sans-serif", fontSize: 14, marginTop: 8 }}>
              {error}
            </p>
          )}
        </>
      );
    },
    validate(value: Parameters<typeof base.validate>[0]) {
      const error = uploadError(value);
      if (error) throw new Error(error);
      return base.validate(value);
    },
  };
}

type TextOptions = { description?: string; multiline?: boolean };

/** Campo de "Informações do site" que aparece na prévia. O primeiro deles abre o painel. */
export function siteText(key: keyof SiteDraft, label: string, extra: TextOptions & { pattern?: { regex: RegExp; message: string } } = {}, panel = false) {
  const { pattern, ...options } = extra;
  const base = fields.text({ label, ...options, validation: { isRequired: true, pattern } });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishSite(key, props.value);
      return (
        <>
          <base.Input {...props} />
          {panel && <PreviewPanel />}
        </>
      );
    },
  };
}

export function siteUrl(key: keyof SiteDraft, label: string, isRequired = true) {
  const base = fields.url({
    label,
    validation: { isRequired },
    description: isRequired ? undefined : "Opcional. Deixe vazio para esconder o link no site.",
  });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      usePublishSite(key, props.value ?? "");
      return <base.Input {...props} />;
    },
  };
}

const COLOR_KEYS = ["bg", "blob", "accent", "ink"] as const;

/** Grupo de cores da capa, com sugestão automática a partir da foto enviada. */
export function capaColors<F extends { kind: "object" }>(field: F) {
  return {
    ...field,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Input(props: any) {
      const image = useDraft().capa?.image ?? null;
      const [status, setStatus] = useState<{ busy?: boolean; error?: string }>({});
      const fieldsRef = useRef(props.fields);
      fieldsRef.current = props.fields;

      const suggest = useCallback(async (url: string) => {
        setStatus({ busy: true });
        try {
          const palette = await suggestPalette(url);
          COLOR_KEYS.forEach((key) => fieldsRef.current[key].onChange(palette[key]));
          setStatus({});
        } catch (e) {
          setStatus({ error: e instanceof Error ? e.message : "Não foi possível sugerir as cores" });
        }
      }, []);

      const allEmpty = COLOR_KEYS.every((key) => !props.fields[key].value);
      useEffect(() => {
        if (image && allEmpty) suggest(image);
        // Só ao trocar a foto; preencher as cores não deve disparar de novo.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [image]);

      return (
        <div style={{ display: "grid", gap: 16 }}>
          <ObjectFields props={props} forceValidation={props.forceValidation} heading />
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
            <button
              type="button"
              disabled={!image || status.busy}
              onClick={() => image && suggest(image)}
              style={{
                font: "600 13px system-ui, sans-serif",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d4d4d8",
                background: "transparent",
                color: "inherit",
                opacity: image ? 1 : 0.5,
                cursor: image ? "pointer" : "not-allowed",
              }}
            >
              {status.busy ? "Analisando a foto…" : "Sugerir cores pela foto"}
            </button>
            {!image && <span style={{ opacity: 0.7 }}>Envie a foto primeiro.</span>}
            {status.error && (
              <span role="alert" style={{ color: "#c0392b" }}>
                {status.error}
              </span>
            )}
          </div>
        </div>
      );
    },
  };
}

/** Seção da página: desenha os campos e publica o valor inteiro para a prévia. */
export function homeSection<K extends keyof Home, F extends { kind: "object" }>(key: K, field: F, panel = false) {
  return {
    ...field,
    Input(props: { forceValidation: boolean }) {
      usePublishHome(key, previewValue(props) as Home[K]);
      return (
        <>
          <ObjectFields props={props} forceValidation={props.forceValidation} heading />
          {panel && <PreviewPanel />}
        </>
      );
    },
  };
}
