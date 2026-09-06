import { describe, expect, it } from 'vitest';
import { draftBody } from '@/features/coach/runtime/commands';
import { latestVersion, type CoachItem } from '@/features/coach/runtime/types';
import { trainingCommandPayload } from '@/platform/server/training-payload';

const values = (input: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(input)) data.set(key, value);
  return data;
};
describe('coach draft forms and the production command contract', () => {
  it('preserves deliberate exercise order, repetition ranges and zero rest', () => {
    const body = draftBody(
      values({
        title: 'Session A',
        description: 'Coach-authored plan.',
        reason: 'Initial preparation.',
        durationMinutes: '45',
        'movement-b-sets': '3',
        'movement-b-reps': '8–10',
        'movement-b-restSeconds': '0',
        'movement-a-sets': '2',
        'movement-a-reps': '12',
        'movement-a-restSeconds': '60',
      }),
      'session',
      ['movement-b', 'movement-a'],
    );
    expect(trainingCommandPayload('p3s11_apin_025_create_session_draft', body)).toEqual(body);
    expect(body.exercises).toEqual([
      { exerciseRef: 'movement-b', sets: 3, reps: '8–10', restSeconds: 0 },
      { exerciseRef: 'movement-a', sets: 2, reps: '12', restSeconds: 60 },
    ]);
  });
  it('binds revision identity from the route while keeping optimistic version control', () => {
    const existing: CoachItem = {
      ref: 'session-a',
      title: '',
      description: '',
      status: 'DRAFT',
      date: '',
      versionRef: 'immutable-version-4',
      version: 4,
      extra: {},
    };
    const body = draftBody(
      values({ title: 'Revised plan', description: '', reason: 'Updated duration.' }),
      'session',
      [],
      existing,
    );
    expect(
      trainingCommandPayload('p3s11_apin_025_revise_session_draft', body, {
        draft_ref: existing.versionRef,
      }),
    ).toEqual({
      title: 'Revised plan',
      description: '',
      reason: 'Updated duration.',
      expectedVersion: 4,
      exercises: [],
      draftRef: 'immutable-version-4',
    });
  });
  it('accepts Arabic content without sending unrecognized fields or author assertions', () => {
    const body = draftBody(
      values({
        title: 'شرح التمرين',
        description: 'تعليمات المدرب',
        reason: 'إضافة الشرح العربي',
        locale: 'ar',
        instructions: 'ابدأ بالوضعية المحددة.\nاتبع تعليمات المدرب.',
        videoUrl: '',
      }),
      'content',
      [],
    );
    expect(trainingCommandPayload('p3s11_apin_027_create_content_draft', body)).toEqual(body);
    expect(body).not.toHaveProperty('createdBy');
    expect(body).not.toHaveProperty('contentKind');
  });
  it('rejects an incomplete exercise configuration instead of saving fabricated defaults', () => {
    const body = draftBody(
      values({ title: 'Session', description: 'Plan', reason: 'Preparation' }),
      'session',
      ['exercise-a'],
    );
    expect(trainingCommandPayload('p3s11_apin_025_create_session_draft', body)).toBeNull();
  });
});

describe('coach version selection', () => {
  it('uses the latest selected-language version without mutating query rows', () => {
    const versions = [
      { version_ref: 'en9', version_number: 9, locale: 'en' },
      { version_ref: 'ar2', version_number: 2, locale: 'ar' },
      { version_ref: 'ar5', version_number: 5, locale: 'ar' },
    ];
    expect(latestVersion(versions, 'ar').version_ref).toBe('ar5');
    expect(versions.map((version) => version.version_ref)).toEqual(['en9', 'ar2', 'ar5']);
  });
  it('falls back to English but never substitutes an unrelated language', () => {
    expect(
      latestVersion([{ version_ref: 'en2', version_number: 2, locale: 'en' }], 'ar').version_ref,
    ).toBe('en2');
    expect(latestVersion([{ version_ref: 'ar2', version_number: 2, locale: 'ar' }], 'en')).toEqual(
      {},
    );
  });
});
