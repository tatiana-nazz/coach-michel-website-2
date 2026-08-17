import type { SupportedLocale } from '@/i18n/config';
import { directionForLocale } from '@/i18n/direction';

export const privateAccessEntryStatuses = [
  'default',
  'validation_error',
  'authentication_required',
  'expired',
  'denied',
  'recovery_available',
  'recovered',
] as const;

export type PrivateAccessEntryStatus = (typeof privateAccessEntryStatuses)[number];

type StatusTone = 'info' | 'danger' | 'warning' | 'success';
type StatusRole = 'status' | 'alert';

interface PrivateAccessEntryCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly invitedNotice: string;
  readonly identityNotice: string;
  readonly emailLabel: string;
  readonly passwordLabel: string;
  readonly submitLabel: string;
  readonly languageLabel: string;
  readonly helpSummary: string;
  readonly recoveryTitle: string;
  readonly recoveryText: string;
  readonly privacyTitle: string;
  readonly privacyText: string;
  readonly supportTitle: string;
  readonly supportExternalLabel: string;
  readonly supportText: string;
  readonly contextEyebrow: string;
  readonly contextTitle: string;
  readonly contextBody: string;
  readonly recoveredTitle: string;
  readonly recoveredBody: string;
}

const copyByLocale = {
  en: {
    eyebrow: 'Private access',
    title: 'Access your coaching space',
    invitedNotice:
      'Private access is for people invited by Coach Michel. There is no public sign-up.',
    identityNotice: 'Coach Michel creates and manages private trainee access.',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    submitLabel: 'Continue',
    languageLabel: 'Language',
    helpSummary: 'Access help',
    recoveryTitle: 'Access recovery',
    recoveryText:
      'If you forgot your password or need to reset it, use the approved recovery process.',
    privacyTitle: 'Privacy & access guidance',
    privacyText: 'Private access is used only for your authorized coaching space.',
    supportTitle: 'WhatsApp support',
    supportExternalLabel: 'External service',
    supportText: 'Approved support is provided through an external service.',
    contextEyebrow: 'Private coaching',
    contextTitle: 'A focused boundary before your training space',
    contextBody:
      'Private coaching stays separate from public content. Access is established only after approved credentials are accepted.',
    recoveredTitle: 'Recovery completed',
    recoveredBody: 'Use your approved credentials when you return to private access.',
  },
  ar: {
    eyebrow: 'الدخول الخاص',
    title: 'ادخل إلى مساحتك التدريبية',
    invitedNotice: 'الدخول الخاص متاح فقط للأشخاص الذين دعاهم Coach Michel. لا يوجد تسجيل عام.',
    identityNotice: 'ينشئ Coach Michel وصول المتدربين الخاص ويديره.',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    submitLabel: 'متابعة',
    languageLabel: 'اللغة',
    helpSummary: 'مساعدة الدخول',
    recoveryTitle: 'استعادة الوصول',
    recoveryText: 'إذا نسيت كلمة المرور أو احتجت إلى إعادة تعيينها، استخدم مسار الاستعادة المعتمد.',
    privacyTitle: 'إرشادات الخصوصية والوصول',
    privacyText: 'يُستخدم الدخول الخاص فقط لمساحتك التدريبية المصرح بها.',
    supportTitle: 'دعم WhatsApp',
    supportExternalLabel: 'خدمة خارجية',
    supportText: 'يُقدَّم الدعم المعتمد عبر خدمة خارجية.',
    contextEyebrow: 'تدريب خاص',
    contextTitle: 'حد واضح قبل الدخول إلى مساحتك التدريبية',
    contextBody:
      'يبقى التدريب الخاص منفصلاً عن المحتوى العام. لا يتم إنشاء الوصول إلا بعد قبول بيانات الاعتماد المعتمدة.',
    recoveredTitle: 'اكتملت الاستعادة',
    recoveredBody: 'استخدم بيانات الاعتماد المعتمدة عند عودتك إلى الدخول الخاص.',
  },
} satisfies Record<SupportedLocale, PrivateAccessEntryCopy>;

const statusByLocale = {
  en: {
    default: 'Not signed in',
    validation_error: 'Check the highlighted credential fields.',
    authentication_required: 'Private access could not be established with those credentials.',
    expired: 'Your previous access has expired. Sign in again.',
    denied: 'Private access is not available for this account.',
    recovery_available: 'Recovery is available in Access help.',
    recovered: 'Access recovery is complete.',
  },
  ar: {
    default: 'لم يتم تسجيل الدخول',
    validation_error: 'راجع حقول بيانات الاعتماد المحددة.',
    authentication_required: 'تعذر إنشاء الدخول الخاص باستخدام بيانات الاعتماد هذه.',
    expired: 'انتهت صلاحية الوصول السابق. سجّل الدخول مرة أخرى.',
    denied: 'الدخول الخاص غير متاح لهذا الحساب.',
    recovery_available: 'الاستعادة متاحة ضمن مساعدة الدخول.',
    recovered: 'اكتملت استعادة الوصول.',
  },
} satisfies Record<SupportedLocale, Record<PrivateAccessEntryStatus, string>>;

const statusTone: Record<PrivateAccessEntryStatus, StatusTone> = {
  default: 'info',
  validation_error: 'danger',
  authentication_required: 'danger',
  expired: 'warning',
  denied: 'danger',
  recovery_available: 'info',
  recovered: 'success',
};

const statusRole: Record<PrivateAccessEntryStatus, StatusRole> = {
  default: 'status',
  validation_error: 'alert',
  authentication_required: 'alert',
  expired: 'alert',
  denied: 'alert',
  recovery_available: 'status',
  recovered: 'status',
};

export function getPrivateAccessEntryViewModel(
  locale: SupportedLocale,
  status: PrivateAccessEntryStatus,
) {
  return {
    locale,
    direction: directionForLocale(locale),
    copy: copyByLocale[locale],
    statusMessage: statusByLocale[locale][status],
    statusTone: statusTone[status],
    statusRole: statusRole[status],
    showCredentialForm: status !== 'recovered',
  } as const;
}
