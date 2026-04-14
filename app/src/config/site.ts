export const siteConfig = {
  name: "Birthday Gacha",
  description: "A birthday gift.",
  url: "https://example.com",
} as const;

export type SiteConfig = typeof siteConfig;
