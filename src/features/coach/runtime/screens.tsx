import Link from 'next/link';
import { requireWorkspaceAccess } from '@/features/workspace/access';
import { WorkspaceShell } from '@/features/workspace/workspace-shell';
import { websiteLocale } from '@/features/website/locale';
import { coachPermissions } from './permissions';
import type { SupportedLocale } from '@/i18n/config';
import { loadCoachData } from './data';
import {
  ConfigurationDraftForm,
  CorrectionForm,
  DecisionForm,
  DraftForm,
  GrantForm,
  ReleaseForm,
  SupportUpdateForm,
} from './forms';
import {
  collection,
  row,
  textValue,
  type CoachData,
  type CoachSection,
  type CoachDataset,
} from './types';
import { Empty, Item, Panel, Records, Status, TextContent, t } from './ui';
import s from './coach.module.css';

const sections: Record<
  CoachSection,
  { en: string; ar: string; path: string; descriptionEn: string; descriptionAr: string }
> = {
  overview: {
    en: 'Your coaching studio',
    ar: 'مساحة التدريب الخاصة بك',
    path: '/coach',
    descriptionEn: 'A considered view of your people, plans and next steps.',
    descriptionAr: 'نظرة واضحة على المتدربين والخطط والخطوات القادمة.',
  },
  trainees: {
    en: 'People, with a plan',
    ar: 'لكل متدرب خطة',
    path: '/coach/trainees',
    descriptionEn: 'Open a trainee’s context to review their assignments and recorded progress.',
    descriptionAr: 'افتح ملف المتدرب لمراجعة تكليفاته والتقدم المسجل.',
  },
  trainee: {
    en: 'Trainee context',
    ar: 'ملف المتدرب',
    path: '/coach/trainees',
    descriptionEn: 'Assignments and completion evidence, together in one place.',
    descriptionAr: 'التكليفات وأدلة الإكمال في مكان واحد.',
  },
  programs: {
    en: 'Build the next chapter',
    ar: 'ابنِ المرحلة القادمة',
    path: '/coach/programs-sessions',
    descriptionEn: 'Shape programs and sessions, then prepare each session for release.',
    descriptionAr: 'صمّم البرامج والجلسات ثم جهّز كل جلسة للإصدار.',
  },
  prepare: {
    en: 'Session preparation',
    ar: 'إعداد الجلسة',
    path: '/coach/programs-sessions',
    descriptionEn: 'A deliberate sequence. Clear guidance. A version you can review.',
    descriptionAr: 'تسلسل مدروس وتعليمات واضحة ونسخة قابلة للمراجعة.',
  },
  exercises: {
    en: 'The movement library',
    ar: 'مكتبة الحركة',
    path: '/coach/exercises',
    descriptionEn: 'Create clear exercise guidance and review each version before publishing.',
    descriptionAr: 'أنشئ تعليمات واضحة للتمارين وراجع كل نسخة قبل نشرها.',
  },
  release: {
    en: 'Plan. Preview. Release.',
    ar: 'خطّط. راجع. أصدِر.',
    path: '/coach/schedule-release',
    descriptionEn: 'Give the right session to the right person, at the right time.',
    descriptionAr: 'قدّم الجلسة المناسبة للشخص المناسب في الوقت المناسب.',
  },
  completions: {
    en: 'Progress, recorded',
    ar: 'التقدم المسجل',
    path: '/coach/completions',
    descriptionEn: 'Review confirmed completions and open evidence-based corrections when needed.',
    descriptionAr: 'راجع الإكمالات المؤكدة وافتح طلبات التصحيح المدعومة بالأدلة عند الحاجة.',
  },
  reconciliation: {
    en: 'Correction review',
    ar: 'مراجعة التصحيح',
    path: '/coach/completions',
    descriptionEn: 'Review the proposal and its evidence before an independent decision.',
    descriptionAr: 'راجع المقترح وأدلته قبل اتخاذ قرار مستقل.',
  },
  admin: {
    en: 'Care behind the coaching',
    ar: 'الرعاية خلف التدريب',
    path: '/coach/admin',
    descriptionEn: 'Account access, policy decisions and support requests in one workspace.',
    descriptionAr: 'صلاحيات الحسابات وقرارات السياسات وطلبات الدعم في مساحة واحدة.',
  },
};
function metric(data: CoachDataset, locale: SupportedLocale) {
  return data.error || data.total === null ? '—' : new Intl.NumberFormat(locale).format(data.total);
}

