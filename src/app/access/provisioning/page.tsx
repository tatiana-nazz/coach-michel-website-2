import Link from 'next/link';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import styles from '@/features/website/access.module.css';
export default async function InvitationPage() {
  const locale = await websiteLocale();
  const ar = locale === 'ar';
  return (
    <SiteShell locale={locale} path="/access/provisioning">
      <main id="main-content" className={styles.help}>
        <p className={styles.eyebrow}>{ar ? 'دعوات الأعضاء' : 'MEMBER INVITATIONS'}</p>
        <h1>{ar ? 'مساحة خاصة لتدريبك.' : 'A private space for your training.'}</h1>
        <p>
          {ar
            ? 'يُنشأ حسابك من خلال دعوة مرتبطة بعلاقتك التدريبية. لا يتوفر تسجيل عام في الموقع.'
            : 'Your account is created through an invitation connected to your coaching relationship. The website does not offer public self-registration.'}
        </p>
        <section>
          <h2>{ar ? 'البدء' : 'Getting started'}</h2>
          <p>
            {ar
              ? 'اتبع تعليمات الدعوة التي استلمتها. إذا لم تستلم دعوة بعد، تواصل مع مدربك عبر قناة التواصل الحالية.'
              : 'Follow the instructions in the invitation you received. If you have not received an invitation, contact your coach through your existing communication channel.'}
          </p>
        </section>
        <Link href="/access">{ar ? 'دخول الأعضاء' : 'Go to member access'}</Link>
      </main>
    </SiteShell>
  );
}
