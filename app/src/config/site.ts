export const siteConfig = {
  name: "С днём рождения, Дарина!",
  description: "Подарок на день рождения.",
  url: "https://example.com",
} as const;

export type SiteConfig = typeof siteConfig;
