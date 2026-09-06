import { cookies } from 'next/headers';
import type { SupportedLocale } from '@/i18n/config';

export async function websiteLocale(): Promise<SupportedLocale> {
  return (await cookies()).get('cmh-locale')?.value === 'ar' ? 'ar' : 'en';
}
