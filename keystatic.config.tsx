import { collection, config, fields, singleton } from "@keystatic/core";
import { capaOrder } from "./src/admin/CapaOrder";
import { capaName, color, customName, homeSection, liveText, photo, price, siteText, siteUrl } from "./src/admin/fields";

const requiredText = (label: string, extra: { description?: string; multiline?: boolean } = {}) =>
  fields.text({ label, ...extra, validation: { isRequired: true } });

const colors = () =>
  fields.object(
    {
      bg: color("bg", "Fundo", "Cor de fundo da hero."),
      blob: color("blob", "Mancha", "Mancha desfocada atrás da capa."),
      accent: color("accent", "Destaque", "Botão, borda da miniatura e enfeites."),
      ink: color("ink", "Texto", "Cor dos textos."),
    },
    { label: "Cores" },
  );

export default config({
  storage: import.meta.env.PROD
    ? { kind: "github", repo: "christopher-alves-dev/ristau-landing-page" }
    : { kind: "local" },
  ui: {
    brand: { name: "Ristau" },
    navigation: { Catálogo: ["capas", "carrossel", "personalizada"], Página: ["home", "site"] },
  },
  collections: {
    capas: collection({
      label: "Capas",
      path: "src/content/capas/*/",
      format: { data: "yaml" },
      slugField: "name",
      columns: ["name", "price"],
      schema: {
        name: capaName(),
        word: liveText("word", "Palavra de fundo", { description: "Palavra grande que aparece atrás da capa." }),
        description: liveText("description", "Descrição", { multiline: true }),
        price: price(),
        image: photo("Foto"),
        colors: colors(),
      },
    }),
  },
  singletons: {
    carrossel: singleton({
      label: "Ordem do carrossel",
      path: "src/content/carrossel",
      format: { data: "yaml" },
      schema: { capas: capaOrder() },
    }),
    personalizada: singleton({
      label: "Capa personalizada",
      path: "src/content/personalizada/",
      format: { data: "yaml" },
      schema: {
        name: customName(),
        word: liveText("word", "Palavra de fundo", { description: "Palavra grande que aparece atrás da capa." }),
        description: liveText("description", "Descrição", { multiline: true }),
        cta: liveText("cta", "Texto do botão", {}),
        ctaMessage: requiredText("Mensagem enviada no WhatsApp", { multiline: true }),
        image: photo("Foto", "./"),
        colors: colors(),
      },
    }),
    site: singleton({
      label: "Informações do site",
      path: "src/content/site",
      format: { data: "yaml" },
      schema: {
        brand: siteText("brand", "Nome da marca", {}, true),
        slogan: siteText("slogan", "Slogan", { description: "Aparece acima do nome da capa na hero." }),
        whatsapp: siteText("whatsapp", "WhatsApp", {
          description: "Só números, com DDI e DDD. Ex.: 5511999999999",
          pattern: { regex: /^\d{12,13}$/, message: "Use só números, com 55 e o DDD" },
        }),
        instagram: siteUrl("instagram", "Instagram"),
        tiktok: siteUrl("tiktok", "TikTok", false),
        seoTitle: requiredText("Título da aba / Google"),
        seoDescription: requiredText("Descrição para o Google", { multiline: true }),
        footerText: siteText("footerText", "Frase do rodapé"),
      },
    }),
    home: singleton({
      label: "Seções da página",
      path: "src/content/home",
      format: { data: "yaml" },
      schema: {
        features: homeSection(
          "features",
          fields.object(
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
          true,
        ),
        steps: homeSection(
          "steps",
          fields.object(
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
        ),
        testimonials: homeSection(
          "testimonials",
          fields.object(
            {
              eyebrow: requiredText("Chamada"),
              title: requiredText("Título"),
              text: fields.text({ label: "Texto", multiline: true }),
              items: fields.array(
                fields.object({
                  text: requiredText("Depoimento", { multiline: true }),
                  photo: fields.image({
                    label: "Foto (opcional)",
                    description: "Recorte só a capa: sem nomes, telefones ou rostos.",
                    directory: "src/assets/depoimentos",
                    publicPath: "../assets/depoimentos/",
                  }),
                }),
                { label: "Depoimentos", itemLabel: (props) => props.fields.text.value.slice(0, 60) },
              ),
            },
            { label: "Depoimentos" },
          ),
        ),
        faq: homeSection(
          "faq",
          fields.object(
            {
              eyebrow: requiredText("Chamada"),
              title: requiredText("Título"),
              items: fields.array(
                fields.object({
                  question: requiredText("Pergunta"),
                  answer: requiredText("Resposta", { multiline: true }),
                }),
                { label: "Perguntas", itemLabel: (props) => props.fields.question.value },
              ),
            },
            { label: "Perguntas frequentes" },
          ),
        ),
      },
    }),
  },
});
