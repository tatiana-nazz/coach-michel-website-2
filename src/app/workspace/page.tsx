import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import {
  readAccessContext,
  readEffectiveNotices,
  type AccessContext,
} from '@/platform/auth/access-context';
import { needsNoticeAcceptance, workspaceDestination } from '@/platform/auth/access-policy';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import { FeedbackPanel } from '@/design-system/components/interaction-primitives';
import styles from '@/features/website/access.module.css';

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const locale = await websiteLocale();
  const params = await searchParams;
  const ar = locale === 'ar';
  let context: AccessContext = { status: 'unavailable' };
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    if (
      !error ||
      error.status === 400 ||
      error.status === 401 ||
      error.name === 'AuthSessionMissingError'
    )
      context = await readAccessContext(client, data.user);
  } catch {
    /* A dependency failure must not masquerade as signed-out success. */
  }
  if (context.status === 'anonymous') redirect('/access');
  let destination: string | null = null;
  if (context.status === 'ready') {
    destination = workspaceDestination(context.roleIds);
    if (needsNoticeAcceptance(context.roleIds)) {
      const notices = await readEffectiveNotices(context.supabase, context.principal.id, locale);
      if (!notices.accepted) destination = '/access/notices';
    }
    if (destination && params.state !== 'forbidden' && params.state !== 'unavailable')
      redirect(destination);
  }
  const unavailable = context.status === 'unavailable' || params.state === 'unavailable';
  return (
    <SiteShell locale={locale} path="/workspace">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'مساحتك الخاصة' : 'YOUR PRIVATE WORKSPACE'}</p>
        <h1>
          {unavailable
            ? ar
              ? 'سنحاول مجددًا.'
              : 'Let’s try again.'
            : ar
              ? 'لنجد المساحة المناسبة لك.'
              : 'Let’s find your workspace.'}
        </h1>
        <FeedbackPanel
          tone={unavailable ? 'warning' : 'info'}
          title={
            unavailable
              ? ar
                ? 'الخدمة غير متاحة حاليًا'
                : 'Service temporarily unavailable'
              : ar
                ? 'هذه المساحة غير متاحة لحسابك'
                : 'This area is not available to your account'
          }
        >
          {unavailable
            ? ar
              ? 'تعذّر التحقق من الوصول الآن. حاول مجددًا بعد قليل.'
              : 'We could not verify access right now. Please try again shortly.'
            : ar
              ? 'يحتاج حسابك إلى دعوة وصلاحيات نشطة للوصول. إذا كنت تتوقع الوصول، تواصل مع مدربك عبر قناتك المعتادة.'
              : 'Your account needs an invitation and active access permissions. If you expected access, contact your coach through your usual channel.'}
        </FeedbackPanel>
        <div className={styles.lifecycleForm}>
          <Link href={destination ?? '/workspace'}>
            {destination
              ? ar
                ? 'الانتقال إلى مساحتي'
                : 'Go to my workspace'
              : ar
                ? 'إعادة التحقق من الوصول'
                : 'Check access again'}
          </Link>
          <Link href="/guidance">{ar ? 'دليل التدريب' : 'Training guide'}</Link>
        </div>
        <form action="/access/logout" method="post">
          <button className={styles.secondary} type="submit">
            {ar ? 'تسجيل الخروج' : 'Sign out'}
          </button>
        </form>
      </main>
    </SiteShell>
  );
}
