import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { websiteLocale } from '@/features/website/locale';
import { requireWorkspaceAccess } from '@/features/workspace/access';
import { WorkspaceShell } from '@/features/workspace/workspace-shell';
import { dispatchOperationsOperation, toValidation } from '@/platform/server/operations-operations';
import type { ApiOperationContext } from '@/platform/server/contracts';
import { OperationsCommandForm } from './command-form';
import type {
  IncidentContext,
  IncidentSummary,
  SupportCaseSummary,
  ValidationContext,
} from './contracts';
import { isOpaqueReference } from './contracts';
import styles from './operations.module.css';

type Session = Awaited<ReturnType<typeof requireWorkspaceAccess>>;
type QueryResult<T> = { ok: true; data: T } | { ok: false; status: number };
async function readOperation<T>(
  session: Session,
  operationId: string,
  params?: Record<string, string>,
  query = '',
): Promise<QueryResult<T>> {
  const ctx: ApiOperationContext = {
    operationId,
    request: new Request(`http://cmh.internal/ops-read${query}`),
    user: session.user,
    supabase: session.supabase,
    ...(params ? { params } : {}),
  };
  const response = await dispatchOperationsOperation(ctx);
  if (!response?.ok) return { ok: false, status: response?.status ?? 503 };
  return { ok: true, data: (await response.json()) as T };
}
function choose(locale: SupportedLocale, en: string, ar: string) {
  return locale === 'ar' ? ar : en;
}
function enumLabel(locale: SupportedLocale, value: string): string {
  const labels: Record<string, readonly [string, string]> = {
    OPEN: ['Open', 'مفتوح'],
    IN_REVIEW: ['In review', 'قيد المراجعة'],
    ESCALATED: ['Escalated', 'تم التصعيد'],
    RESOLVED: ['Resolved', 'تم الحل'],
    CLOSED: ['Closed', 'مغلق'],
    RECORDED: ['Recorded', 'مسجّل'],
    PENDING: ['Pending', 'قيد الانتظار'],
    VALIDATED: ['Validated', 'تم التحقق'],
    COMMITTED: ['Saved', 'محفوظ'],
    PASS: ['Passed', 'ناجح'],
    FAIL: ['Failed', 'غير ناجح'],
    INCONCLUSIVE: ['Inconclusive', 'غير حاسم'],
    availability: ['Availability', 'التوفر'],
    access: ['Access', 'الوصول'],
    'data-integrity': ['Data integrity', 'سلامة البيانات'],
    privacy: ['Privacy', 'الخصوصية'],
    other: ['Other', 'أخرى'],
    training: ['Training', 'التدريب'],
    account: ['Account', 'الحساب'],
    technical: ['Technical', 'تقني'],
    investigation: ['Investigation', 'التحقيق'],
    restoration: ['Restoration', 'الاستعادة'],
    verification: ['Verification', 'التحقق'],
  };
  return labels[value]?.[locale === 'ar' ? 1 : 0] ?? value;
}
function Card({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={styles.card}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Unavailable({ locale, status }: { locale: SupportedLocale; status: number }) {
  return (
    <p role="status" className={styles.note}>
      {choose(
        locale,
        status === 403
          ? 'This section is outside your current role or scope.'
          : status === 404
            ? 'This record is unavailable within your scope.'
            : 'This information could not be loaded. Refresh the page to try again.',
        status === 403
          ? 'هذا القسم خارج دورك أو نطاق صلاحيتك الحالي.'
          : status === 404
            ? 'هذا السجل غير متاح ضمن نطاق صلاحيتك.'
            : 'تعذر تحميل المعلومات. حدّث الصفحة لإعادة المحاولة.',
      )}
    </p>
  );
}
function Empty({ locale, support = false }: { locale: SupportedLocale; support?: boolean }) {
  return (
    <div className={styles.empty}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="34" height="34" rx="12" stroke="currentColor" />
        <path d="m14 23 5 5 11-12" stroke="currentColor" strokeWidth="2" />
      </svg>
      <h3>
        {choose(
          locale,
          support ? 'No requests in your scope.' : 'A clear view starts here.',
          support ? 'لا توجد طلبات ضمن صلاحيتك.' : 'تبدأ الرؤية الواضحة من هنا.',
        )}
      </h3>
      <p>
        {choose(
          locale,
          support
            ? 'New support and privacy cases will appear here when they are received.'
            : 'No incidents have been recorded in your scope. Record an issue when there is evidence to review.',
          support
            ? 'تظهر هنا طلبات الدعم والخصوصية الجديدة عند استلامها.'
            : 'لا توجد حوادث مسجلة ضمن صلاحيتك. سجّل المشكلة عند وجود أدلة لمراجعتها.',
        )}
      </p>
    </div>
  );
}
function Reference({ value }: { value: string }) {
  return <bdi className={styles.ref}>{value}</bdi>;
}
function Stamp({ date, locale }: { date: string; locale: SupportedLocale }) {
  const parsed = new Date(date);
  return (
    <time dateTime={date}>
      {Number.isNaN(parsed.getTime())
        ? '—'
        : new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC',
          }).format(parsed)}{' '}
      UTC
    </time>
  );
}

