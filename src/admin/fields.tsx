import { fields } from "@keystatic/core";
import { useEffect, useRef } from "react";
import { formatPriceInput, maskPrice, PRICE_REGEX, priceToCents } from "../data/price";
import { MAX_UPLOAD_MB, uploadError } from "../data/uploads";
import type { Home } from "../data/home";
import { CUSTOM_ID, type SiteDraft } from "../data/preview";
import { usePublishCapa, usePublishColor, usePublishHome, usePublishImage, usePublishSite } from "./draft";
import { ObjectFields, previewValue } from "./FormFields";
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

export function liveText(key: "word" | "description" | "cta", label: string, extra: { description?: string; multiline?: boolean }) {
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