export async function CoachScreen({
  section,
  reference = '',
  query = '',
}: {
  section: CoachSection;
  reference?: string;
  query?: string;
}) {
  const [session, locale] = await Promise.all([requireWorkspaceAccess('coach'), websiteLocale()]);
  const config = sections[section];
  let data: CoachData;
  try {
    data = await loadCoachData(session.supabase, section, locale, reference);
  } catch {
    const unavailable = { items: [], error: true, total: null };
    data = { primary: unavailable, secondary: unavailable, tertiary: unavailable };
  }
  const { can, unavailable: permissionsUnavailable } = await coachPermissions(
    session.supabase,
    section,
    data,
    session.principal.id,
  );
  const releaseTrainees = data.primary.items.filter((item) =>
    can('CAP-012', 'RES-010', '', textValue(item.extra.principalId)),
  );
  const correctable = data.primary.items.filter(
    (item) =>
      can('CAP-013', 'RES-012', item.ref, textValue(item.extra.subjectPrincipalId)) &&
      can('CAP-013', 'RES-013', '', textValue(item.extra.subjectPrincipalId)),
  );
  const principalTargets =
    data.authority?.principals.filter(
      (item) =>
        item.extra.principalId !== session.principal.id &&
        can('CAP-015', 'RES-005', '', textValue(item.extra.principalId)),
    ) ?? [];
  const grantTargets =
    data.authority?.grants.filter(
      (item) =>
        item.extra.principalId !== session.principal.id &&
        can('CAP-015', 'RES-005', item.ref, textValue(item.extra.principalId)),
    ) ?? [];
  const first = data.primary.items[0];
  const content = (() => {
    if (section === 'overview')
      return (
        <div className={s.stack}>
          <section className={s.hero}>
            <span className={s.eyebrow}>
              {t(locale, 'Coach Michel / Studio', 'كوتش ميشيل / الاستوديو')}
            </span>
            <h2>{t(locale, 'Make every next step intentional.', 'اجعل لكل خطوة قادمة هدفاً.')}</h2>
            <p>
              {t(
                locale,
                'Start with your people. Shape their sessions. Keep the record clear.',
                'ابدأ بالمتدربين، صمّم جلساتهم، وحافظ على وضوح السجلات.',
              )}
            </p>
            <div className={s.actions}>
              <Link className={s.secondary} href="/coach/trainees">
                {t(locale, 'View trainees', 'عرض المتدربين')}
              </Link>
              <Link className={s.secondary} href="/coach/programs-sessions">
                {t(locale, 'Prepare a session', 'إعداد جلسة')}
              </Link>
            </div>
          </section>
          <div className={s.three}>
            {[
              [t(locale, 'Trainees', 'المتدربون'), data.primary],
              [t(locale, 'Session definitions', 'تعريفات الجلسات'), data.secondary],
              [t(locale, 'Correction cases', 'طلبات التصحيح'), data.tertiary],
            ].map(([title, dataset]) => (
              <div className={s.metric} key={String(title)}>
                <span>{String(title)}</span>
                <strong className={s.number}>{metric(dataset as CoachDataset, locale)}</strong>
                <p>{t(locale, 'Available in your scope', 'متاح ضمن نطاقك')}</p>
              </div>
            ))}
          </div>
          <div className={s.grid}>
            <Panel
              title={t(locale, 'Your recent plans', 'أحدث خططك')}
              action={
                <Link className={s.link} href="/coach/programs-sessions">
                  {t(locale, 'View all', 'عرض الكل')}
                </Link>
              }
            >
              <Records
                data={{ ...data.secondary, items: data.secondary.items.slice(0, 4) }}
                locale={locale}
                href={(item) => `/coach/sessions/${encodeURIComponent(item.ref)}/prepare`}
              />
            </Panel>
            <Panel title={t(locale, 'Corrections to review', 'تصحيحات للمراجعة')}>
              <Records
                data={{ ...data.tertiary, items: data.tertiary.items.slice(0, 4) }}
                locale={locale}
                href={(item) => `/coach/reconciliation/${encodeURIComponent(item.ref)}`}
              />
            </Panel>
          </div>
        </div>
      );
    if (section === 'trainees') {
      const filtered = data.primary.items.filter((item) =>
        `${item.title} ${item.ref} ${item.description}`
          .toLocaleLowerCase(locale)
          .includes(query.toLocaleLowerCase(locale)),
      );
      return (
        <Panel title={t(locale, 'Trainee directory', 'دليل المتدربين')}>
          <form action="/coach/trainees">
            <label className={s.field}>
              <span>{t(locale, 'Search the loaded directory', 'البحث في الدليل المحمّل')}</span>
              <input
                type="search"
                name="q"
                defaultValue={query}
                maxLength={100}
                placeholder={t(locale, 'Name or reference', 'الاسم أو المرجع')}
              />
            </label>
            <div className={s.actions}>
              <button className={s.secondary} type="submit">
                {t(locale, 'Search', 'بحث')}
              </button>
              {query && (
                <Link className={s.link} href="/coach/trainees">
                  {t(locale, 'Clear search', 'مسح البحث')}
                </Link>
              )}
            </div>
          </form>
          <Records
            data={{ ...data.primary, items: filtered }}
            locale={locale}
            avatar
            href={(item) => `/coach/trainees/${encodeURIComponent(item.ref)}`}
          />
        </Panel>
      );
    }
    if (section === 'trainee')
      return first ? (
        <div className={s.stack}>
          <Panel title={first.title} eyebrow={t(locale, 'Trainee profile', 'ملف المتدرب')}>
            <p>{first.description}</p>
            <div className={s.meta}>
              <Status status={first.status} locale={locale} />
              <bdi className={s.reference}>{first.ref}</bdi>
            </div>
            <div className={s.actions}>
              <Link className={s.button} href="/coach/schedule-release">
                {t(locale, 'Schedule a session', 'جدولة جلسة')}
              </Link>
            </div>
          </Panel>
          <div className={s.grid}>
            <Panel title={t(locale, 'Assignments', 'التكليفات')}>
              <Records data={data.secondary} locale={locale}>
                {(item) => (
                  <div className={s.timeline}>
                    {collection(item.extra.schedules).map((schedule) => (
                      <div key={textValue(schedule.schedule_ref)}>
                        <Status status={textValue(schedule.status)} locale={locale} />
                        <p className={s.reference}>
                          <bdi>{textValue(schedule.schedule_ref)}</bdi>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Records>
            </Panel>
            <Panel title={t(locale, 'Recorded completions', 'الإكمالات المسجلة')}>
              <Records data={data.tertiary} locale={locale} />
            </Panel>
          </div>
        </div>
      ) : (
        <Empty
          locale={locale}
          error={data.primary.error}
          title={t(locale, 'Trainee unavailable', 'المتدرب غير متاح')}
        />
      );
    if (section === 'programs')
      return (
        <div className={s.stack}>
          <div className={s.grid}>
            <Panel title={t(locale, 'Programs', 'البرامج')}>
              <Records data={data.primary} locale={locale}>
                {(item) =>
                  can('CAP-008', 'RES-009', item.ref, textValue(item.extra.ownerPrincipalId)) && (
                    <details className={s.details}>
                      <summary>{t(locale, 'Revise program', 'تعديل البرنامج')}</summary>
                      <DraftForm
                        key={item.versionRef}
                        locale={locale}
                        kind="program"
                        existing={item}
                      />
                    </details>
                  )
                }
              </Records>
            </Panel>
            <Panel title={t(locale, 'Sessions', 'الجلسات')}>
              <Records
                data={data.secondary}
                locale={locale}
                href={(item) => `/coach/sessions/${encodeURIComponent(item.ref)}/prepare`}
              />
            </Panel>
          </div>
          {can('CAP-008', 'RES-009', '', session.principal.id) && (
            <div className={s.grid}>
              <Panel
                title={t(locale, 'Create a program', 'إنشاء برنامج')}
                eyebrow={t(locale, 'Start with intention', 'ابدأ بهدف')}
              >
                <DraftForm locale={locale} kind="program" />
              </Panel>
              <Panel
                title={t(locale, 'Create a session', 'إنشاء جلسة')}
                eyebrow={t(locale, 'One focused session', 'جلسة هادفة')}
              >
                <p>
                  {t(
                    locale,
                    'Save the session outline here, then open preparation to add exercises.',
                    'احفظ مخطط الجلسة هنا ثم افتح الإعداد لإضافة التمارين.',
                  )}
                </p>
                <DraftForm locale={locale} kind="session" />
              </Panel>
            </div>
          )}
        </div>
      );
    if (section === 'prepare')
      return first ? (
        <div className={s.grid}>
          <Panel
            title={first.title}
            eyebrow={t(locale, 'Current saved version', 'النسخة المحفوظة الحالية')}
          >
            <p>{first.description}</p>
            <div className={s.meta}>
              <Status status={first.status} locale={locale} />
              <span>
                {t(locale, 'Version', 'النسخة')} {first.version}
              </span>
            </div>
            <div className={s.timeline}>
              {collection(first.extra.exercises).map((exercise, index) => (
                <div key={textValue(exercise.exerciseRef)}>
                  <h3>
                    {index + 1}.{' '}
                    {data.secondary.items.find((item) => item.ref === exercise.exerciseRef)
                      ?.title || textValue(exercise.exerciseRef)}
                  </h3>
                  <p>
                    {Object.entries(row(exercise.configuration))
                      .filter(([key]) => ['sets', 'reps', 'restSeconds'].includes(key))
                      .map(
                        ([key, value]) =>
                          `${key === 'sets' ? t(locale, 'Sets', 'الجولات') : key === 'reps' ? t(locale, 'Reps', 'التكرارات') : t(locale, 'Rest seconds', 'الراحة بالثواني')}: ${String(value)}`,
                      )
                      .join(' · ')}
                  </p>
                </div>
              ))}
            </div>
            <div className={s.actions}>
              <Link className={s.link} href="/coach/schedule-release">
                {t(locale, 'Schedule this session →', 'جدولة هذه الجلسة ←')}
              </Link>
              <Link className={s.link} href="/coach/exercises">
                {t(locale, 'Exercise library', 'مكتبة التمارين')}
              </Link>
            </div>
          </Panel>
          <Panel title={t(locale, 'Prepare the next version', 'إعداد النسخة القادمة')}>
            {data.secondary.error ? (
              <Empty locale={locale} error />
            ) : can('CAP-008', 'RES-009', first.ref, textValue(first.extra.ownerPrincipalId)) ? (
              <DraftForm
                key={first.versionRef}
                locale={locale}
                kind="session"
                existing={first}
                exercises={data.secondary.items}
              />
            ) : (
              <p>
                {t(
                  locale,
                  'You can review this session. Editing requires a draft permission for this record.',
                  'يمكنك مراجعة الجلسة. يتطلب التعديل صلاحية للمسودة الخاصة بهذا السجل.',
                )}
              </p>
            )}
          </Panel>
        </div>
      ) : (
        <Empty
          locale={locale}
          error={data.primary.error}
          title={t(locale, 'Session unavailable', 'الجلسة غير متاحة')}
        />
      );
    if (section === 'exercises')
      return (
        <div className={s.stack}>
          <Panel title={t(locale, 'Catalogue', 'المكتبة')}>
            <Records data={data.primary} locale={locale}>
              {(item) => (
                <>
                  <details className={s.details}>
                    <summary>{t(locale, 'Read guidance', 'قراءة التعليمات')}</summary>
                    <TextContent value={row(item.extra.body).instructions} />
                  </details>
                  {can(
                    'CAP-009',
                    'RES-008',
                    item.ref,
                    textValue(item.extra.creatorPrincipalId),
                  ) && (
                    <details className={s.details}>
                      <summary>{t(locale, 'Revise exercise', 'تعديل التمرين')}</summary>
                      <DraftForm
                        key={item.versionRef}
                        locale={locale}
                        kind="content"
                        existing={item}
                      />
                    </details>
                  )}
                  {item.status === 'DRAFT' &&
                    can(
                      'CAP-010',
                      'RES-008',
                      item.ref,
                      textValue(item.extra.versionCreatorPrincipalId),
                    ) &&
                    item.extra.versionCreatorPrincipalId !== session.principal.id && (
                      <details className={s.details}>
                        <summary>{t(locale, 'Publication decision', 'قرار النشر')}</summary>
                        <DecisionForm locale={locale} kind="content" item={item} />
                      </details>
                    )}
                </>
              )}
            </Records>
          </Panel>
          {can('CAP-009', 'RES-008', '', session.principal.id) && (
            <Panel title={t(locale, 'Create exercise guidance', 'إنشاء تعليمات تمرين')}>
              <p>
                {t(
                  locale,
                  'Create a draft using your own approved coaching material. Publication is a separate decision.',
                  'أنشئ مسودة من مواد التدريب المعتمدة لديك. النشر قرار مستقل.',
                )}
              </p>
              <DraftForm locale={locale} kind="content" />
            </Panel>
          )}
        </div>
      );
    if (section === 'release')
      return (
        <div className={s.grid}>
          <Panel title={t(locale, 'Schedule a session', 'جدولة جلسة')}>
            {data.primary.error || data.secondary.error ? (
              <Empty locale={locale} error />
            ) : releaseTrainees.length > 0 ? (
              <ReleaseForm
                locale={locale}
                trainees={releaseTrainees}
                sessions={data.secondary.items}
              />
            ) : (
              <p>
                {t(
                  locale,
                  'Release access is required to assign a session.',
                  'يلزم امتلاك صلاحية الإصدار لتكليف متدرب بجلسة.',
                )}
              </p>
            )}
          </Panel>
          <Panel title={t(locale, 'A clear release process', 'عملية إصدار واضحة')}>
            <div className={s.timeline}>
              <div>
                <h3>{t(locale, '01 · Select', '١ · اختر')}</h3>
                <p>
                  {t(
                    locale,
                    'Choose a trainee and a saved session version.',
                    'اختر المتدرب ونسخة جلسة محفوظة.',
                  )}
                </p>
              </div>
              <div>
                <h3>{t(locale, '02 · Preview', '٢ · عاين')}</h3>
                <p>
                  {t(
                    locale,
                    'Check the date, exercise publication and current access before you commit.',
                    'تحقق من التاريخ ونشر التمارين والصلاحيات الحالية قبل التأكيد.',
                  )}
                </p>
              </div>
              <div>
                <h3>{t(locale, '03 · Release', '٣ · أصدِر')}</h3>
                <p>
                  {t(
                    locale,
                    'The server records the assignment and release together. The trainee then sees the session.',
                    'يسجل الخادم التكليف والإصدار معاً، ثم تظهر الجلسة للمتدرب.',
                  )}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      );
    if (section === 'completions')
      return (
        <div className={s.stack}>
          <div className={s.grid}>
            <Panel title={t(locale, 'Completion evidence', 'أدلة الإكمال')}>
              <Records data={data.primary} locale={locale}>
                {(item) => (
                  <>
                    <p className={s.reference}>
                      <bdi>{textValue(item.extra.scheduleRef)}</bdi>
                    </p>
                    <TextContent value={row(item.extra.state).note} />
                  </>
                )}
              </Records>
            </Panel>
            <Panel title={t(locale, 'Correction cases', 'طلبات التصحيح')}>
              <Records
                data={data.secondary}
                locale={locale}
                href={(item) => `/coach/reconciliation/${encodeURIComponent(item.ref)}`}
              />
            </Panel>
          </div>
          {correctable.length > 0 && (
            <Panel title={t(locale, 'Propose a correction', 'اقتراح تصحيح')}>
              <p>
                {t(
                  locale,
                  'A proposal preserves the original completion until a separate authorized reviewer approves it.',
                  'يحافظ المقترح على الإكمال الأصلي حتى يوافق عليه مراجع مخوّل مستقل.',
                )}
              </p>
              <CorrectionForm locale={locale} completions={correctable} />
            </Panel>
          )}
        </div>
      );
    if (section === 'reconciliation')
      return first ? (
        <div className={s.stack}>
          <Panel title={t(locale, 'Case evidence', 'أدلة الطلب')}>
            <Item item={first} locale={locale} />
            <p className={s.reference}>
              <bdi>{first.ref}</bdi>
            </p>
            <TextContent value={first.extra.proposalReason} />
            <p>
              {t(locale, 'Proposed state', 'الحالة المقترحة')}:{' '}
              <Status
                status={textValue(row(row(first.extra.proposal).newState).status)}
                locale={locale}
              />
            </p>
            <TextContent value={row(row(first.extra.proposal).newState).note} />
            <p className={s.reference}>
              <bdi>{textValue(row(first.extra.proposal).completionRef)}</bdi>
            </p>
            <div className={s.timeline}>
              {collection(first.extra.decisions).map((decision, index) => (
                <div key={index}>
                  <Status status={textValue(decision.decision)} locale={locale} />
                  <p>{textValue(decision.reason)}</p>
                </div>
              ))}
            </div>
          </Panel>
          {first.status === 'OPEN' && (
            <div className={s.grid}>
              {can('CAP-013', 'RES-013', first.ref, textValue(first.extra.subjectPrincipalId)) &&
                can(
                  'CAP-013',
                  'RES-012',
                  textValue(row(first.extra.proposal).completionRef),
                  textValue(first.extra.subjectPrincipalId),
                ) && (
                  <Panel title={t(locale, 'Revise proposal', 'تعديل المقترح')}>
                    <CorrectionForm
                      key={first.versionRef}
                      locale={locale}
                      completions={data.secondary.items}
                      existing={first}
                    />
                  </Panel>
                )}
              {can('CAP-014', 'RES-013', first.ref, textValue(first.extra.subjectPrincipalId)) &&
                can(
                  'CAP-014',
                  'RES-012',
                  textValue(row(first.extra.proposal).completionRef),
                  textValue(first.extra.subjectPrincipalId),
                ) &&
                first.extra.proposalCreatorPrincipalId !== session.principal.id && (
                  <Panel title={t(locale, 'Independent decision', 'القرار المستقل')}>
                    <p>
                      {t(
                        locale,
                        'Approval applies this proposal. The proposal author cannot approve their own correction.',
                        'تطبق الموافقة هذا المقترح. لا يمكن لمنشئ المقترح الموافقة على تصحيحه.',
                      )}
                    </p>
                    <DecisionForm locale={locale} kind="reconciliation" item={first} />
                  </Panel>
                )}
            </div>
          )}
        </div>
      ) : (
        <Empty
          locale={locale}
          error={data.primary.error}
          title={t(locale, 'Correction unavailable', 'التصحيح غير متاح')}
        />
      );
    return (
      <div className={s.stack}>
        <div className={s.grid}>
          <Panel
            title={t(locale, 'Scheduling policies', 'سياسات الجدولة')}
            action={
              <Link className={s.link} href="/access/notices">
                {t(locale, 'Account notices', 'إشعارات الحساب')}
              </Link>
            }
          >
            <Records data={data.primary} locale={locale}>
              {(item) => (
                <>
                  <p>
                    {t(locale, 'Time zone', 'المنطقة الزمنية')}:{' '}
                    <bdi>{textValue(row(item.extra.payload).timezone) || 'UTC'}</bdi>
                  </p>
                  <p>
                    {t(locale, 'Scheduling horizon (days)', 'مدة الجدولة المسبقة (أيام)')}:{' '}
                    {String(row(item.extra.payload).maxAdvanceDays ?? '—')}
                  </p>
                  <p>
                    {t(locale, 'Past allowance (days)', 'المدة السابقة المسموحة (أيام)')}:{' '}
                    {String(row(item.extra.payload).allowPastDays ?? '—')}
                  </p>
                  {can('CAP-011', 'RES-015') && (
                    <details className={s.details}>
                      <summary>{t(locale, 'Revise policy', 'تعديل السياسة')}</summary>
                      <ConfigurationDraftForm
                        key={item.versionRef}
                        locale={locale}
                        kind="policy"
                        existing={item}
                      />
                    </details>
                  )}
                  {item.versionRef &&
                    can('CAP-011', 'RES-015', item.versionRef) &&
                    item.status === 'DRAFT' &&
                    item.extra.creatorPrincipalId !== session.principal.id && (
                      <details className={s.details}>
                        <summary>
                          {t(locale, 'Record policy decision', 'تسجيل قرار السياسة')}
                        </summary>
                        <DecisionForm locale={locale} kind="policy" item={item} />
                      </details>
                    )}
                </>
              )}
            </Records>
          </Panel>
          <Panel title={t(locale, 'Support and privacy', 'الدعم والخصوصية')}>
            <Records data={data.secondary} locale={locale}>
              {(item) =>
                can('CAP-016', 'RES-014', item.ref, textValue(item.extra.subjectPrincipalId)) &&
                item.status !== 'RESOLVED' && (
                  <details className={s.details}>
                    <summary>
                      {t(locale, 'Update or escalate case', 'تحديث الطلب أو تصعيده')}
                    </summary>
                    <SupportUpdateForm locale={locale} item={item} />
                  </details>
                )
              }
            </Records>
          </Panel>
        </div>
        <Panel title={t(locale, 'Account notices', 'إشعارات الحسابات')}>
          <Records
            data={data.disclosures ?? { items: [], error: true, total: null }}
            locale={locale}
          >
            {(item) => (
              <>
                <details className={s.details}>
                  <summary>{t(locale, 'Read this notice', 'قراءة هذا الإشعار')}</summary>
                  <TextContent value={row(item.extra.body).body} />
                </details>
                {can('CAP-010', 'RES-002') && (
                  <details className={s.details}>
                    <summary>{t(locale, 'Revise notice', 'تعديل الإشعار')}</summary>
                    <ConfigurationDraftForm
                      key={item.versionRef}
                      locale={locale}
                      kind="disclosure"
                      existing={item}
                    />
                  </details>
                )}
                {item.status === 'DRAFT' &&
                  item.extra.creatorPrincipalId !== session.principal.id &&
                  can('CAP-010', 'RES-002', item.ref) && (
                    <details className={s.details}>
                      <summary>
                        {t(locale, 'Review publication decision', 'مراجعة قرار النشر')}
                      </summary>
                      <p>
                        {t(
                          locale,
                          'Read the complete notice above. Approval makes this version effective for account holders.',
                          'اقرأ الإشعار الكامل أعلاه. تجعل الموافقة هذه النسخة نافذة لأصحاب الحسابات.',
                        )}
                      </p>
                      <DecisionForm locale={locale} kind="disclosure" item={item} />
                    </details>
                  )}
                {item.status === 'DRAFT' &&
                  item.extra.creatorPrincipalId === session.principal.id && (
                    <p className={s.note}>
                      {t(
                        locale,
                        'This draft needs another authorized reviewer before it can be published.',
                        'تحتاج هذه المسودة إلى مراجع مخوّل آخر قبل نشرها.',
                      )}
                    </p>
                  )}
              </>
            )}
          </Records>
        </Panel>
        {(can('CAP-010', 'RES-002') || can('CAP-011', 'RES-015')) && (
          <div className={s.grid}>
            {can('CAP-010', 'RES-002') && (
              <Panel title={t(locale, 'Create an account notice', 'إنشاء إشعار للحسابات')}>
                <ConfigurationDraftForm locale={locale} kind="disclosure" />
              </Panel>
            )}
            {can('CAP-011', 'RES-015') && (
              <Panel title={t(locale, 'Create a scheduling policy', 'إنشاء سياسة جدولة')}>
                <ConfigurationDraftForm locale={locale} kind="policy" />
              </Panel>
            )}
          </div>
        )}
        <Panel title={t(locale, 'Provisioning records', 'سجلات تهيئة الحسابات')}>
          <Records data={data.tertiary} locale={locale} />
        </Panel>
        {(principalTargets.length > 0 || grantTargets.length > 0) && (
          <Panel title={t(locale, 'Manage scoped access', 'إدارة صلاحيات الوصول')}>
            <p>
              {t(
                locale,
                'Use the verified reference of an existing account. You cannot change your own authority.',
                'استخدم المرجع المتحقق منه لحساب موجود. لا يمكنك تغيير صلاحياتك الخاصة.',
              )}
            </p>
            {data.authority && !data.authority.error ? (
              <GrantForm
                locale={locale}
                authority={{
                  ...data.authority,
                  principals: principalTargets,
                  grants: grantTargets,
                }}
              />
            ) : (
              <Empty locale={locale} error />
            )}
          </Panel>
        )}
      </div>
    );
  })();
  return (
    <WorkspaceShell
      locale={locale}
      area="coach"
      title={locale === 'ar' ? config.ar : config.en}
      description={locale === 'ar' ? config.descriptionAr : config.descriptionEn}
      path={config.path}
    >
      {permissionsUnavailable && (
        <p className={s.note} role="alert">
          {t(
            locale,
            'Action permissions could not be confirmed. Refresh before making a change.',
            'تعذر تأكيد صلاحيات الإجراءات. حدّث الصفحة قبل إجراء أي تغيير.',
          )}
        </p>
      )}
      {content}
    </WorkspaceShell>
  );
}
