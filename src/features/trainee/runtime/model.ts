import type { SupportedLocale } from '@/i18n/config';
import type { TraineeSession } from './types';

export function textValue(value: unknown): string {
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
}

export function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function localizedValue(value: unknown, locale: SupportedLocale): string {
  if (typeof value === 'string') return value;
  const record = recordValue(value);
  return textValue(record[locale]) || textValue(record.en);
}

export function instructionLines(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
  if (typeof value === 'string')
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  return [];
}

export function completionPresentation(
  session: Pick<TraineeSession, 'completionRef' | 'intentRef' | 'intentStatus' | 'released'>,
): 'confirmed' | 'pending' | 'available' | 'scheduled' {
  if (session.completionRef) return 'confirmed';
  if (session.intentRef && !['REJECTED', 'CANCELLED'].includes(session.intentStatus ?? ''))
    return 'pending';
  return session.released ? 'available' : 'scheduled';
}

export function canSubmitCompletion(session: TraineeSession): boolean {
  return (
    completionPresentation(session) === 'available' &&
    session.exercises.length > 0 &&
    session.exercises.every((exercise) => exercise.available)
  );
}

export function sessionPath(
  scheduleRef: string,
  end: 'sequence' | 'completion' = 'sequence',
): string {
  return `/trainee/sessions/${encodeURIComponent(scheduleRef)}/${end}`;
}

export function formatSessionDate(value: string | null, locale: SupportedLocale): string {
  if (!value || !Number.isFinite(Date.parse(value)))
    return locale === 'ar' ? 'بدون موعد محدد' : 'No date set';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));
}

/** Completed work stays readable only with the same release evidence and a durable completion. */
export function releasedSessionReadable(
  status: string,
  hasEffectiveRelease: boolean,
  hasCompletion: boolean,
): boolean {
  return (
    hasEffectiveRelease && (status === 'RELEASED' || (status === 'COMPLETED' && hasCompletion))
  );
}
