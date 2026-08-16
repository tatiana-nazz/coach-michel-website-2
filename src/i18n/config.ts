export const supportedLocales = ['en', 'ar'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'en';

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.some((locale) => locale === value);
}
