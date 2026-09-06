import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { textValue, type CoachDataset, type CoachItem } from './types';
import s from './coach.module.css';

export const t = (locale: SupportedLocale, en: string, ar: string) => (locale === 'ar' ? ar : en);
const states: Record<string, readonly [string, string]> = {
  ACTIVE: ['Active', 'نشط'],
  DRAFT: ['Draft', 'مسودة'],
  PUBLISHED: ['Published', 'منشور'],
  RELEASED: ['Released', 'تم الإصدار'],
  COMPLETED: ['Completed', 'مكتمل'],
  VOIDED: ['Voided', 'ملغى'],
  OPEN: ['Open', 'مفتوح'],
  APPROVED: ['Approved', 'تمت الموافقة'],
  DENIED: ['Denied', 'مرفوض'],
  IN_REVIEW: ['In review', 'قيد المراجعة'],
  ESCALATED: ['Escalated', 'تم التصعيد'],
  RESOLVED: ['Resolved', 'تم الحل'],
  ARCHIVED: ['Archived', 'مؤرشف'],
  PENDING: ['Pending', 'قيد الانتظار'],
  REVOKED: ['Revoked', 'ملغى'],
};
export function Status({ status, locale }: { status: string; locale: SupportedLocale }) {
  const translated = states[status.toUpperCase()];
  return (
    <span className={s.status} data-state={status.toUpperCase()}>
      {translated
        ? translated[locale === 'ar' ? 1 : 0]
        : status || t(locale, 'Unspecified', 'غير محدد')}
    </span>
  );
}
export function Panel({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={s.panel}>
      {eyebrow && <span className={s.eyebrow}>{eyebrow}</span>}
      <div className={s.heading}>
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Empty({
  locale,
  error = false,
  title,
  children,
}: {
  locale: SupportedLocale;
  error?: boolean;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.empty} role={error ? 'alert' : undefined}>
      <h3>
        {title ||
          (error
            ? t(locale, 'Unable to load these records', 'تعذر تحميل هذه السجلات')
            : t(locale, 'A clear place to begin', 'بداية واضحة'))}
      </h3>
      <p>
        {children ||
          (error
            ? t(
                locale,
                'The data service did not return a confirmed response. Try refreshing the page.',
                'لم تُرجع خدمة البيانات استجابة مؤكدة. حاول تحديث الصفحة.',
              )
            : t(
                locale,
                'There are no records available in your current scope yet.',
                'لا توجد سجلات متاحة ضمن نطاق وصولك الحالي بعد.',
              ))}
      </p>
      {error && (
        <a className={s.link} href="">
          {t(locale, 'Refresh page', 'تحديث الصفحة')}
        </a>
      )}
    </div>
  );
}
export function dateText(date: string, locale: SupportedLocale) {
  if (!date || !Number.isFinite(Date.parse(date))) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(date),
  );
}
export function Item({
  item,
  locale,
  href,
  children,
  avatar = false,
}: {
  item: CoachItem;
  locale: SupportedLocale;
  href?: string;
  children?: ReactNode;
  avatar?: boolean;
}) {
  return (
    <article className={s.item}>
      {avatar && (
        <span className={s.avatar} aria-hidden="true">
          {Array.from(item.title).slice(0, 2).join('')}
        </span>
      )}
      <div>
        <h3>
          {href ? (
            <Link className={s.link} href={href}>
              {item.title}
              <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
            </Link>
          ) : (
            item.title
          )}
        </h3>
        {item.description && <p>{item.description}</p>}
        <div className={s.meta}>
          <Status status={item.status} locale={locale} />
          {item.version > 0 && (
            <span>
              {t(locale, 'Version', 'النسخة')} {item.version}
            </span>
          )}
          {item.date && <time dateTime={item.date}>{dateText(item.date, locale)}</time>}
        </div>
        {children}
      </div>
    </article>
  );
}
export function Records({
  data,
  locale,
  href,
  avatar = false,
  children,
}: {
  data: CoachDataset;
  locale: SupportedLocale;
  href?: (item: CoachItem) => string;
  avatar?: boolean;
  children?: (item: CoachItem) => ReactNode;
}) {
  if (data.error || !data.items.length) return <Empty locale={locale} error={data.error} />;
  return (
    <>
      <div className={s.list}>
        {data.items.map((item) => (
          <Item
            key={item.ref}
            item={item}
            locale={locale}
            {...(href ? { href: href(item) } : {})}
            avatar={avatar}
          >
            {children?.(item)}
          </Item>
        ))}
      </div>
      <p className={s.scope}>
        {data.total !== null && data.total > data.items.length
          ? t(
              locale,
              `Showing ${data.items.length} of ${data.total} available records.`,
              `عرض ${data.items.length} من ${data.total} سجلاً متاحاً.`,
            )
          : t(
              locale,
              'Records available within your current access.',
              'السجلات المتاحة ضمن صلاحياتك الحالية.',
            )}
      </p>
    </>
  );
}
export function TextContent({ value }: { value: unknown }) {
  if (Array.isArray(value))
    return (
      <div>
        {value
          .filter((line) => typeof line === 'string')
          .map((line, index) => (
            <p key={index}>{line}</p>
          ))}
      </div>
    );
  return (
    <div>
      {textValue(value)
        .split('\n')
        .filter(Boolean)
        .map((line, index) => (
          <p key={index}>{line}</p>
        ))}
    </div>
  );
}
