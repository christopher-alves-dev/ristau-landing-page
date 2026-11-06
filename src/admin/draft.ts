import { useEffect, useState, useSyncExternalStore } from "react";
import type { Home } from "../data/home";
import type { CapaDraft, Draft, SiteDraft } from "../data/preview";

// O Keystatic não expõe o formulário inteiro para um campo, então cada campo
// publica o próprio valor aqui e a prévia lê o conjunto.
let draft: Draft = {};
const listeners = new Set<() => void>();

function update(patch: (d: Draft) => Draft) {
  draft = patch(draft);
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getDraft = () => draft;
export const resetDraft = () => update(() => ({}));
export const useDraft = () => useSyncExternalStore(subscribe, getDraft, getDraft);

type CapaText = "slug" | "name" | "word" | "description" | "price";

export function usePublishCapa(key: CapaText, value: string) {
  useEffect(() => update((d) => ({ ...d, capa: { ...d.capa, [key]: value } })), [key, value]);
}

export function usePublishColor(key: keyof NonNullable<CapaDraft["colors"]>, value: string) {
  useEffect(
    () => update((d) => ({ ...d, capa: { ...d.capa, colors: { ...d.capa?.colors, [key]: value } } })),
    [key, value],
  );
}

type Upload = { data: Uint8Array; extension: string } | null;

export function usePublishImage(value: Upload) {
  const [url, setUrl] = useState<string | null>(null);
  const data = value?.data;
  const extension = value?.extension;

  useEffect(() => {
    if (!data) return setUrl(null);
    const type = extension === "svg" ? "image/svg+xml" : `image/${extension}`;
    const next = URL.createObjectURL(new Blob([data as BlobPart], { type }));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [data, extension]);

  useEffect(() => update((d) => ({ ...d, capa: { ...d.capa, image: url } })), [url]);
}

export function usePublishSite(key: keyof SiteDraft, value: string) {
  useEffect(() => update((d) => ({ ...d, site: { ...d.site, [key]: value } })), [key, value]);
}

export function usePublishHome<K extends keyof Home>(key: K, value: Home[K]) {
  const json = JSON.stringify(value);
  useEffect(() => update((d) => ({ ...d, home: { ...d.home, [key]: JSON.parse(json) } })), [key, json]);
}
