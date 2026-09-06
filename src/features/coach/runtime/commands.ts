import type { CoachItem, RecordRow } from './types';

export const formText = (data: FormData, name: string) => String(data.get(name) ?? '').trim();

/** The same payload builder is used by the form and checked against the HTTP contract. */
export function draftBody(
  values: FormData,
  kind: 'program' | 'session' | 'content',
  selected: string[],
  existing?: CoachItem,
): RecordRow {
  const payload: RecordRow = {
    title: formText(values, 'title'),
    description: formText(values, 'description'),
    reason: formText(values, 'reason'),
  };
  if (existing) payload.expectedVersion = existing.version;
  if (kind === 'session') {
    const duration = formText(values, 'durationMinutes');
    if (duration) payload.durationMinutes = Number(duration);
    payload.exercises = selected.map((exerciseRef) => ({
      exerciseRef,
      sets: Number(formText(values, `${exerciseRef}-sets`)),
      reps: formText(values, `${exerciseRef}-reps`),
      restSeconds: Number(formText(values, `${exerciseRef}-restSeconds`)),
    }));
  }
  if (kind === 'content')
    Object.assign(payload, {
      locale: formText(values, 'locale'),
      instructions: formText(values, 'instructions'),
      videoUrl: formText(values, 'videoUrl'),
    });
  return payload;
}
