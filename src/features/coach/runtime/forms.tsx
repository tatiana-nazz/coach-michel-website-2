'use client';

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SupportedLocale } from '@/i18n/config';
import { browserApiClient } from '@/platform/api/browser-client';
import type { ApiFailure, ApiRequest } from '@/platform/api/client';
import {
  collection,
  row,
  textValue,
  type CoachData,
  type CoachItem,
  type RecordRow,
} from './types';
import { draftBody, formText as readText } from './commands';
import s from './coach.module.css';

type LocaleProps = { locale: SupportedLocale };
const label = (locale: SupportedLocale, en: string, ar: string) => (locale === 'ar' ? ar : en);
export function apiFailureMessage(error: ApiFailure, locale: SupportedLocale): string {
  if (error.kind === 'unauthorized')
    return label(
      locale,
      'Your session ended. Sign in again before retrying.',
      'انتهت جلستك. سجّل الدخول مجدداً قبل إعادة المحاولة.',
    );
  if (error.kind === 'forbidden')
    return label(
      locale,
      'Your current access does not allow this action for this record.',
      'صلاحياتك الحالية لا تسمح بهذا الإجراء على هذا السجل.',
    );
  if (error.kind === 'conflict')
    return label(
      locale,
      'This record changed or the action was already applied. Refresh and review the current version.',
      'تغيّر هذا السجل أو تم تطبيق الإجراء مسبقاً. حدّث الصفحة وراجع النسخة الحالية.',
    );
  if (error.kind === 'validation')
    return label(
      locale,
      'Check the required fields and the selected records, then retry.',
      'تحقق من الحقول المطلوبة والسجلات المحددة ثم أعد المحاولة.',
    );
  if (error.kind === 'not-found')
    return label(
      locale,
      'This record is unavailable within your access.',
      'هذا السجل غير متاح ضمن صلاحياتك.',
    );
  return label(
    locale,
    'We could not confirm the change. Your form is preserved; refresh the record before retrying.',
    'تعذر تأكيد التغيير. احتُفظ ببيانات النموذج؛ حدّث السجل قبل إعادة المحاولة.',
  );
}
function useCommand(locale: SupportedLocale) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  async function execute(request: ApiRequest, success: string): Promise<RecordRow | null> {
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const result = await browserApiClient.execute<RecordRow>(request);
      if (!result.ok) {
        setFeedback({ error: true, text: apiFailureMessage(result.error, locale) });
        return null;
      }
      setFeedback({ error: false, text: success });
      router.refresh();
      return row(result.data);
    } catch {
      setFeedback({ error: true, text: apiFailureMessage({ kind: 'network' }, locale) });
      return null;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return { execute, busy, feedback, clear: () => setFeedback(null) };
}
function Feedback({ value }: { value: { error: boolean; text: string } | null }) {
  return value ? (
    <div className={s.feedback} data-error={value.error} role={value.error ? 'alert' : 'status'}>
      {value.text}
    </div>
  ) : null;
}
function Field({
  title,
  name,
  value,
  required = false,
  type = 'text',
  maxLength = 200,
  min,
  max,
  hint,
}: {
  title: string;
  name: string;
  value?: string | number;
  required?: boolean;
  type?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className={s.field} htmlFor={id}>
      <span>{title}</span>
      <input
        id={id}
        name={name}
        defaultValue={value}
        required={required}
        type={type}
        maxLength={maxLength}
        minLength={name === 'title' ? 2 : undefined}
        min={min}
        max={max}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  );
}
function Textarea({
  title,
  name,
  value,
  required = false,
  hint,
}: {
  title: string;
  name: string;
  value?: string;
  required?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className={s.field} htmlFor={id}>
      <span>{title}</span>
      <textarea
        id={id}
        name={name}
        defaultValue={value}
        required={required}
        maxLength={name === 'reason' ? 2000 : name === 'body' ? 16000 : 6000}
        minLength={name === 'reason' ? 3 : name === 'body' ? 20 : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  );
}
function Submit({ busy, children, locale }: { busy: boolean; children: ReactNode } & LocaleProps) {
  return (
    <button className={s.button} type="submit" disabled={busy}>
      {busy ? label(locale, 'Saving…', 'جارٍ الحفظ…') : children}
    </button>
  );
}

export function DraftForm({
  locale,
  kind,
  existing,
  exercises = [],
}: LocaleProps & {
  kind: 'program' | 'session' | 'content';
  existing?: CoachItem;
  exercises?: CoachItem[];
}) {
  const command = useCommand(locale);
  const initialExercises = collection(existing?.extra.exercises);
  const [selected, setSelected] = useState<string[]>(
    initialExercises.map((item) => textValue(item.exerciseRef)),
  );
  const [created, setCreated] = useState<string>('');
  const body = row(existing?.extra.body);
  const instructions = Array.isArray(body.instructions)
    ? body.instructions.filter((item) => typeof item === 'string').join('\n')
    : textValue(body.instructions) || textValue(body.body);
  const editing = Boolean(existing);
  const id = useId();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const payload = draftBody(values, kind, selected, existing);
    const operationId =
      kind === 'content'
        ? `p3s11_apin_027_${editing ? 'revise' : 'create'}_content_draft`
        : `p3s11_apin_025_${editing ? 'revise' : 'create'}_${kind}_draft`;
    const result = await command.execute(
      {
        operationId,
        body: payload,
        ...(existing ? { pathParams: { draft_ref: existing.versionRef } } : {}),
      },
      label(
        locale,
        'Draft saved. It is not visible to trainees until it is released or published.',
        'تم حفظ المسودة. لن تظهر للمتدربين حتى يتم إصدارها أو نشرها.',
      ),
    );
    if (result) setCreated(textValue(result.sessionRef));
  }
  return (
    <form className={s.form} onSubmit={submit} aria-busy={command.busy}>
      <fieldset disabled={command.busy}>
        <Field
          name="title"
          title={label(locale, 'Title', 'العنوان')}
          value={existing?.title ?? ''}
          required
          maxLength={160}
        />
        <Textarea
          name="description"
          title={label(locale, 'Description', 'الوصف')}
          value={existing?.description ?? ''}
          required
        />
        {kind === 'session' && (
          <>
            <Field
              name="durationMinutes"
              title={label(locale, 'Planned duration (minutes)', 'المدة المخططة (دقائق)')}
              type="number"
              required
              min={1}
              max={480}
              value={
                typeof row(existing?.extra.definition).durationMinutes === 'number'
                  ? Number(row(existing?.extra.definition).durationMinutes)
                  : ''
              }
            />
            <div>
              <p id={`${id}-exercises`}>
                {label(
                  locale,
                  'Exercises · in the order you select them',
                  'التمارين · بحسب ترتيب اختيارك',
                )}
              </p>
              {exercises.length ? (
                <div className={s.checkList} role="group" aria-labelledby={`${id}-exercises`}>
                  {exercises.map((exercise) => (
                    <div key={exercise.ref}>
                      <label className={s.check}>
                        <input
                          type="checkbox"
                          checked={selected.includes(exercise.ref)}
                          onChange={(event) =>
                            setSelected((current) =>
                              event.target.checked
                                ? [...current, exercise.ref]
                                : current.filter((ref) => ref !== exercise.ref),
                            )
                          }
                        />
                        <span>
                          {exercise.title} <small>({exercise.status})</small>
                        </span>
                      </label>
                      {selected.includes(exercise.ref) && (
                        <div className={`${s.fields} ${s.exerciseFields}`}>
                          <Field
                            name={`${exercise.ref}-sets`}
                            title={label(locale, 'Sets', 'الجولات')}
                            type="number"
                            required
                            min={1}
                            max={100}
                            value={textValue(
                              String(
                                row(
                                  initialExercises.find((item) => item.exerciseRef === exercise.ref)
                                    ?.configuration,
                                ).sets ?? '',
                              ),
                            )}
                          />
                          <Field
                            name={`${exercise.ref}-reps`}
                            title={label(locale, 'Repetitions', 'التكرارات')}
                            required
                            maxLength={100}
                            value={textValue(
                              String(
                                row(
                                  initialExercises.find((item) => item.exerciseRef === exercise.ref)
                                    ?.configuration,
                                ).reps ?? '',
                              ),
                            )}
                          />
                          <Field
                            name={`${exercise.ref}-restSeconds`}
                            title={label(locale, 'Rest (seconds)', 'الراحة (ثوانٍ)')}
                            type="number"
                            required
                            min={0}
                            max={3600}
                            value={textValue(
                              String(
                                row(
                                  initialExercises.find((item) => item.exerciseRef === exercise.ref)
                                    ?.configuration,
                                ).restSeconds ?? '',
                              ),
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={s.note}>
                  {label(
                    locale,
                    'Create an exercise in the catalogue before assembling a session.',
                    'أنشئ تمريناً في المكتبة قبل إعداد الجلسة.',
                  )}
                </p>
              )}
            </div>
          </>
        )}
        {kind === 'content' && (
          <>
            <label className={s.field}>
              {label(locale, 'Content language', 'لغة المحتوى')}
              <select
                name="locale"
                defaultValue={textValue(existing?.extra.locale) || locale}
                disabled={Boolean(existing)}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
              {existing && (
                <input
                  type="hidden"
                  name="locale"
                  value={textValue(existing.extra.locale) || locale}
                />
              )}
            </label>
            <Textarea
              name="instructions"
              title={label(locale, 'Step-by-step instructions', 'التعليمات خطوة بخطوة')}
              value={instructions}
              required
              hint={label(
                locale,
                'Write one instruction per line. Include any coaching precautions that apply.',
                'اكتب كل تعليمة في سطر مستقل وأضف الاحتياطات المناسبة.',
              )}
            />
            <Field
              name="videoUrl"
              type="url"
              title={label(locale, 'Guidance video URL (optional)', 'رابط فيديو الشرح (اختياري)')}
              value={textValue(body.videoUrl)}
              maxLength={2000}
            />
          </>
        )}
        <Textarea
          name="reason"
          title={label(locale, 'Reason for this version', 'سبب إنشاء هذه النسخة')}
          required
        />
        <div className={s.actions}>
          <Submit busy={command.busy} locale={locale}>
            {label(
              locale,
              editing ? 'Save new version' : 'Create draft',
              editing ? 'حفظ نسخة جديدة' : 'إنشاء مسودة',
            )}
          </Submit>
        </div>
      </fieldset>
      <Feedback value={command.feedback} />
      {created && (
        <Link className={s.link} href={`/coach/sessions/${encodeURIComponent(created)}/prepare`}>
          {label(locale, 'Open session preparation →', 'فتح إعداد الجلسة ←')}
        </Link>
      )}
    </form>
  );
}

export function ReleaseForm({
  locale,
  trainees,
  sessions,
}: LocaleProps & { trainees: CoachItem[]; sessions: CoachItem[] }) {
  const command = useCommand(locale);
  const businessIntent = useRef<string | null>(null);
  const [released, setReleased] = useState(false);
  const [preview, setPreview] = useState<{
    payload: RecordRow;
    trainee: string;
    session: string;
    date: string;
  } | null>(null);
  const available = sessions.filter((item) => item.versionRef && item.status !== 'ARCHIVED');
  async function previewRelease(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (released) return;
    const values = new FormData(event.currentTarget);
    const date = new Date(readText(values, 'scheduledFor'));
    if (!Number.isFinite(date.getTime())) return;
    const payload = {
      traineeRef: readText(values, 'traineeRef'),
      sessionVersionRef: readText(values, 'sessionVersionRef'),
      scheduledFor: date.toISOString(),
      reason: readText(values, 'reason'),
      businessIntentRef: businessIntent.current ?? (businessIntent.current = crypto.randomUUID()),
    };
    const result = await command.execute(
      { operationId: 'p3s11_apin_029_post_1', body: payload },
      label(
        locale,
        'Preview checked. Review the details before releasing.',
        'تم فحص المعاينة. راجع التفاصيل قبل الإصدار.',
      ),
    );
    if (result)
      setPreview({
        payload,
        trainee:
          trainees.find((item) => item.ref === payload.traineeRef)?.title ?? payload.traineeRef,
        session:
          available.find((item) => item.versionRef === payload.sessionVersionRef)?.title ??
          payload.sessionVersionRef,
        date: payload.scheduledFor,
      });
  }
  async function release() {
    if (!preview) return;
    const result = await command.execute(
      { operationId: 'p3s11_apin_030_post_1', body: preview.payload },
      label(
        locale,
        'Released. The assigned trainee can now see this session.',
        'تم الإصدار. يمكن للمتدرب المحدد الآن مشاهدة هذه الجلسة.',
      ),
    );
    if (result) {
      setPreview(null);
      setReleased(true);
    }
  }
  if (!trainees.length || !available.length)
    return (
      <p className={s.note}>
        {label(
          locale,
          'A trainee and a saved session are required before you can schedule a release.',
          'يلزم وجود متدرب وجلسة محفوظة قبل جدولة الإصدار.',
        )}
      </p>
    );
  return (
    <div className={s.stack}>
      <form
        className={s.form}
        onSubmit={previewRelease}
        onChange={() => {
          setPreview(null);
          setReleased(false);
          businessIntent.current = null;
          command.clear();
        }}
        aria-busy={command.busy}
      >
        <fieldset disabled={command.busy}>
          <label className={s.field}>
            {label(locale, 'Trainee', 'المتدرب')}
            <select name="traineeRef" required defaultValue="">
              <option value="" disabled>
                {label(locale, 'Choose a trainee', 'اختر متدرباً')}
              </option>
              {trainees.map((item) => (
                <option key={item.ref} value={item.ref}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className={s.field}>
            {label(locale, 'Session version', 'نسخة الجلسة')}
            <select name="sessionVersionRef" required defaultValue="">
              <option value="" disabled>
                {label(locale, 'Choose a saved session', 'اختر جلسة محفوظة')}
              </option>
              {available.map((item) => (
                <option key={item.ref} value={item.versionRef}>
                  {item.title} · v{item.version}
                </option>
              ))}
            </select>
          </label>
          <Field
            name="scheduledFor"
            type="datetime-local"
            title={label(locale, 'Session date and time', 'تاريخ الجلسة ووقتها')}
            required
            hint={label(
              locale,
              'Uses your browser’s local time. The preview includes the full date and time zone.',
              'يستخدم التوقيت المحلي لمتصفحك. تعرض المعاينة التاريخ والمنطقة الزمنية.',
            )}
          />
          <Textarea name="reason" title={label(locale, 'Release reason', 'سبب الإصدار')} required />
          <button className={s.button} type="submit" disabled={command.busy || released}>
            {label(
              locale,
              command.busy ? 'Checking…' : released ? 'Session released' : 'Check release preview',
              command.busy ? 'جارٍ الفحص…' : released ? 'تم إصدار الجلسة' : 'فحص معاينة الإصدار',
            )}
          </button>
        </fieldset>
      </form>
      {preview && (
        <div className={s.preview}>
          <strong>{label(locale, 'Ready for your review', 'جاهز لمراجعتك')}</strong>
          <p>
            {preview.trainee} · {preview.session}
          </p>
          <p>
            {new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' }).format(
              new Date(preview.date),
            )}
          </p>
          <p>{textValue(preview.payload.reason)}</p>
          <p>
            {label(
              locale,
              'Releasing creates an assignment that becomes visible to this trainee.',
              'ينشئ الإصدار تكليفاً يظهر لهذا المتدرب.',
            )}
          </p>
          <button className={s.button} disabled={command.busy} onClick={release}>
            {label(
              locale,
              command.busy ? 'Releasing…' : 'Confirm and release',
              command.busy ? 'جارٍ الإصدار…' : 'تأكيد وإصدار',
            )}
          </button>
        </div>
      )}
      <Feedback value={command.feedback} />
    </div>
  );
}

export function DecisionForm({
  locale,
  kind,
  item,
}: LocaleProps & {
  kind: 'content' | 'disclosure' | 'policy' | 'reconciliation';
  item: CoachItem;
}) {
  const command = useCommand(locale);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = {
      ...(kind === 'reconciliation'
        ? { proposalRef: item.versionRef }
        : { versionRef: item.versionRef }),
      decision: readText(values, 'decision'),
      reason: readText(values, 'reason'),
    };
    await command.execute(
      {
        operationId:
          kind === 'content' || kind === 'disclosure'
            ? 'p3s11_apin_028_post_1'
            : kind === 'policy'
              ? 'p3s11_apin_037_post_1'
              : 'p3s11_apin_034_post_1',
        body,
        ...(kind === 'reconciliation' ? { pathParams: { case_ref: item.ref } } : {}),
      },
      label(
        locale,
        'Decision recorded. The current record has been refreshed.',
        'تم تسجيل القرار وتحديث السجل الحالي.',
      ),
    );
  }
  return (
    <form className={s.form} onSubmit={submit} aria-busy={command.busy}>
      <fieldset disabled={command.busy}>
        <label className={s.field}>
          {label(locale, 'Decision', 'القرار')}
          <select name="decision" defaultValue="" required>
            <option disabled value="">
              {label(locale, 'Choose a decision', 'اختر قراراً')}
            </option>
            <option value="APPROVE">
              {label(
                locale,
                kind === 'content' ? 'Approve and publish' : 'Approve',
                kind === 'content' ? 'موافقة ونشر' : 'موافقة',
              )}
            </option>
            <option value="DENY">{label(locale, 'Deny', 'رفض')}</option>
          </select>
        </label>
        <Textarea
          name="reason"
          title={label(locale, 'Decision rationale', 'مبررات القرار')}
          required
        />
        <label className={s.check}>
          <input type="checkbox" required />
          <span>
            {label(
              locale,
              kind === 'reconciliation'
                ? 'I reviewed the proposed correction and its evidence. I did not author this proposal.'
                : 'I reviewed this exact version and understand that approval makes it effective.',
              kind === 'reconciliation'
                ? 'راجعت التصحيح المقترح وأدلته ولست منشئ هذا المقترح.'
                : 'راجعت هذه النسخة وأفهم أن الموافقة تجعلها نافذة.',
            )}
          </span>
        </label>
        <Submit busy={command.busy} locale={locale}>
          {label(locale, 'Record decision', 'تسجيل القرار')}
        </Submit>
      </fieldset>
      <Feedback value={command.feedback} />
    </form>
  );
}

export function CorrectionForm({
  locale,
  completions,
  existing,
}: LocaleProps & { completions: CoachItem[]; existing?: CoachItem }) {
  const command = useCommand(locale);
  const [created, setCreated] = useState('');
  const proposal = row(existing?.extra.proposal);
  const defaultRef = textValue(proposal.completionRef);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const completionRef = readText(values, 'completionRef');
    const current = completions.find((item) => item.ref === completionRef);
    const updatedProposal = {
      completionRef,
      expectedVersion: current?.version ?? Number(proposal.expectedVersion),
      newState: { status: readText(values, 'status'), note: readText(values, 'note') },
    };
    const result = await command.execute(
      {
        operationId: existing ? 'p3s11_apin_033_update_proposal' : 'p3s11_apin_032_post_1',
        body: {
          reason: readText(values, 'reason'),
          proposal: updatedProposal,
          ...(existing
            ? { expectedVersion: existing.version }
            : { affectedReferences: [completionRef] }),
        },
        ...(existing ? { pathParams: { case_ref: existing.ref } } : {}),
      },
      label(
        locale,
        'Proposal saved for independent review. The recorded completion has not changed.',
        'حُفظ المقترح للمراجعة المستقلة. لم يتغير سجل الإكمال.',
      ),
    );
    if (result) setCreated(textValue(result.caseRef));
  }
  if (!existing && !completions.length)
    return (
      <p className={s.note}>
        {label(
          locale,
          'A recorded completion is required to open a correction.',
          'يلزم وجود إكمال مسجل لفتح طلب تصحيح.',
        )}
      </p>
    );
  return (
    <form className={s.form} onSubmit={submit} aria-busy={command.busy}>
      <fieldset disabled={command.busy}>
        {existing ? (
          <>
            <input name="completionRef" type="hidden" value={defaultRef} />
            <p className={s.reference}>
              <bdi>{defaultRef}</bdi>
            </p>
          </>
        ) : (
          <label className={s.field}>
            {label(locale, 'Completion record', 'سجل الإكمال')}
            <select name="completionRef" required defaultValue="">
              <option disabled value="">
                {label(locale, 'Choose a record', 'اختر سجلاً')}
              </option>
              {completions.map((item) => (
                <option key={item.ref} value={item.ref}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={s.field}>
          {label(locale, 'Proposed state', 'الحالة المقترحة')}
          <select
            name="status"
            required
            defaultValue={textValue(row(proposal.newState).status) || ''}
          >
            <option disabled value="">
              {label(locale, 'Choose a state', 'اختر الحالة')}
            </option>
            <option value="COMPLETED">{label(locale, 'Completed', 'مكتمل')}</option>
            <option value="VOIDED">{label(locale, 'Voided', 'ملغى')}</option>
          </select>
        </label>
        <Textarea
          name="note"
          title={label(locale, 'Proposed completion note', 'ملاحظة الإكمال المقترحة')}
          value={textValue(row(proposal.newState).note)}
        />
        <Textarea
          name="reason"
          title={label(locale, 'Reason and supporting evidence', 'السبب والأدلة الداعمة')}
          required
        />
        <Submit busy={command.busy} locale={locale}>
          {label(locale, 'Save correction proposal', 'حفظ مقترح التصحيح')}
        </Submit>
      </fieldset>
      <Feedback value={command.feedback} />
      {created && (
        <Link className={s.link} href={`/coach/reconciliation/${encodeURIComponent(created)}`}>
          {label(locale, 'Review correction →', 'مراجعة التصحيح ←')}
        </Link>
      )}
    </form>
  );
}

export function SupportUpdateForm({ locale, item }: LocaleProps & { item: CoachItem }) {
  const command = useCommand(locale);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await command.execute(
      {
        operationId: 'p3s11_apin_039_patch_1',
        pathParams: { case_ref: item.ref },
        body: {
          expectedStatus: item.status,
          status: readText(values, 'status'),
          reason: readText(values, 'reason'),
          evidence: readText(values, 'evidence').split('\n').filter(Boolean),
        },
      },
      label(
        locale,
        'Case updated. No external message has been sent.',
        'تم تحديث الطلب دون إرسال رسالة خارجية.',
      ),
    );
  }
  return (
    <form className={s.form} onSubmit={submit} aria-busy={command.busy}>
      <fieldset disabled={command.busy}>
        <label className={s.field}>
          {label(locale, 'Next status', 'الحالة التالية')}
          <select name="status" required defaultValue="">
            <option disabled value="">
              {label(locale, 'Choose a status', 'اختر حالة')}
            </option>
            <option value="IN_REVIEW">{label(locale, 'In review', 'قيد المراجعة')}</option>
            <option value="ESCALATED">{label(locale, 'Escalated', 'تم التصعيد')}</option>
            <option value="RESOLVED">{label(locale, 'Resolved', 'تم الحل')}</option>
          </select>
        </label>
        <Textarea name="reason" title={label(locale, 'Reason', 'السبب')} required />
        <Textarea
          name="evidence"
          required
          title={label(
            locale,
            'Evidence references (one per line)',
            'مراجع الأدلة (كل مرجع في سطر)',
          )}
        />
        <Submit busy={command.busy} locale={locale}>
          {label(locale, 'Update case', 'تحديث الطلب')}
        </Submit>
      </fieldset>
      <Feedback value={command.feedback} />
    </form>
  );
}

export function ConfigurationDraftForm({
  locale,
  kind,
  existing,
}: LocaleProps & { kind: 'disclosure' | 'policy'; existing?: CoachItem }) {
  const command = useCommand(locale);
  const payload = row(existing?.extra.payload);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body: RecordRow = {
      title: readText(values, 'title'),
      reason: readText(values, 'reason'),
      ...(existing ? { expectedVersion: existing.version } : {}),
    };
    if (kind === 'disclosure')
      Object.assign(body, { body: readText(values, 'body'), locale: readText(values, 'locale') });
    else
      Object.assign(body, {
        timezone: 'UTC',
        maxAdvanceDays: Number(readText(values, 'maxAdvanceDays')),
        allowPastDays: Number(readText(values, 'allowPastDays')),
      });
    await command.execute(
      {
        operationId: `delivery_${existing ? 'revise' : 'create'}_${kind}_draft`,
        body,
        ...(existing ? { pathParams: { draft_ref: existing.versionRef } } : {}),
      },
      label(
        locale,
        'Draft saved for independent review. It is not effective yet.',
        'حُفظت المسودة للمراجعة المستقلة ولم تصبح نافذة بعد.',
      ),
    );
  }
  return (
    <form className={s.form} onSubmit={submit} aria-busy={command.busy}>
      <fieldset disabled={command.busy}>
        <Field
          name="title"
          title={label(locale, 'Title', 'العنوان')}
          required
          maxLength={160}
          value={existing?.title ?? ''}
        />
        {kind === 'disclosure' ? (
          <>
            <label className={s.field}>
              {label(locale, 'Notice language', 'لغة الإشعار')}
              <select
                name="locale"
                disabled={Boolean(existing)}
                defaultValue={textValue(existing?.extra.locale) || locale}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
              {existing && (
                <input
                  type="hidden"
                  name="locale"
                  value={textValue(existing.extra.locale) || locale}
                />
              )}
            </label>
            <Textarea
              name="body"
              title={label(locale, 'Notice text', 'نص الإشعار')}
              required
              value={textValue(row(existing?.extra.body).body)}
              hint={label(
                locale,
                'Use the company’s reviewed privacy, consent or service terms. Write readable paragraphs; this text is shown to account holders.',
                'استخدم إشعار الخصوصية أو الموافقة أو شروط الخدمة التي راجعتها الشركة. اكتب فقرات واضحة؛ سيظهر النص لأصحاب الحسابات.',
              )}
            />
          </>
        ) : (
          <>
            <p className={s.note}>
              {label(
                locale,
                'Scheduling rules use UTC. The session form converts the coach’s local date and time to UTC before checking these limits.',
                'تستخدم قواعد الجدولة التوقيت العالمي UTC. يحوّل نموذج الجلسة التوقيت المحلي للمدرب إلى UTC قبل فحص هذه الحدود.',
              )}
            </p>
            <Field
              name="maxAdvanceDays"
              title={label(
                locale,
                'Maximum scheduling horizon (days)',
                'الحد الأقصى للجدولة مسبقاً (أيام)',
              )}
              type="number"
              min={1}
              max={730}
              required
              value={typeof payload.maxAdvanceDays === 'number' ? payload.maxAdvanceDays : ''}
            />
            <label className={s.field}>
              {label(locale, 'Past scheduling allowance', 'السماح بجدولة تاريخ سابق')}
              <select
                name="allowPastDays"
                required
                defaultValue={
                  typeof payload.allowPastDays === 'number' ? String(payload.allowPastDays) : ''
                }
              >
                <option value="" disabled>
                  {label(locale, 'Choose an allowance', 'اختر المدة المسموحة')}
                </option>
                <option value="0">
                  {label(locale, 'No past scheduling', 'عدم السماح بجدولة سابقة')}
                </option>
                <option value="1">
                  {label(locale, 'Up to one day in the past', 'حتى يوم واحد سابق')}
                </option>
              </select>
            </label>
          </>
        )}
        <Textarea
          name="reason"
          title={label(locale, 'Reason for this version', 'سبب هذه النسخة')}
          required
        />
        <Submit busy={command.busy} locale={locale}>
          {label(
            locale,
            existing ? 'Save new version' : 'Create draft',
            existing ? 'حفظ نسخة جديدة' : 'إنشاء مسودة',
          )}
        </Submit>
      </fieldset>
      <Feedback value={command.feedback} />
    </form>
  );
}

export function GrantForm({
  locale,
  authority,
}: LocaleProps & { authority: NonNullable<CoachData['authority']> }) {
  const command = useCommand(locale);
  const [action, setAction] = useState('GRANT');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body: RecordRow = { action, reason: readText(values, 'reason') };
    for (const key of action === 'GRANT'
      ? ['principalRef', 'roleId', 'capabilityId', 'resourceId', 'objectRef', 'subjectRef']
      : ['grantRef']) {
      const value = readText(values, key);
      if (value) body[key] = value;
    }
    await command.execute(
      { operationId: 'p3s11_apin_035_post_1', body },
      label(locale, 'Authority change recorded.', 'تم تسجيل تغيير الصلاحيات.'),
    );
  }
  return (
    <form className={s.form} onSubmit={submit} aria-busy={command.busy}>
      <fieldset disabled={command.busy}>
        <label className={s.field}>
          {label(locale, 'Authority action', 'إجراء الصلاحية')}
          <select value={action} onChange={(event) => setAction(event.target.value)}>
            <option value="GRANT">
              {label(locale, 'Grant scoped access', 'منح صلاحية محددة')}
            </option>
            <option value="REVOKE_GRANT">{label(locale, 'Revoke a grant', 'إلغاء صلاحية')}</option>
          </select>
        </label>
        {action === 'GRANT' ? (
          <>
            <label className={s.field}>
              {label(locale, 'Existing account', 'حساب موجود')}
              <select name="principalRef" required defaultValue="">
                <option value="" disabled>
                  {label(locale, 'Choose an account', 'اختر حساباً')}
                </option>
                {authority.principals.map((item) => (
                  <option key={item.ref} value={item.ref}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <div className={s.fields}>
              {[
                { name: 'roleId', title: label(locale, 'Role', 'الدور'), options: authority.roles },
                {
                  name: 'capabilityId',
                  title: label(locale, 'Allowed action', 'الإجراء المسموح'),
                  options: authority.capabilities,
                },
                {
                  name: 'resourceId',
                  title: label(locale, 'Resource', 'المورد'),
                  options: authority.resources,
                },
              ].map((field) => (
                <label key={field.name} className={s.field}>
                  {field.title}
                  <select name={field.name} required defaultValue="">
                    <option disabled value="">
                      {label(locale, 'Choose', 'اختر')}
                    </option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} · {option.value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <Field
                name="objectRef"
                title={label(locale, 'Object scope (optional)', 'نطاق السجل (اختياري)')}
              />
              <Field
                name="subjectRef"
                title={label(locale, 'Subject scope (optional)', 'نطاق صاحب السجل (اختياري)')}
              />
            </div>
          </>
        ) : (
          <label className={s.field}>
            {label(locale, 'Active grant', 'الصلاحية النشطة')}
            <select name="grantRef" required defaultValue="">
              <option value="" disabled>
                {label(locale, 'Choose a grant', 'اختر صلاحية')}
              </option>
              {authority.grants.map((item) => (
                <option key={item.ref} value={item.ref}>
                  {item.title} · {item.ref}
                </option>
              ))}
            </select>
          </label>
        )}
        <Textarea
          name="reason"
          title={label(locale, 'Reason for this change', 'سبب هذا التغيير')}
          required
        />
        <label className={s.check}>
          <input type="checkbox" required />
          <span>
            {label(
              locale,
              'I verified the target identity and scope. This action changes access immediately.',
              'تحققت من هوية الحساب ونطاق الصلاحية. يغيّر هذا الإجراء الوصول فوراً.',
            )}
          </span>
        </label>
        <Submit busy={command.busy} locale={locale}>
          {label(locale, 'Apply authority change', 'تطبيق تغيير الصلاحيات')}
        </Submit>
      </fieldset>
      <Feedback value={command.feedback} />
    </form>
  );
}
