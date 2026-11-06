export const PRICE_REGEX = /^R\$ \d{1,3}(\.\d{3})*(,\d{2})?$/;

const MAX_CENTS = 99_999_99;

export function priceToCents(price: string): number {
  const match = price.match(/^R\$ ([\d.]+)(?:,(\d{2}))?$/);
  if (!match) return 0;
  return Number(match[1].replaceAll(".", "")) * 100 + Number(match[2] ?? 0);
}

function reais(cents: number) {
  return Math.floor(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Sempre com centavos, para a máscara do campo: "R$ 92,00". */
export function formatPriceInput(cents: number): string {
  return `R$ ${reais(cents)},${String(cents % 100).padStart(2, "0")}`;
}

/** Como vai para o site: sem ",00" quando o valor é redondo. */
export function centsToPrice(cents: number): string {
  return cents % 100 === 0 ? `R$ ${reais(cents)}` : formatPriceInput(cents);
}

/** Máscara de moeda: os dígitos digitados preenchem a partir dos centavos. */
export function maskPrice(typed: string): string {
  const digits = typed.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "";
  return centsToPrice(Math.min(Number(digits), MAX_CENTS));
}
