import { redirect } from 'next/navigation';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import { NoticeDecisions } from '@/features/website/access-lifecycle';
import { FeedbackPanel } from '@/design-system/components/interaction-primitives';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import { readAccessContext, readEffectiveNotices } from '@/platform/auth/access-context';
import styles from '@/features/website/access.module.css';
export default async function NoticesPage() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect('/access');
  const context = await readAccessContext(client, data.user);
  if (context.status !== 'ready')
    redirect(`/workspace?state=${context.status === 'unavailable' ? 'unavailable' : 'forbidden'}`);
  const locale = await websiteLocale();
  const notices = await readEffectiveNotices(client, context.principal.id, locale);
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/access/notices">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'قبل البدء' : 'BEFORE YOU BEGIN'}</p>
        <h1>{ar ? 'اقرأ. قرّر. انطلق.' : 'Read. Decide. Begin.'}</h1>
        <p>
          {ar
            ? 'راجع الإشعارات الحالية قبل متابعة التدريب. يُحفظ قرارك لكل إصدار، ويمكنك الرفض وتسجيل الخروج.'
            : 'Review the current notices before continuing to training. Your decision is saved for each version. You can decline and sign out.'}
        </p>
        {notices.available ? (
          <NoticeDecisions locale={locale} notices={notices.notices} />
        ) : (
          <FeedbackPanel
            tone="warning"
            title={ar ? 'الإشعارات غير متاحة بعد' : 'Notices are not available yet'}
          >
            {ar
              ? 'لا يمكن متابعة التدريب حتى تُنشر الإشعارات المطلوبة. تواصل مع مدربك عبر قناتك المعتادة، أو حاول مجددًا لاحقًا.'
              : 'Training access will be available once the required notices are published. Contact your coach through your usual channel, or try again later.'}
          </FeedbackPanel>
        )}
        <form action="/access/logout" method="post">
          <button className={styles.secondary} type="submit">
            {ar ? 'تسجيل الخروج' : 'Sign out'}
          </button>
        </form>
      </main>
    </SiteShell>
  );
}
