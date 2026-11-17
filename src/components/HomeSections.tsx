import type { Home } from "../data/home";
import type { Product } from "../data/products";
import { readableButton } from "../data/color";
import { whatsappLink, type Site } from "../data/site";

type Props = Home & { site: Site; products?: Product[] };

const eyebrowClass = "text-terracotta text-sm font-semibold tracking-[0.2em] uppercase";
const titleClass = "font-display mt-3 max-w-2xl text-4xl leading-tight font-black md:text-6xl";
const cardShadow = "shadow-[0_10px_40px_-20px_rgb(43_29_23/0.25)]";

export default function HomeSections({ features, steps, testimonials, faq, site, products = [] }: Props) {
  const catalog = products.filter((p) => p.price);
  return (
    <>
      <main>
        <section id="feito-a-mao" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className={eyebrowClass}>{features.eyebrow}</p>
          <h2 className={titleClass}>{features.title}</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.cards.map((f, i) => (
              <article key={i} className={`rounded-3xl bg-white p-8 ${cardShadow}`}>
                <h3 className="font-display text-2xl font-bold">{f.title}</h3>
                {f.subtitle && <p className="mt-3 opacity-75">{f.subtitle}</p>}
                {f.text && <p className="mt-3 leading-relaxed opacity-75">{f.text}</p>}
                {f.items.length > 0 && (
                  <ul className="mt-3 space-y-2 leading-relaxed opacity-75">
                    {f.items.map((item, j) => (
                      <li key={j} className="before:text-terracotta flex gap-2 before:content-['•']">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="como-encomendar" className="bg-ink text-cream">
          <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
            <p className="text-sm font-semibold tracking-[0.2em] text-[#f4a3b8] uppercase">{steps.eyebrow}</p>
            <h2 className="font-display mt-3 text-4xl font-black md:text-6xl">{steps.title}</h2>
            <ol className="mt-14 grid gap-10 md:grid-cols-3">
              {steps.items.map((s, i) => (
                <li key={i} className="border-t border-white/20 pt-6">
                  <span className="font-display text-5xl font-black text-[#f4a3b8]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed opacity-70">{s.text}</p>
                </li>
              ))}
            </ol>
            <a
              href={whatsappLink(site.whatsapp, steps.ctaMessage)}
              target="_blank"
              rel="noreferrer"
              className="bg-terracotta mt-16 inline-block rounded-full px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
            >
              {steps.cta}
            </a>
          </div>
        </section>

        <section id="depoimentos" aria-labelledby="depoimentos-titulo" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className={eyebrowClass}>{testimonials.eyebrow}</p>
          <h2 id="depoimentos-titulo" className={titleClass}>{testimonials.title}</h2>
          {testimonials.text && <p className="mt-5 max-w-2xl text-lg leading-relaxed opacity-75">{testimonials.text}</p>}
          <ul
            id="depoimentos-lista"
            data-carousel
            tabIndex={0}
            aria-label="Depoimentos de clientes"
            className="-mx-6 mt-14 flex snap-x snap-mandatory scroll-px-6 items-start gap-6 sm:items-stretch overflow-x-auto overscroll-x-contain scroll-smooth px-6 pt-2 pb-10 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.items.map((t, i) => (
              <li
                key={i}
                aria-label={`${i + 1} de ${testimonials.items.length}`}
                className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <figure className={`flex flex-col overflow-hidden rounded-3xl bg-white sm:h-full ${cardShadow}`}>
                  {t.photo && (
                    <img src={t.photo} alt="Capa da Ristau na foto enviada pela cliente" loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
                  )}
                  <blockquote
                    className={
                      t.photo ? "p-6 leading-relaxed" : "font-display flex flex-1 items-center p-8 text-2xl leading-snug font-bold"
                    }
                  >
                    “{t.text}”
                  </blockquote>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-end gap-3">
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                data-carousel-button={dir}
                aria-controls="depoimentos-lista"
                aria-label={dir === "prev" ? "Depoimento anterior" : "Próximo depoimento"}
                className="grid size-12 cursor-pointer place-items-center rounded-full border-2 border-current transition-colors hover:bg-white/50 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent md:size-14"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={dir === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
                </svg>
              </button>
            ))}
          </div>
        </section>

        <section id="duvidas" aria-labelledby="duvidas-titulo" className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-24 md:px-10 md:py-32">
            <p className={eyebrowClass}>{faq.eyebrow}</p>
            <h2 id="duvidas-titulo" className={titleClass}>{faq.title}</h2>
            <div className="mt-12 divide-y divide-ink/15 border-y border-ink/15">
              {faq.items.map((item, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-bold [&::-webkit-details-marker]:hidden">
                    <h3>{item.question}</h3>
                    <span aria-hidden className="text-terracotta text-2xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed opacity-75">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {catalog.length > 0 && (
          <section id="capas" aria-labelledby="capas-titulo" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
            <p className={eyebrowClass}>Catálogo</p>
            <h2 id="capas-titulo" className={titleClass}>Todas as capas</h2>
            <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {catalog.map((p) => (
                <li key={p.id}>
                  <article className={`flex h-full flex-col rounded-3xl bg-white p-3 md:p-5 ${cardShadow}`}>
                    <div className="grid aspect-[4/5] place-items-center rounded-2xl p-3 md:p-5" style={{ backgroundColor: p.colors.bg }}>
                      <img
                        src={p.card ?? p.image}
                        alt={`Capa de Kindle em crochê ${p.name}`}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                    <h3 className="font-display mt-4 text-lg leading-tight font-bold md:text-xl">{p.name}</h3>
                    <div className="mt-2 flex-1">
                      <p className="line-clamp-3 text-sm leading-relaxed opacity-75">{p.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <span className="text-xs leading-tight whitespace-nowrap opacity-80">
                        a partir de
                        <strong className="block text-lg">{p.price}</strong>
                      </span>
                      <a
                        href={whatsappLink(site.whatsapp, `Olá! Quero encomendar a capa ${p.name} para o meu Kindle.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-transform hover:scale-105"
                        style={readableButton(p.colors.accent)}
                      >
                        Quero essa<span className="sr-only">: capa {p.name}</span>
                      </a>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer
        id="rodape"
        className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm md:flex-row md:px-10"
      >
        <img src={site.logo} alt={site.brand} width={94} height={80} className="h-20 w-auto" />
        <div className="flex flex-col items-center gap-1 text-center md:items-end md:text-right">
          <nav aria-label="Redes sociais" className="mb-2 flex gap-5 font-semibold">
            <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:opacity-70">
              Instagram
            </a>
            {site.tiktok && (
              <a href={site.tiktok} target="_blank" rel="noreferrer" className="hover:opacity-70">
                TikTok
              </a>
            )}
          </nav>
          <span className="opacity-70">{site.footerText}</span>
          <small className="opacity-70">
            © {new Date().getFullYear()} {site.brand}. Todos os direitos reservados.
          </small>
        </div>
      </footer>
    </>
  );
}
