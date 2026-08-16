import type { SupportedLocale } from './config';

export type TextDirection = 'ltr' | 'rtl';

export function directionForLocale(locale: SupportedLocale): TextDirection {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
