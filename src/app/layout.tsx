import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { websiteLocale } from '@/features/website/locale';
import '@/design-system/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Coach Michel — Progress, with purpose.', template: '%s | Coach Michel' },
  description:
    'Purposeful training with Coach Michel. Explore the approach and access your private training workspace.',
  openGraph: {
    title: 'Coach Michel — Progress, with purpose.',
    description: 'A clear plan. A considered approach. Training with intention.',
    type: 'website',
  },
};
export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await websiteLocale();
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
