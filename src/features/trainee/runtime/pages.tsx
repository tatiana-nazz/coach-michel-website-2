import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/i18n/config';
import { websiteLocale } from '@/features/website/locale';
import { requireWorkspaceAccess } from '@/features/workspace/access';
import { WorkspaceShell } from '@/features/workspace/workspace-shell';
import { CompletionForm, RefreshStatus, SupportForm } from './actions';
import { traineeCopy } from './copy';
import { readTraineeWorkspace } from './data';
import {
  canSubmitCompletion,
  completionPresentation,
  formatSessionDate,
  sessionPath,
} from './model';
import type { TraineeSession, TraineeWorkspaceData } from './types';
import styles from './trainee.module.css';

type PageKind =
  | 'today'
  | 'sessions'
  | 'sequence'
  | 'exercise'
  | 'completion'
  | 'confirmation'
  | 'account'
  | 'support';

function Badge({ session, locale }: { session: TraineeSession; locale: SupportedLocale }) {
  const state = completionPresentation(session);
  return (
    <span className={styles.badge} data-state={state}>
      {traineeCopy[locale][state]}
    </span>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className={`${styles.card} ${styles.empty}`}>
      <span className={styles.emptyIcon} aria-hidden="true">
        ↗
      </span>
      <h2>{title}</h2>
      <p>{body}</p>
      {children ? <div className={styles.actions}>{children}</div> : null}
    </section>
  );
}

