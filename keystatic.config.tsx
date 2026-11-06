import { collection, config, fields, singleton } from "@keystatic/core";
import { MAX_UPLOAD_MB, uploadError } from "./src/data/uploads";

function photo(label: string) {
  const base = fields.image({
    label,
    publicPath: "../",
    validation: { isRequired: true },
    description: `PNG ou WebP com fundo transparente, até ${MAX_UPLOAD_MB} MB. O site gera as versões otimizadas sozinho.`,
  });
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
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

const HEX = { regex: /^#[0-9a-fA-F]{6}$/, message: "Use o formato #rrggbb, por exemplo #f3e0ce" };
const color = (label: string, description: string) =>
  fields.text({ label, description, validation: { isRequired: true, pattern: HEX } });
const requiredText = (label: string, extra: { description?: string; multiline?: boolean } = {}) =>
  fields.text({ label, ...extra, validation: { isRequired: true } });

export default config({
  storage: import.meta.env.PROD
    ? { kind: "github", repo: "christopher-alves-dev/ristau-landing-page" }
    : { kind: "local" },
  ui: {
    brand: { name: "Ristau" },
    navigation: { Catálogo: ["capas"], Página: ["home", "site"] },
  },
  collections: {
    capas: collection({
      label: "Capas",
      path: "src/content/capas/*/",
      format: { data: "yaml" },
      slugField: "name",
      columns: ["name", "order", "price"],
      schema: {
        name: fields.slug({ name: { label: "Nome", validation: { isRequired: true } } }),
        order: fields.integer({
          label: "Posição no carrossel",
          description: "A menor aparece primeiro.",
          validation: { isRequired: true, min: 1 },
        }),
        word: requiredText("Palavra de fundo", { description: "Palavra grande que aparece atrás da capa." }),
        description: requiredText("Descrição", { multiline: true }),
        price: fields.text({
          label: "Preço",
          validation: { isRequired: true, pattern: { regex: /^R\$ \d+(,\d{2})?$/, message: "Use o formato R$ 89 ou R$ 89,90" } },
        }),
        image: photo("Foto"),
        colors: fields.object(
          {
            bg: color("Fundo", "Cor de fundo da hero."),
            blob: color("Mancha", "Mancha desfocada atrás da capa."),
            accent: color("Destaque", "Botão, borda da miniatura e enfeites."),
            ink: color("Texto", "Cor dos textos."),
          },
          { label: "Cores" },
        ),
      },
    }),
  },
  singletons: {
    site: singleton({
      label: "Informações do site",
      path: "src/content/site",
      format: { data: "yaml" },
      schema: {
        brand: requiredText("Nome da marca"),
        slogan: requiredText("Slogan", { description: "Aparece acima do nome da capa na hero." }),
        whatsapp: fields.text({
          label: "WhatsApp",
          description: "Só números, com DDI e DDD. Ex.: 5511999999999",
          validation: { isRequired: true, pattern: { regex: /^\d{12,13}$/, message: "Use só números, com 55 e o DDD" } },
        }),
        instagram: fields.url({ label: "Instagram", validation: { isRequired: true } }),
        seoTitle: requiredText("Título da aba / Google"),
        seoDescription: requiredText("Descrição para o Google", { multiline: true }),
        footerText: requiredText("Frase do rodapé"),
      },
    }),
    home: singleton({
      label: "Seções da página",
      path: "src/content/home",
      format: { data: "yaml" },
      schema: {
        features: fields.object(
          {
            eyebrow: requiredText("Chamada"),
            title: requiredText("Título"),
            cards: fields.array(
              fields.object({
                title: requiredText("Título"),
                subtitle: fields.text({ label: "Subtítulo" }),
                text: fields.text({ label: "Texto", multiline: true }),
                items: fields.array(fields.text({ label: "Item" }), {
                  label: "Lista",
                  itemLabel: (props) => props.value,
                }),
              }),
              { label: "Cards", itemLabel: (props) => props.fields.title.value },
            ),
          },
          { label: "Feito à mão" },
        ),
        steps: fields.object(
          {
            eyebrow: requiredText("Chamada"),
            title: requiredText("Título"),
            items: fields.array(
              fields.object({ title: requiredText("Título"), text: requiredText("Texto", { multiline: true }) }),
              { label: "Passos", itemLabel: (props) => props.fields.title.value },
            ),
            cta: requiredText("Texto do botão"),
            ctaMessage: requiredText("Mensagem enviada no WhatsApp", { multiline: true }),
          },
          { label: "Como encomendar" },
        ),
      },
    }),
  },
});
