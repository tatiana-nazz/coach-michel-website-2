import { describe, it, expect } from 'vitest';
import { trainingCommandPayload } from '@/platform/server/training-payload';

describe('training command input boundaries', () => {
  it('requires an immutable retry identity and binds the schedule on the server', () => {
    const body = {
      businessIntentRef: 'intent-123',
      clientEvidenceContext: { reportedCompletedAt: '2026-09-06T10:00:00Z' },
    };
    expect(
      trainingCommandPayload('p3s11_apin_016_post_1', body, { schedule_ref: 'schedule-1' }),
    ).toEqual({ ...body, scheduleRef: 'schedule-1' });
    expect(
      trainingCommandPayload('p3s11_apin_016_post_1', { ...body, traineePrincipalId: 'other' }),
    ).toBeNull();
    expect(
      trainingCommandPayload('p3s11_apin_016_post_1', { clientEvidenceContext: {} }),
    ).toBeNull();
  });
  it('requires optimistic concurrency for draft revisions', () => {
    const draft = { title: 'Mobility', description: 'Preparation', reason: 'Adjust sequence' };
    expect(
      trainingCommandPayload('p3s11_apin_025_revise_session_draft', draft, {
        draft_ref: 'draft-1',
      }),
    ).toBeNull();
    expect(
      trainingCommandPayload(
        'p3s11_apin_025_revise_session_draft',
        { ...draft, expectedVersion: 2 },
        { draft_ref: 'draft-1' },
      ),
    ).toMatchObject({ draftRef: 'draft-1', expectedVersion: 2 });
  });
  it('rejects script URL media and invalid dates without accepting pseudo success', () => {
    expect(
      trainingCommandPayload('p3s11_apin_027_create_content_draft', {
        title: 'Draft',
        instructions: 'Coach will review',
        reason: 'Create',
        locale: 'en',
        videoUrl: 'javascript:alert(1)',
      }),
    ).toBeNull();
    expect(
      trainingCommandPayload('p3s11_apin_030_post_1', {
        traineeRef: 'trainee-1',
        sessionVersionRef: 'v1',
        scheduledFor: 'tomorrow',
        reason: 'Training',
      }),
    ).toBeNull();
  });
  it('requires a proposal reference and reason for independent authorization', () => {
    expect(
      trainingCommandPayload('p3s11_apin_034_post_1', { decision: 'APPROVE', reason: 'Reviewed' }),
    ).toBeNull();
    expect(
      trainingCommandPayload(
        'p3s11_apin_034_post_1',
        { proposalRef: 'p1', decision: 'APPROVE', reason: 'Reviewed' },
        { case_ref: 'c1' },
      ),
    ).toMatchObject({ caseRef: 'c1', proposalRef: 'p1' });
  });
});