export async function IncidentsPage({ offset = 0 }: { offset?: number }) {
  const [session, locale] = await Promise.all([requireWorkspaceAccess('ops'), websiteLocale()]);
  const safeOffset = Number.isInteger(offset) && offset >= 0 && offset <= 10000 ? offset : 0;
  const [incidents, support, audit] = await Promise.all([
    readOperation<{ items: IncidentSummary[]; nextOffset: number | null }>(
      session,
      'p3s11_apin_040_collection',
      undefined,
      `?offset=${safeOffset}`,
    ),
    readOperation<{ items: SupportCaseSummary[]; nextOffset: number | null }>(
      session,
      'p3s11_apin_038_collection',
    ),
    readOperation<{
      items: { eventRef: string; action: string; result: string; occurredAt: string }[];
    }>(session, 'p3s11_apin_044_get_1', undefined, '?limit=20'),
  ]);
  const canIntake = session.grants.some(
    (g) =>
      ((g.role_id === 'ROL-009' && g.capability_id === 'CAP-017') ||
        (g.role_id === 'ROL-008' && g.capability_id === 'CAP-016')) &&
      g.resource_id === 'RES-016',
  );
  return (
    <WorkspaceShell
      locale={locale}
      area="ops"
      path="/ops/incidents"
      title={choose(locale, 'Care behind the coaching.', 'العناية وراء التدريب.')}
      description={choose(
        locale,
        'Review issues, preserve evidence, and keep recovery accountable.',
        'راجع المشكلات، واحفظ الأدلة، وتابع الاستعادة بمسؤولية.',
      )}
    >
      <div className={styles.stack}>
        <div className={styles.columns}>
          <Card title={choose(locale, 'Incident register', 'سجل الحوادث')}>
            <p>
              {choose(
                locale,
                'Records visible to your active role and scope.',
                'السجلات المتاحة حسب دورك وصلاحيتك الفعالة.',
              )}
            </p>
            {!incidents.ok ? (
              <Unavailable locale={locale} status={incidents.status} />
            ) : incidents.data.items.length === 0 ? (
              <Empty locale={locale} />
            ) : (
              <>
                <ul className={styles.list}>
                  {incidents.data.items.map((incident) => (
                    <li key={incident.incidentRef}>
                      <div className={styles.row}>
                        <h3>{enumLabel(locale, incident.classificationRef)}</h3>
                        <span className={styles.status}>{enumLabel(locale, incident.status)}</span>
                      </div>
                      <p>{incident.evidence.summary}</p>
                      <div className={styles.meta}>
                        <Reference value={incident.incidentRef} />
                        <Stamp date={incident.createdAt} locale={locale} />
                      </div>
                      <Link
                        className={styles.link}
                        href={`/ops/recovery/${encodeURIComponent(incident.incidentRef)}`}
                      >
                        {choose(locale, 'Review incident & recovery', 'مراجعة الحادثة والاستعادة')}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className={styles.links}>
                  {safeOffset > 0 && (
                    <Link
                      className={styles.link}
                      href={`/ops/incidents?offset=${Math.max(0, safeOffset - 50)}`}
                    >
                      {choose(locale, 'Previous', 'السابق')}
                    </Link>
                  )}
                  {incidents.data.nextOffset !== null && (
                    <Link
                      className={styles.link}
                      href={`/ops/incidents?offset=${incidents.data.nextOffset}`}
                    >
                      {choose(locale, 'Next records', 'السجلات التالية')}
                    </Link>
                  )}
                </div>
              </>
            )}
          </Card>
          <Card title={choose(locale, 'Record an incident', 'تسجيل حادثة')}>
            <p>
              {choose(
                locale,
                'A factual starting point for investigation. Submission records the issue for review.',
                'نقطة بداية واقعية للتحقيق. يؤدي الإرسال إلى تسجيل المشكلة للمراجعة.',
              )}
            </p>
            {canIntake ? (
              <OperationsCommandForm kind="incident" locale={locale} />
            ) : (
              <Unavailable locale={locale} status={403} />
            )}
          </Card>
        </div>
        <Card id="support" title={choose(locale, 'Support & privacy', 'الدعم والخصوصية')}>
          {!support.ok ? (
            <Unavailable locale={locale} status={support.status} />
          ) : support.data.items.length === 0 ? (
            <Empty locale={locale} support />
          ) : (
            <>
              <p>
                {choose(
                  locale,
                  'Showing the latest 50 cases within your handling scope.',
                  'تظهر أحدث ٥٠ حالة ضمن نطاق صلاحيتك في المعالجة.',
                )}
              </p>
              <ul className={styles.list}>
                {support.data.items.map((item) => (
                  <li key={item.caseRef}>
                    <div className={styles.row}>
                      <h3>{enumLabel(locale, item.requestCategory)}</h3>
                      <span className={styles.status}>{enumLabel(locale, item.status)}</span>
                    </div>
                    <p>{item.message}</p>
                    <div className={styles.meta}>
                      <Reference value={item.caseRef} />
                      <Stamp date={item.createdAt} locale={locale} />
                    </div>
                    {item.status !== 'RESOLVED' && (
                      <details className={styles.details}>
                        <summary>{choose(locale, 'Handle this case', 'معالجة هذه الحالة')}</summary>
                        <OperationsCommandForm
                          kind="support"
                          locale={locale}
                          reference={item.caseRef}
                          expectedStatus={item.status}
                        />
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
        <Card title={choose(locale, 'Recent audit trail', 'سجل التدقيق الأخير')}>
          {!audit.ok ? (
            <Unavailable locale={locale} status={audit.status} />
          ) : audit.data.items.length === 0 ? (
            <p>
              {choose(
                locale,
                'No audit events are visible in your scope.',
                'لا توجد أحداث تدقيق متاحة ضمن صلاحيتك.',
              )}
            </p>
          ) : (
            <ul className={`${styles.list} ${styles.audit}`}>
              {audit.data.items.map((event) => (
                <li key={event.eventRef}>
                  <div className={styles.row}>
                    <strong>{event.action}</strong>
                    <span className={styles.status}>{enumLabel(locale, event.result)}</span>
                  </div>
                  <div className={styles.meta}>
                    <Reference value={event.eventRef} />
                    <Stamp date={event.occurredAt} locale={locale} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </WorkspaceShell>
  );
}

export async function RecoveryPage({ incidentRef }: { incidentRef: string }) {
  const [session, locale] = await Promise.all([requireWorkspaceAccess('ops'), websiteLocale()]);
  const result = await readOperation<IncidentContext>(session, 'p3s11_apin_040_detail', {
    incident_ref: incidentRef,
  });
  const canOperate = session.grants.some(
    (g) =>
      g.role_id === 'ROL-009' &&
      g.capability_id === 'CAP-017' &&
      g.resource_id === 'RES-016' &&
      (g.object_ref === null || g.object_ref === incidentRef),
  );
  return (
    <WorkspaceShell
      locale={locale}
      area="ops"
      path={`/ops/recovery/${encodeURIComponent(incidentRef)}`}
      title={choose(locale, 'A considered recovery.', 'استعادة مدروسة.')}
      description={choose(
        locale,
        'Record the activity and evidence, then request an independent check.',
        'سجّل النشاط والأدلة، ثم اطلب تحققاً مستقلاً.',
      )}
    >
      <div className={styles.stack}>
        <Link className={styles.link} href="/ops/incidents">
          {choose(locale, 'Back to incidents', 'العودة إلى الحوادث')}
        </Link>
        {!result.ok ? (
          <Unavailable locale={locale} status={result.status} />
        ) : (
          <>
            <Card title={choose(locale, 'Incident context', 'سياق الحادثة')}>
              <div className={styles.row}>
                <Reference value={result.data.incident.incidentRef} />
                <span className={styles.status}>
                  {enumLabel(locale, result.data.incident.status)}
                </span>
              </div>
              <p>{result.data.incident.evidence.summary}</p>
              <p>
                {choose(locale, 'Affected references', 'المراجع المتأثرة')}:{' '}
                {result.data.incident.affectedReferences.map((ref) => (
                  <Reference key={ref} value={`${ref} `} />
                ))}
              </p>
            </Card>
            <div className={styles.columns}>
              <Card title={choose(locale, 'Recovery activity', 'نشاط الاستعادة')}>
                <div className={styles.note}>
                  {choose(
                    locale,
                    'This records recovery work and its evidence. It does not run infrastructure commands or confirm that service is restored.',
                    'يسجّل هذا نشاط الاستعادة وأدلته. لا ينفّذ أوامر البنية التحتية ولا يؤكد استعادة الخدمة.',
                  )}
                </div>
                {canOperate ? (
                  <OperationsCommandForm kind="recovery" locale={locale} reference={incidentRef} />
                ) : (
                  <Unavailable locale={locale} status={403} />
                )}
              </Card>
              <Card title={choose(locale, 'Activity history', 'سجل الأنشطة')}>
                {result.data.activities.length === 0 ? (
                  <p>
                    {choose(
                      locale,
                      'No recovery activity has been recorded.',
                      'لم يُسجل أي نشاط استعادة بعد.',
                    )}
                  </p>
                ) : (
                  <ul className={styles.list}>
                    {result.data.activities.map((activity) => (
                      <li key={activity.recoveryActivityRef}>
                        <div className={styles.row}>
                          <h3>{enumLabel(locale, activity.category)}</h3>
                          <span className={styles.status}>
                            {enumLabel(locale, activity.status)}
                          </span>
                        </div>
                        <p>{activity.reason}</p>
                        <p>{activity.evidence.summary}</p>
                        <div className={styles.meta}>
                          <Stamp date={activity.startedAt} locale={locale} />
                        </div>
                        <Link
                          className={styles.link}
                          href={`/ops/recovery/${encodeURIComponent(activity.recoveryActivityRef)}/validation`}
                        >
                          {choose(locale, 'Independent validation', 'التحقق المستقل')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

export async function RecoveryValidationPage({ recoveryRef }: { recoveryRef: string }) {
  const [session, locale] = await Promise.all([requireWorkspaceAccess('ops'), websiteLocale()]);
  const result = await readOperation<ValidationContext>(
    session,
    'p3s11_apin_042_read_validation_context',
    { recovery_activity_ref: recoveryRef },
  );
  return (
    <WorkspaceShell
      locale={locale}
      area="ops"
      path={`/ops/recovery/${encodeURIComponent(recoveryRef)}/validation`}
      title={choose(locale, 'Evidence before confidence.', 'الأدلة قبل الثقة.')}
      description={choose(
        locale,
        'An independent review of the recovery work and its outcome.',
        'مراجعة مستقلة لنشاط الاستعادة ونتائجه.',
      )}
    >
      <div className={styles.stack}>
        <Link className={styles.link} href="/ops/incidents">
          {choose(locale, 'Back to incidents', 'العودة إلى الحوادث')}
        </Link>
        {!result.ok ? (
          <Unavailable locale={locale} status={result.status} />
        ) : (
          <>
            <Card title={choose(locale, 'Recovery evidence', 'أدلة الاستعادة')}>
              <Reference value={result.data.activity.recoveryActivityRef} />
              <p>{result.data.activity.reason}</p>
              <p>{result.data.activity.evidence.summary}</p>
              <ul>
                {result.data.activity.evidence.references.map((ref) => (
                  <li key={ref}>
                    <Reference value={ref} />
                  </li>
                ))}
              </ul>
            </Card>
            <div className={styles.columns}>
              <Card title={choose(locale, 'Independent validation', 'التحقق المستقل')}>
                <div className={styles.note}>
                  {choose(
                    locale,
                    'The validator must be a different person from the recovery initiator. A result needs actual check findings and evidence references.',
                    'يجب أن يكون المدقق شخصاً مختلفاً عن منفذ الاستعادة. تتطلب النتيجة فحوصات فعلية ومراجع أدلة.',
                  )}
                </div>
                {result.data.canValidate ? (
                  <OperationsCommandForm
                    kind="validation"
                    locale={locale}
                    reference={recoveryRef}
                  />
                ) : (
                  <p>
                    {choose(
                      locale,
                      'Validation is unavailable: this activity already has a decision, or you initiated the recovery work.',
                      'التحقق غير متاح: سُجل قرار لهذا النشاط مسبقاً، أو أنك بدأت نشاط الاستعادة.',
                    )}
                  </p>
                )}
              </Card>
              <Card title={choose(locale, 'Validation history', 'سجل التحقق')}>
                {result.data.validations.length === 0 ? (
                  <p>
                    {choose(locale, 'Awaiting an independent validation.', 'بانتظار تحقق مستقل.')}
                  </p>
                ) : (
                  <ul className={styles.list}>
                    {result.data.validations.map((validation) => (
                      <li key={validation.validationRef}>
                        <span className={styles.status}>
                          {enumLabel(locale, validation.result)}
                        </span>
                        <p>{validation.evidence.summary}</p>
                        <div className={styles.meta}>
                          <Stamp date={validation.validatedAt} locale={locale} />
                        </div>
                        {validation.result === 'PASS' && (
                          <Link
                            className={styles.link}
                            href={`/ops/reconciliation/${encodeURIComponent(validation.validationRef)}`}
                          >
                            {choose(
                              locale,
                              'Review reconciliation handoff',
                              'مراجعة إحالة المطابقة',
                            )}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

export async function ReconciliationHandoffPage({ validationRef }: { validationRef: string }) {
  const [session, locale] = await Promise.all([requireWorkspaceAccess('ops'), websiteLocale()]);
  const result = isOpaqueReference(validationRef)
    ? await session.supabase
        .from('recovery_validations')
        .select('id,validation_ref,result,evidence,validated_at')
        .eq('validation_ref', validationRef)
        .maybeSingle()
    : { data: null, error: null };
  const handoffs = result.data
    ? await session.supabase
        .from('state_reconciliation_handoffs')
        .select('handoff_ref,target_references,status,created_at')
        .eq('recovery_validation_id', result.data.id)
        .order('created_at', { ascending: false })
        .limit(50)
    : null;
  const validation = result.data ? toValidation(result.data) : null;
  const canHandoff = session.grants.some(
    (g) =>
      g.role_id === 'ROL-010' &&
      g.capability_id === 'CAP-018' &&
      g.resource_id === 'RES-017' &&
      (g.object_ref === null || g.object_ref === validationRef),
  );
  return (
    <WorkspaceShell
      locale={locale}
      area="ops"
      path={`/ops/reconciliation/${encodeURIComponent(validationRef)}`}
      title={choose(locale, 'Close the loop carefully.', 'أكمل المتابعة بعناية.')}
      description={choose(
        locale,
        'Hand validated evidence to the next accountable decision.',
        'أحِل الأدلة التي تم التحقق منها إلى القرار المسؤول التالي.',
      )}
    >
      <div className={styles.stack}>
        <Link className={styles.link} href="/ops/incidents">
          {choose(locale, 'Back to incidents', 'العودة إلى الحوادث')}
        </Link>
        {result.error || handoffs?.error ? (
          <Unavailable locale={locale} status={503} />
        ) : !validation ? (
          <Unavailable locale={locale} status={404} />
        ) : (
          <>
            <Card title={choose(locale, 'Validation outcome', 'نتيجة التحقق')}>
              <div className={styles.row}>
                <Reference value={validation.validationRef} />
                <span className={styles.status}>{enumLabel(locale, validation.result)}</span>
              </div>
              <p>{validation.evidence.summary}</p>
            </Card>
            <div className={styles.columns}>
              <Card title={choose(locale, 'Reconciliation handoff', 'إحالة المطابقة')}>
                <div className={styles.note}>
                  {choose(
                    locale,
                    'A handoff requests a controlled review. It does not alter trainee completions or authorize corrections. Those decisions remain separate.',
                    'تطلب الإحالة مراجعة منضبطة. ولا تغيّر إنجازات المتدرب أو تجيز تصحيحها؛ فهذه قرارات منفصلة.',
                  )}
                </div>
                {validation.result === 'PASS' &&
                canHandoff &&
                (handoffs?.data?.length ?? 0) === 0 ? (
                  <OperationsCommandForm kind="handoff" locale={locale} reference={validationRef} />
                ) : (
                  <p>
                    {choose(
                      locale,
                      'A new handoff requires a passed validation, the correct scope, and no existing handoff.',
                      'تتطلب الإحالة الجديدة تحققاً ناجحاً وصلاحية مناسبة وألا توجد إحالة مسبقة.',
                    )}
                  </p>
                )}
              </Card>
              <Card title={choose(locale, 'Recorded handoffs', 'الإحالات المسجلة')}>
                {!handoffs?.data?.length ? (
                  <p>{choose(locale, 'No handoff has been recorded.', 'لم تُسجل أي إحالة بعد.')}</p>
                ) : (
                  <ul className={styles.list}>
                    {handoffs.data.map((handoff) => (
                      <li key={handoff.handoff_ref}>
                        <div className={styles.row}>
                          <Reference value={handoff.handoff_ref} />
                          <span className={styles.status}>{enumLabel(locale, handoff.status)}</span>
                        </div>
                        <div className={styles.meta}>
                          <Stamp date={handoff.created_at} locale={locale} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}
