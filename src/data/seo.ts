import type { Home } from "./home";
import { priceToCents } from "./price";
import type { Product } from "./products";
import type { Site } from "./site";

export const MAKER = "Susan Ristau";
export const LOCATION = { city: "Palhoça", region: "SC", country: "BR" };

const decimal = (price: string) => (priceToCents(price) / 100).toFixed(2);

export function structuredData({ site, products, home, url }: { site: Site; products: Product[]; home: Home; url: URL }) {
  const abs = (path: string) => new URL(path, url).href;
  const org = { "@id": abs("/#organization") };
  const catalog = products.filter((p) => p.price);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        ...org,
        name: site.brand,
        url: url.href,
        logo: abs(site.logo),
        slogan: site.slogan,
        description: "Capas de Kindle feitas à mão em crochê, sob medida para qualquer modelo.",
        founder: { "@type": "Person", name: MAKER },
        address: {
          "@type": "PostalAddress",
          addressLocality: LOCATION.city,
          addressRegion: LOCATION.region,
          addressCountry: LOCATION.country,
        },
        areaServed: { "@type": "Country", name: "Brasil" },
        contactPoint: { "@type": "ContactPoint", telephone: `+${site.whatsapp}`, contactType: "sales", availableLanguage: "pt-BR" },
        sameAs: [site.instagram, site.tiktok].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": abs("/#website"),
        url: url.href,
        name: site.brand,
        inLanguage: "pt-BR",
        publisher: org,
      },
      {
        "@type": "ItemList",
        name: "Capas de Kindle em crochê",
        itemListElement: catalog.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: `Capa de Kindle em crochê ${p.name}`,
            description: p.description,
            image: abs(p.image),
            brand: { "@type": "Brand", name: site.brand },
            material: "Fio de malha",
            offers: {
              "@type": "Offer",
              price: decimal(p.price!),
              priceCurrency: "BRL",
              availability: "https://schema.org/MadeToOrder",
              url: url.href,
              seller: org,
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: home.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}

export function llmsText({ site, products, home, url }: { site: Site; products: Product[]; home: Home; url: URL }) {
  const catalog = products
    .filter((p) => p.price)
    .map((p) => `- ${p.name} (a partir de ${p.price}): ${p.description.trim()}`)
    .join("\n");
  const faq = home.faq.items.map((i) => `### ${i.question}\n\n${i.answer.trim()}`).join("\n\n");
  const links = [
    `- Site: ${url.href}`,
    `- Encomendas pelo WhatsApp: https://wa.me/${site.whatsapp}`,
    `- Instagram: ${site.instagram}`,
    site.tiktok && `- TikTok: ${site.tiktok}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `# ${site.brand}

> Capas de Kindle feitas à mão em crochê por ${MAKER}, em ${LOCATION.city} (${LOCATION.region}). Sob medida para qualquer modelo de Kindle, com cartela de mais de 70 cores e itens adicionais. Encomendas pelo WhatsApp.

## Contato

${links}

## Capas

${catalog}

## Perguntas frequentes

${faq}
`;
}
