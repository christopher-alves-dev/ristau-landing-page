import type { Home } from "../data/home";
import { whatsappLink, type Site } from "../data/site";

type Props = Home & { site: Site };

export default function HomeSections({ features, steps, site }: Props) {
  return (
    <>
      <main>
        <section id="feito-a-mao" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <p className="text-terracotta text-sm font-semibold tracking-[0.2em] uppercase">{features.eyebrow}</p>
          <h2 className="font-display mt-3 max-w-2xl text-4xl leading-tight font-black md:text-6xl">{features.title}</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.cards.map((f, i) => (
              <article key={i} className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_-20px_rgb(43_29_23/0.25)]">
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
