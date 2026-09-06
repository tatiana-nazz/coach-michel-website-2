import Link from 'next/link';
import { SiteShell } from '@/features/website/site-shell';
import { websiteLocale } from '@/features/website/locale';
import { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import { readAccessContext } from '@/platform/auth/access-context';
import styles from '@/features/website/access.module.css';

async function invitationContext() {
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    const context = await readAccessContext(client, data.user);
    if (context.status !== 'ready') return { available: false, records: [], candidate: true };
    const result = await client
      .from('access_provisioning_records')
      .select('status,expires_at')
      .eq('principal_id', context.principal.id)
      .order('created_at', { ascending: false })
      .limit(1);
    return {
      available: !result.error,
      records: result.data ?? [],
      candidate: context.roleIds.every((role) => role === 'ROL-002'),
    };
  } catch {
    return null;
  }
}

export default async function InvitationPage() {
  const locale = await websiteLocale();
  const invitation = await invitationContext();
  const ar = locale === 'ar';
  const statusLabels: Record<string, string> = ar
    ? {
        PENDING: 'بانتظار المراجعة',
        APPROVED: 'تمت الموافقة',
        ACTIVE: 'نشطة',
        COMPLETED: 'مكتملة',
        EXPIRED: 'منتهية الصلاحية',
        REVOKED: 'أُلغيت',
        DECLINED: 'مرفوضة',
      }
    : {
        PENDING: 'Awaiting review',
        APPROVED: 'Approved',
        ACTIVE: 'Active',
        COMPLETED: 'Complete',
        EXPIRED: 'Expired',
        REVOKED: 'Revoked',
        DECLINED: 'Declined',
      };
  const record = invitation?.records[0];
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
              ? 'افتح الرابط الموجود في رسالة الدعوة وعيّن كلمة مرورك، ثم راجع الإشعارات الحالية. تظل صلاحيات التدريب مرتبطة بالدعوة والمراجعة.'
              : 'Open the link in your invitation email, set your password, and review the current notices. Your training access remains subject to your invitation and access review.'}
          </p>
          <p>
            {ar
              ? 'إذا لم تستلم دعوة بعد، تواصل مع مدربك عبر قناة التواصل الحالية.'
              : 'If you have not received an invitation, contact your coach through your existing communication channel.'}
          </p>
        </section>
        {invitation ? (
          <section>
            <h2>{ar ? 'حالة دعوتك' : 'Your invitation status'}</h2>
            {record && invitation.available ? (
              <>
                <p>
                  {statusLabels[String(record.status)] ??
                    (ar
                      ? 'تواصل مع مدربك لمراجعة تفاصيل دعوتك.'
                      : 'Contact your coach to review your invitation details.')}
                </p>
                {record.expires_at ? (
                  <p>
                    {ar ? 'تنتهي في:' : 'Expires:'}{' '}
                    <time dateTime={String(record.expires_at)}>
                      {new Intl.DateTimeFormat(ar ? 'ar' : 'en', {
                        dateStyle: 'medium',
                        timeZone: 'UTC',
                      }).format(new Date(String(record.expires_at)))}
                    </time>
                  </p>
                ) : null}
              </>
            ) : (
              <p>
                {ar
                  ? 'تفاصيل الدعوة غير متاحة لهذا الحساب. تواصل مع مدربك عبر قناتك المعتادة.'
                  : 'Invitation details are not available for this account. Contact your coach through your usual channel.'}
              </p>
            )}
            <div className={styles.lifecycleForm}>
              {invitation.candidate ? (
                <Link href="/access/notices">
                  {ar ? 'مراجعة الإشعارات' : 'Review current notices'}
                </Link>
              ) : (
                <Link href="/workspace">{ar ? 'الانتقال إلى مساحتي' : 'Go to my workspace'}</Link>
              )}
              <Link href="/access/password">{ar ? 'إدارة كلمة المرور' : 'Manage password'}</Link>
            </div>
          </section>
        ) : null}
        <Link href="/access">{ar ? 'دخول الأعضاء' : 'Go to member access'}</Link>
      </main>
    </SiteShell>
  );
}
