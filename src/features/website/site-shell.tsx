import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { websiteCopy } from './content';
import styles from './website.module.css';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Brand() {
  return (
    <span className={styles.brand}>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M11 29 19 9l4 11 6-11 1 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M7 33h27" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span>
        COACH<span className={styles.brandName}>MICHEL</span>
      </span>
    </span>
  );
}
export function SiteShell({
  children,
  locale,
  path = '/',
}: {
  children: ReactNode;
  locale: SupportedLocale;
  path?: string;
}) {
  const c = websiteCopy[locale];
  const routes = ['/about', '/guidance', '/next-steps'];
  const languageLink = `/language?locale=${locale === 'en' ? 'ar' : 'en'}&next=${encodeURIComponent(path)}`;
  return (
    <div className={styles.site} dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      <a href="#main-content" className={styles.skip}>
        {locale === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <header className={styles.header}>
        <Link href="/" aria-label={`Coach Michel — ${c.home}`}>
          <Brand />
        </Link>
        <nav className={styles.desktopNav} aria-label={c.menu}>
          {routes.map((href, i) => (
            <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              {c.nav[i]}
            </Link>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.language} href={languageLink} lang={locale === 'en' ? 'ar' : 'en'}>
            {locale === 'en' ? 'العربية' : 'English'}
          </a>
          <Link className={styles.memberButton} href="/access">
            {c.access}
            <Arrow diagonal />
          </Link>
        </div>
        <details className={styles.mobileMenu}>
          <summary aria-label={c.menu}>
            <span />
            <span />
          </summary>
          <nav aria-label={c.menu}>
            {routes.map((href, i) => (
              <Link key={href} href={href}>
                {c.nav[i]}
              </Link>
            ))}
            <Link href="/access">{c.access}</Link>
          </nav>
        </details>
      </header>
      {children}
      <footer className={styles.footer}>
        <div>
          <Link href="/" aria-label={`Coach Michel — ${c.home}`}>
            <Brand />
          </Link>
          <p>{c.footerLine}</p>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/about">{c.nav[0]}</Link>
          <Link href="/guidance">{c.nav[1]}</Link>
          <Link href="/disclosures">{c.privacy}</Link>
          <Link href="/access">{c.access}</Link>
        </div>
        <div className={styles.footerBottom}>
          <span>
            © {new Date().getUTCFullYear()} {c.copyright}
          </span>
          <span>
            {locale === 'ar' ? 'الهدف. الحركة. التقدّم.' : 'INTENT. MOVEMENT. PROGRESSION.'}
          </span>
        </div>
      </footer>
    </div>
  );
}
