import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/design-system/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Implementation scaffold',
  description: 'Non-product scaffold for governed implementation work.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
