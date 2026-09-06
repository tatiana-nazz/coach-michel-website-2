import Link from 'next/link';
import type { SupportedLocale } from '@/i18n/config';
import { websiteCopy } from './content';
import { Arrow, SiteShell } from './site-shell';
import styles from './website.module.css';

export type PublicPageKind = 'home' | 'about' | 'guidance' | 'disclosures' | 'next-steps';
function KineticVisual({ locale }: { locale: SupportedLocale }) {
  const c = websiteCopy[locale];
  return (
    <div className={styles.kinetic} role="img" aria-label={c.visual}>
      <div className={styles.grid} />
      <div className={styles.halo} />
      <div className={styles.orbitOne} />
      <div className={styles.orbitTwo} />
      <div className={styles.orbitThree} />
      <div className={styles.centerMark}>
        M<span>↑</span>
      </div>
      <div className={styles.orbitLabelOne}>
        <span>01</span>
        {c.orbit[0]}
      </div>
      <div className={styles.orbitLabelTwo}>
        <span>02</span>
        {c.orbit[1]}
      </div>
      <div className={styles.orbitLabelThree}>
        <span>03</span>
        {c.orbit[2]}
      </div>
      <div className={styles.visualCaption}>CM / THE CONTINUOUS PURSUIT</div>
    </div>
  );
}
export function PublicPage({ locale, kind }: { locale: SupportedLocale; kind: PublicPageKind }) {
  const c = websiteCopy[locale];
  const path = kind === 'home' ? '/' : `/${kind}`;
  if (kind === 'home')
    return (
      <SiteShell locale={locale} path={path}>
        <main id="main-content">
          <section className={styles.hero} data-screen-id="SCR-PUB-001">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span />
                {c.eyebrow}
              </p>
              <h1>
                {c.title[0]}
                <br />
                <em>{c.title[1]}</em>
              </h1>
              <p className={styles.intro}>{c.intro}</p>
              <div className={styles.heroActions}>
                <Link className={styles.primary} href="/next-steps">
                  {c.primary}
                  <Arrow />
                </Link>
                <Link className={styles.textLink} href="/about">
                  {c.secondary}
                  <Arrow diagonal />
                </Link>
              </div>
              <a className={styles.scrollCue} href="#approach">
                <span>↓</span>
                {c.scroll}
              </a>
            </div>
            <KineticVisual locale={locale} />
          </section>
          <div className={styles.principles}>
            {c.strip.map((text, i) => (
              <div key={text}>
                <span>0{i + 1}</span>
                {text}
              </div>
            ))}
          </div>
          <section className={styles.approach} id="approach">
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>{c.methodEyebrow}</p>
              <div>
                <h2>{c.methodTitle}</h2>
                <p>{c.methodIntro}</p>
              </div>
            </div>
            <div className={styles.stepGrid}>
              {c.steps.map(([number, title, body]) => (
                <article key={number} className={styles.step}>
                  <span className={styles.stepNumber}>{number}</span>
                  <div className={styles.stepArt} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.privateSection}>
            <div>
              <p className={styles.eyebrow}>{c.privateEyebrow}</p>
              <h2>{c.privateTitle}</h2>
              <p>{c.privateBody}</p>
              <ul>
                {c.privatePoints.map((point) => (
                  <li key={point}>
                    <span aria-hidden="true">↗</span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link className={styles.lightButton} href="/access">
                {c.access}
                <Arrow />
              </Link>
            </div>
            <div className={styles.privateVisual} aria-hidden="true">
              <div className={styles.trackLine} />
              <div className={styles.trackLine} />
              <div className={styles.trackLine} />
              <span className={styles.trackPoint} />
              <p>{c.journey}</p>
              <span className={styles.trackM}>M</span>
            </div>
          </section>
          <section className={styles.finalCta}>
            <p className={styles.eyebrow}>COACH MICHEL</p>
            <h2>{c.finalTitle}</h2>
            <p>{c.finalBody}</p>
            <Link className={styles.primary} href="/next-steps">
              {c.primary}
              <Arrow />
            </Link>
          </section>
        </main>
      </SiteShell>
    );
  const content =
    kind === 'about'
      ? [c.aboutEyebrow, c.aboutTitle, c.aboutIntro]
      : kind === 'guidance'
        ? [c.guideEyebrow, c.guideTitle, c.guideIntro]
        : kind === 'disclosures'
          ? [c.disclosuresEyebrow, c.disclosuresTitle, c.disclosuresIntro]
          : [c.nextEyebrow, c.nextTitle, c.nextIntro];
  const sections = kind === 'about' ? c.aboutSections : c.disclosureSections;
  return (
    <SiteShell locale={locale} path={path}>
      <main
        id="main-content"
        className={styles.innerPage}
        data-screen-id={
          {
            about: 'SCR-PUB-002',
            guidance: 'SCR-PUB-003',
            disclosures: 'SCR-PUB-004',
            'next-steps': 'SCR-PUB-005',
          }[kind]
        }
      >
        <header className={styles.pageHeading}>
          <p className={styles.eyebrow}>{content[0]}</p>
          <h1>{content[1]}</h1>
          <p>{content[2]}</p>
        </header>
        {kind === 'guidance' ? (
          <div className={styles.articleGrid}>
            {c.articles.map(([number, title, tag, body]) => (
              <article className={styles.article} key={number}>
                <div className={styles.articleTop}>
                  <span>{number}</span>
                  <p>{tag}</p>
                </div>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
        ) : kind === 'next-steps' ? (
          <div className={styles.choiceGrid}>
            {c.choices.map(([title, body, action], i) => (
              <article className={styles.choice} key={title}>
                <span className={styles.stepNumber}>0{i + 1}</span>
                <h2>{title}</h2>
                <p>{body}</p>
                <Link
                  className={styles.textLink}
                  href={['/access', '/about', '/access/recovery'][i] ?? '/access'}
                >
                  {action}
                  <Arrow />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.editorial}>
            {sections.map(([title, body], i) => (
              <section key={title}>
                <span className={styles.editorialNumber}>0{i + 1}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </div>
              </section>
            ))}
          </div>
        )}
        <div className={styles.pageEnd}>
          <span>{c.footerLine}</span>
          <Link
            className={styles.textLink}
            href={kind === 'next-steps' ? '/guidance' : '/next-steps'}
          >
            {kind === 'next-steps' ? c.nav[1] : c.primary}
            <Arrow />
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
