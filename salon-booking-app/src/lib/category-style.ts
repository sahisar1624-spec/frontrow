export const CATEGORY_COLOR_VARS: Record<string, string> = {
  nails: "var(--color-nails)",
  hair: "var(--color-hair)",
  waxing: "var(--color-waxing)",
  massage: "var(--color-massage)",
  facial: "var(--color-facial)",
};

export function categoryColor(slug: string) {
  return CATEGORY_COLOR_VARS[slug] ?? "var(--color-primary)";
}