function SupportCard({ locale }: { locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  return (
    <aside className={styles.card}>
      <h2>{c.helpTitle}</h2>
      <p>{c.helpBody}</p>
      <Link className={styles.link} href="/trainee/support">
        {c.helpLink} <span aria-hidden="true">↗</span>
      </Link>
    </aside>
  );
}

function Today({ data, locale }: { data: TraineeWorkspaceData; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  const ready = data.sessions.filter((session) => completionPresentation(session) === 'available');
  const next = ready[0];
  return (
    <div className={styles.stack}>
      <div className={styles.grid}>
        {next ? (
          <section className={`${styles.card} ${styles.hero}`}>
            <div className={styles.orbit} aria-hidden="true" />
            <span className={styles.eyebrow}>{c.nextSession}</span>
            <h2>{next.title}</h2>
            <p>{next.description || c.sequenceDescription}</p>
            <p>
              {formatSessionDate(next.scheduledFor, locale)} · {next.exercises.length}{' '}
              {c.exerciseCount}
            </p>
            <Link className={styles.button} href={sessionPath(next.scheduleRef)}>
              {c.viewSession}
              <span aria-hidden="true">↗</span>
            </Link>
          </section>
        ) : (
          <Empty
            title={data.sessions.length ? c.noNext : c.emptyTitle}
            body={data.sessions.length ? c.noNextBody : c.emptyBody}
          >
            <Link className={styles.button} href="/trainee/sessions">
              {c.allSessions}
            </Link>
          </Empty>
        )}
        <SupportCard locale={locale} />
      </div>
      <div className={styles.metrics}>
        {[
          [data.sessions.length, c.sessionsLabel],
          [data.completions.length, c.completeLabel],
          [ready.length, c.readyLabel],
        ].map(([value, label]) => (
          <div className={styles.metric} key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className={styles.card}>
        <div className={styles.row}>
          <h2>{c.latest}</h2>
          <Link href="/trainee/sessions" className={styles.link}>
            {c.allSessions}
          </Link>
        </div>
        {data.completions.length ? (
          <ul className={styles.list}>
            {data.completions.slice(0, 5).map((completion) => (
              <li key={completion.ref}>
                <div className={styles.row}>
                  <div>
                    <h3>
                      {
                        data.sessions.find(
                          (session) => session.scheduleRef === completion.scheduleRef,
                        )?.title
                      }
                    </h3>
                    <p>{formatSessionDate(completion.completedAt, locale)}</p>
                  </div>
                  <Link
                    className={styles.link}
                    href={`/trainee/completions/${encodeURIComponent(completion.ref)}`}
                  >
                    {c.confirmed}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>{c.noneCompleted}</p>
        )}
      </section>
    </div>
  );
}

function Sessions({ data, locale }: { data: TraineeWorkspaceData; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  if (!data.sessions.length)
    return (
      <Empty title={c.emptyTitle} body={c.emptyBody}>
        <Link className={styles.button} href="/trainee/support">
          {c.helpLink}
        </Link>
      </Empty>
    );
  return (
    <div className={styles.sessionGrid}>
      {data.sessions.map((session) => (
        <article className={`${styles.card} ${styles.sessionCard}`} key={session.scheduleRef}>
          <div>
            <Badge session={session} locale={locale} />
          </div>
          <h2>{session.title}</h2>
          <p>{session.description || c.noDescription}</p>
          <dl className={styles.detailList}>
            <div>
              <dt>{c.date}</dt>
              <dd>{formatSessionDate(session.scheduledFor, locale)}</dd>
            </div>
            <div>
              <dt>{c.exercises}</dt>
              <dd>{session.released ? session.exercises.length : '—'}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            <Link className={styles.button} href={sessionPath(session.scheduleRef)}>
              {c.viewSession}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function SessionSummary({ session, locale }: { session: TraineeSession; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  return (
    <section className={styles.card}>
      <Badge session={session} locale={locale} />
      <h2 style={{ marginTop: 20 }}>{session.title}</h2>
      <p>{session.description || c.noDescription}</p>
      <dl className={styles.detailList}>
        <div>
          <dt>{c.date}</dt>
          <dd>{formatSessionDate(session.scheduledFor, locale)}</dd>
        </div>
        <div>
          <dt>{c.exercises}</dt>
          <dd>{session.released ? session.exercises.length : '—'}</dd>
        </div>
      </dl>
    </section>
  );
}

function Sequence({ session, locale }: { session: TraineeSession; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  return (
    <div className={styles.stack}>
      <Link href="/trainee/sessions" className={styles.link}>
        {c.backSessions}
      </Link>
      <div className={styles.grid}>
        <div className={styles.stack}>
          <SessionSummary session={session} locale={locale} />
          {!session.released ? (
            <div className={styles.feedback} role="status">
              {c.unreleased}
            </div>
          ) : session.exercises.length ? (
            <ol className={styles.sequence}>
              {session.exercises.map((exercise) => (
                <li key={exercise.ref}>
                  <span className={styles.number} aria-hidden="true">
                    {String(exercise.order).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>{exercise.available ? exercise.title : c.exercise}</h3>
                    {exercise.available ? (
                      <>
                        <p>
                          {[
                            exercise.sets && `${exercise.sets} ${c.sets}`,
                            exercise.reps && `${exercise.reps} ${c.reps}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <Link
                          className={styles.link}
                          href={`/trainee/sessions/${encodeURIComponent(session.scheduleRef)}/exercises/${encodeURIComponent(exercise.ref)}`}
                        >
                          {c.viewGuidance}
                          <span aria-hidden="true"> ↗</span>
                        </Link>
                      </>
                    ) : (
                      <p>{c.contentUnavailable}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.feedback} role="status">
              {c.noExercises}
            </div>
          )}
          {canSubmitCompletion(session) ? (
            <Link className={styles.button} href={sessionPath(session.scheduleRef, 'completion')}>
              {c.finish}
            </Link>
          ) : session.completionRef || session.intentRef ? (
            <Link
              className={styles.button}
              href={`/trainee/completions/${encodeURIComponent(session.completionRef || session.scheduleRef)}`}
            >
              {c.checkStatus}
            </Link>
          ) : null}
        </div>
        <SupportCard locale={locale} />
      </div>
    </div>
  );
}

function Exercise({
  session,
  exerciseRef,
  locale,
}: {
  session: TraineeSession;
  exerciseRef: string;
  locale: SupportedLocale;
}) {
  const c = traineeCopy[locale];
  const exercise = session.exercises.find((item) => item.ref === exerciseRef);
  if (!exercise || !session.released) notFound();
  return (
    <div className={styles.stack}>
      <Link href={sessionPath(session.scheduleRef)} className={styles.link}>
        {c.backSequence}
      </Link>
      <div className={styles.grid}>
        <section className={styles.card}>
          <span className={styles.eyebrow}>
            {session.title} / {String(exercise.order).padStart(2, '0')}
          </span>
          <h2 style={{ marginTop: 20 }}>{exercise.available ? exercise.title : c.exercise}</h2>
          {exercise.available ? (
            <>
              <p>{exercise.description}</p>
              {locale !== exercise.contentLocale && (
                <p className={styles.feedback}>{c.englishContent}</p>
              )}
              <dl className={styles.exerciseFacts}>
                <div>
                  <dt>{c.sets}</dt>
                  <dd>{exercise.sets || c.notSpecified}</dd>
                </div>
                <div>
                  <dt>{c.reps}</dt>
                  <dd>{exercise.reps || c.notSpecified}</dd>
                </div>
                <div>
                  <dt>{c.rest}</dt>
                  <dd>{exercise.rest ? `${exercise.rest} ${c.seconds}` : c.notSpecified}</dd>
                </div>
              </dl>
              <h3>{c.instructions}</h3>
              {exercise.instructions.length ? (
                <ol className={styles.instructions}>
                  {exercise.instructions.map((line, index) => (
                    <li
                      key={index}
                      dir={exercise.contentLocale === 'ar' ? 'rtl' : 'ltr'}
                      lang={exercise.contentLocale}
                    >
                      {line}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.feedback}>{c.noInstructions}</p>
              )}
            </>
          ) : (
            <p role="status" className={styles.feedback}>
              {c.contentUnavailable}
            </p>
          )}
        </section>
        <SupportCard locale={locale} />
      </div>
    </div>
  );
}

function Completion({ session, locale }: { session: TraineeSession; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  return (
    <div className={styles.stack}>
      <Link href={sessionPath(session.scheduleRef)} className={styles.link}>
        {c.backSequence}
      </Link>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>{session.title}</h2>
          {canSubmitCompletion(session) ? (
            <CompletionForm locale={locale} scheduleRef={session.scheduleRef} />
          ) : (
            <>
              <p>{c.unavailable}</p>
              <Link
                className={styles.button}
                href={`/trainee/completions/${encodeURIComponent(session.completionRef || session.scheduleRef)}`}
              >
                {c.checkStatus}
              </Link>
            </>
          )}
        </section>
        <SupportCard locale={locale} />
      </div>
    </div>
  );
}

function Confirmation({
  data,
  reference,
  locale,
}: {
  data: TraineeWorkspaceData;
  reference: string;
  locale: SupportedLocale;
}) {
  const c = traineeCopy[locale];
  const session = data.sessions.find(
    (item) =>
      item.scheduleRef === reference ||
      item.completionRef === reference ||
      item.intentRef === reference,
  );
  const completion = data.completions.find(
    (item) => item.ref === reference || item.scheduleRef === session?.scheduleRef,
  );
  const pending = Boolean(session?.intentRef) && !completion;
  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.empty}`}>
        <span className={styles.emptyIcon} aria-hidden="true">
          {completion ? '✓' : '↻'}
        </span>
        <div role="status">
          <h2>{completion ? c.saved : pending ? c.pendingTitle : c.noRecord}</h2>
          <p>{completion ? c.savedBody : pending ? c.pendingBody : c.noRecordBody}</p>
        </div>
        {session ? (
          <p>
            <strong>{session.title}</strong>
          </p>
        ) : null}
        {completion ? (
          <dl className={styles.detailList}>
            <div>
              <dt>{c.completedAt}</dt>
              <dd>{formatSessionDate(completion.completedAt, locale)}</dd>
            </div>
            <div>
              <dt>{c.reference}</dt>
              <dd>
                <bdi className={styles.reference}>{completion.ref}</bdi>
              </dd>
            </div>
          </dl>
        ) : null}
        <div className={styles.actions}>
          <Link href="/trainee/sessions" className={styles.button}>
            {c.backSessions}
          </Link>
          {!completion ? <RefreshStatus locale={locale} /> : null}
        </div>
      </section>
      <SupportCard locale={locale} />
    </div>
  );
}

function Account({ data, locale }: { data: TraineeWorkspaceData; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  return (
    <div className={styles.grid}>
      <div className={styles.stack}>
        <section className={styles.card}>
          <h2>{c.profile}</h2>
          <dl className={styles.detailList}>
            <div>
              <dt>{c.name}</dt>
              <dd>{data.displayName || c.noName}</dd>
            </div>
            <div>
              <dt>{c.reference}</dt>
              <dd>
                <bdi className={styles.reference}>{data.accountRef || '—'}</bdi>
              </dd>
            </div>
          </dl>
        </section>
        <section className={styles.card}>
          <h2>{c.language}</h2>
          <p>{c.languageHelp}</p>
          <div className={styles.language}>
            <a
              href="/language?locale=en&next=/trainee/account"
              className={styles.secondary}
              aria-current={locale === 'en' ? 'true' : undefined}
              lang="en"
            >
              English
            </a>
            <a
              href="/language?locale=ar&next=/trainee/account"
              className={styles.secondary}
              aria-current={locale === 'ar' ? 'true' : undefined}
              lang="ar"
            >
              العربية
            </a>
          </div>
        </section>
      </div>
      <section className={styles.card}>
        <h2>{c.notices}</h2>
        <p>{c.noticesBody}</p>
        <Link href="/access/notices" className={styles.button}>
          {c.reviewNotices}
        </Link>
        <div className={styles.actions}>
          <form action="/access/logout" method="post">
            <button type="submit" className={styles.secondary}>
              {c.signOut}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function supportStatus(status: string, locale: SupportedLocale): string {
  const c = traineeCopy[locale];
  if (['OPEN', 'RECEIVED', 'SUBMITTED', 'QUEUED'].includes(status)) return c.requestReceived;
  if (['IN_PROGRESS', 'ROUTED', 'ESCALATED'].includes(status)) return c.requestInProgress;
  if (status === 'RESOLVED') return c.requestResolved;
  if (status === 'CLOSED') return c.requestClosed;
  return c.requestOther;
}

function Support({ data, locale }: { data: TraineeWorkspaceData; locale: SupportedLocale }) {
  const c = traineeCopy[locale];
  const categories: Record<string, string> = {
    training: c.training,
    account: c.accountCategory,
    privacy: c.privacy,
    technical: c.technical,
  };
  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <SupportForm locale={locale} />
        <p className={styles.muted} style={{ marginTop: 24 }}>
          {c.supportScope}
        </p>
      </section>
      <section className={styles.card}>
        <h2>{c.previousRequests}</h2>
        {data.supportCases.length ? (
          <ul className={styles.list}>
            {data.supportCases.map((item) => (
              <li key={item.ref}>
                <h3>{categories[item.category] || c.support}</h3>
                <p>{formatSessionDate(item.createdAt, locale)}</p>
                <p>
                  {c.reference}: <bdi className={styles.reference}>{item.ref}</bdi>
                </p>
                <span className={styles.badge}>{supportStatus(item.status, locale)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{c.noRequests}</p>
        )}
      </section>
    </div>
  );
}

export async function TraineePage({
  kind,
  sessionRef,
  exerciseRef,
  completionRef,
}: {
  kind: PageKind;
  sessionRef?: string;
  exerciseRef?: string;
  completionRef?: string;
}) {
  const [access, locale] = await Promise.all([
    requireWorkspaceAccess('trainee', { requireNotices: !['account', 'support'].includes(kind) }),
    websiteLocale(),
  ]);
  const data = await readTraineeWorkspace(access.supabase, access.principalId, locale);
  const c = traineeCopy[locale];
  const session = data.sessions.find((item) => item.scheduleRef === sessionRef);
  if (['sequence', 'exercise', 'completion'].includes(kind) && !session) notFound();
  const basePath =
    kind === 'today'
      ? '/trainee/today'
      : kind === 'account'
        ? '/trainee/account'
        : kind === 'support'
          ? '/trainee/support'
          : '/trainee/sessions';
  const content =
    kind === 'today' ? (
      <Today data={data} locale={locale} />
    ) : kind === 'sessions' ? (
      <Sessions data={data} locale={locale} />
    ) : kind === 'sequence' && session ? (
      <Sequence session={session} locale={locale} />
    ) : kind === 'exercise' && session ? (
      <Exercise session={session} exerciseRef={exerciseRef ?? ''} locale={locale} />
    ) : kind === 'completion' && session ? (
      <Completion session={session} locale={locale} />
    ) : kind === 'confirmation' ? (
      <Confirmation data={data} reference={completionRef ?? ''} locale={locale} />
    ) : kind === 'account' ? (
      <Account data={data} locale={locale} />
    ) : (
      <Support data={data} locale={locale} />
    );
  return (
    <WorkspaceShell
      locale={locale}
      area="trainee"
      title={c[kind]}
      description={c[`${kind}Description`]}
      path={basePath}
    >
      {content}
    </WorkspaceShell>
  );
}
