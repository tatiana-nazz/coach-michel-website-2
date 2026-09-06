import { describe, expect, it } from 'vitest';
import {
  canSubmitCompletion,
  completionPresentation,
  formatSessionDate,
  instructionLines,
  releasedSessionReadable,
  localizedValue,
  sessionPath,
} from '@/features/trainee/runtime/model';
import type { TraineeSession } from '@/features/trainee/runtime/types';

const session: TraineeSession = {
  scheduleRef: 'schedule-one',
  sessionRef: 'session-one',
  versionRef: 'version-one',
  title: 'Fixture session',
  description: '',
  scheduledFor: null,
  status: 'RELEASED',
  released: true,
  completionRef: null,
  intentRef: null,
  intentStatus: null,
  exercises: [
    {
      ref: 'exercise-one',
      order: 1,
      title: 'Fixture exercise',
      description: '',
      instructions: ['Fixture instruction'],
      sets: '3',
      reps: '8',
      rest: '60',
      contentLocale: 'en',
      available: true,
    },
  ],
};

describe('trainee runtime completion authority', () => {
  it('keeps completed-session guidance readable only with release and completion evidence', () => {
    expect(releasedSessionReadable('COMPLETED', true, true)).toBe(true);
    expect(releasedSessionReadable('COMPLETED', true, false)).toBe(false);
    expect(releasedSessionReadable('COMPLETED', false, true)).toBe(false);
    expect(releasedSessionReadable('RELEASED', true, false)).toBe(true);
    expect(releasedSessionReadable('SCHEDULED', true, false)).toBe(false);
  });
  it('does not turn a CONFIRMED intent string into a durable completion', () => {
    expect(
      completionPresentation({ ...session, intentRef: 'intent-one', intentStatus: 'CONFIRMED' }),
    ).toBe('pending');
    expect(
      canSubmitCompletion({ ...session, intentRef: 'intent-one', intentStatus: 'CONFIRMED' }),
    ).toBe(false);
  });
  it('recognizes an authoritative completion even after release status changes', () => {
    expect(
      completionPresentation({ ...session, released: false, completionRef: 'completion-one' }),
    ).toBe('confirmed');
    expect(canSubmitCompletion({ ...session, completionRef: 'completion-one' })).toBe(false);
  });
  it('blocks submissions for unavailable exercises, unreleased sessions and empty sequences', () => {
    expect(canSubmitCompletion(session)).toBe(true);
    expect(canSubmitCompletion({ ...session, released: false })).toBe(false);
    expect(canSubmitCompletion({ ...session, exercises: [] })).toBe(false);
    expect(
      canSubmitCompletion({
        ...session,
        exercises: session.exercises.map((exercise) => ({ ...exercise, available: false })),
      }),
    ).toBe(false);
  });
  it('allows a fresh intent after an explicitly cancelled or rejected request', () => {
    expect(
      canSubmitCompletion({ ...session, intentRef: 'old-intent', intentStatus: 'REJECTED' }),
    ).toBe(true);
    expect(
      canSubmitCompletion({ ...session, intentRef: 'old-intent', intentStatus: 'CANCELLED' }),
    ).toBe(true);
  });
});

describe('trainee presentation safety', () => {
  it('keeps schedule references inside a single URL segment', () => {
    expect(sessionPath('session/a?# ب')).toBe(
      '/trainee/sessions/session%2Fa%3F%23%20%D8%A8/sequence',
    );
  });
  it('uses explicit missing dates instead of inventing a schedule date', () => {
    expect(formatSessionDate(null, 'en')).toBe('No date set');
    expect(formatSessionDate('invalid', 'ar')).toBe('بدون موعد محدد');
  });
  it('reads bilingual authored fields and filters invalid instruction values', () => {
    expect(localizedValue({ en: 'English', ar: 'عربي' }, 'ar')).toBe('عربي');
    expect(localizedValue({ en: 'English' }, 'ar')).toBe('English');
    expect(instructionLines(['Step one', null, 42, '', 'Step two'])).toEqual([
      'Step one',
      'Step two',
    ]);
    expect(instructionLines('One\n\nTwo')).toEqual(['One', 'Two']);
  });
});
