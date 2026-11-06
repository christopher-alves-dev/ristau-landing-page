import { useEffect, useRef, useState } from "react";
import type { Home } from "../../data/home";
import {
  changedSection,
  PREVIEW_MESSAGE,
  PREVIEW_READY,
  previewHome,
  previewProducts,
  previewSite,
  type Draft,
} from "../../data/preview";
import type { Product } from "../../data/products";
import type { Site } from "../../data/site";
import HeroSlider from "../hero/HeroSlider";
import HomeSections from "../HomeSections";

type Props = { products: Product[]; site: Site; home: Home };

export default function PagePreview({ products, site, home }: Props) {
  const [draft, setDraft] = useState<Draft>({});
  const last = useRef<Draft | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== PREVIEW_MESSAGE) return;
      const next: Draft = e.data.draft;
      const section = changedSection(last.current, next);
      last.current = next;
      setDraft(next);
      if (section) {
        // scrollTo em vez de scrollIntoView, que rolaria também a caixa da prévia no painel.
        requestAnimationFrame(() => {
          const target = document.getElementById(section);
          const top = section === "topo" || !target ? 0 : target.getBoundingClientRect().top + scrollY;
          scrollTo({ top, behavior: "smooth" });
        });
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const liveSite = previewSite(draft.site, site);
  return (
    <>
      <HeroSlider products={draft.capa ? previewProducts(draft.capa, products) : products} site={liveSite} />
      <HomeSections {...previewHome(draft.home, home)} site={liveSite} />
    </>
  );
}
