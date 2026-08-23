import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createProgramsSessionsCollectionIntent,
  getProgramsSessionsCollectionViewModel,
  isProgramsSessionsCollectionIntentEnabled,
  mapProgramsSessionsCollectionErrorCode,
  programsSessionsCollectionErrorCodes,
  programsSessionsCollectionStates,
} from '@/features/coach/screens/scr-coa-004/programs-sessions-collection.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-004/programs-sessions-collection.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const program = {
  kind: 'program',
  programReference: 'PROGRAM::opaque/COA-004',
  orderingReference: 'ORDER::program/2',
  traineeReference: 'TRAINEE::opaque/COA-004',
  draftReference: 'PROGRAM-DRAFT::opaque/COA-004',
  draftVersionReference: 'VERSION::opaque/program-COA-004',
  displayLabel: 'Caller-supplied program',
  statusLabel: 'Caller-supplied status',
  scheduleLabel: 'Caller-supplied schedule',
  summary: 'Caller-supplied summary',
  reviewAvailable: true,
  draftIntentAvailable: true,
} as const;

const session = {
  kind: 'session',
  sessionReference: 'SESSION::opaque/COA-004',
  orderingReference: 'ORDER::session/1',
  traineeReference: 'TRAINEE::opaque/COA-004',
  draftReference: 'SESSION-DRAFT::opaque/COA-004',
  draftVersionReference: 'VERSION::opaque/session-COA-004',
  displayLabel: 'Caller-supplied session',
  statusLabel: 'Caller-supplied status',
  scheduleLabel: 'Caller-supplied schedule',
  summary: 'Caller-supplied summary',
  reviewAvailable: true,
  draftIntentAvailable: true,
} as const;

const option = { optionReference: 'OPTION::allowlisted/COA-004', label: 'Caller option' } as const;

const snapshot = {
  collectionReference: 'COLLECTION::opaque/COA-004',
  authorityStatusReference: 'AUTHORITY::opaque/COA-004',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-004',
  boundedTimeContext: 'TIME::bounded/COA-004',
  programs: [program],
  sessions: [session],
  filterOptions: [option],
  selectedFilterReference: option.optionReference,
  sortOptions: [option],
  selectedSortReference: option.optionReference,
  recoveryContext: {
    retryContext: 'RETRY::opaque/COA-004',
    reconciliationContext: 'RECONCILE::opaque/COA-004',
  },
} as const;

const visibility = {
  review_item: true,
  prepare_draft_intent: true,
  refresh_collection: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-004 programs and sessions collection model', () => {
  it('preserves the exact mapped errors and collection-readiness state distinctions', () => {
    expect(programsSessionsCollectionStates).toContain('empty');
    expect(programsSessionsCollectionStates).toContain('lifecycle_conflict');
    expect(programsSessionsCollectionStates).toContain('duplicate_or_already_applied');
    expect(programsSessionsCollectionStates).toContain('pending');
    expect(programsSessionsCollectionStates).toContain('authoritative_final');
    expect(programsSessionsCollectionErrorCodes).toEqual([
      'AUTHENTICATION_REQUIRED_OR_INVALID',
      'AUTHORITY_DENIED',
      'DEPENDENCY_UNAVAILABLE',
      'DUPLICATE_OR_ALREADY_APPLIED',
      'LIFECYCLE_CONFLICT',
      'RATE_LIMITED',
      'RESOURCE_NOT_FOUND',
      'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
      'STALE_OR_CONFLICTING_STATE',
      'VALIDATION_FAILED',
    ]);
    expect(mapProgramsSessionsCollectionErrorCode('LIFECYCLE_CONFLICT')).toBe('lifecycle_conflict');
    expect(mapProgramsSessionsCollectionErrorCode('VALIDATION_FAILED')).toBe('validation_error');
  });

  it('preserves caller ordering and every opaque program, session, trainee, and draft reference', () => {
    const viewModel = getProgramsSessionsCollectionViewModel('ar', 'ready', snapshot, visibility);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.programReferences).toEqual([program.programReference]);
    expect(viewModel.opaqueReferences.sessionReferences).toEqual([session.sessionReference]);
    expect(viewModel.opaqueReferences.traineeReferences).toEqual([
      program.traineeReference,
      session.traineeReference,
    ]);
    expect(viewModel.opaqueReferences.orderingReferences).toEqual([
      program.orderingReference,
      session.orderingReference,
    ]);
    expect(viewModel.opaqueReferences.draftVersionReferences).toEqual([
      program.draftVersionReference,
      session.draftVersionReference,
    ]);
  });

  it('constructs semantic review, draft, refresh, retry, and reconciliation intents only', () => {
    expect(createProgramsSessionsCollectionIntent('review_item', snapshot, session)).toEqual({
      kind: 'review_item',
      collectionReference: snapshot.collectionReference,
      itemKind: 'session',
      itemReference: session.sessionReference,
      traineeReference: session.traineeReference,
      draftReference: session.draftReference,
    });
    expect(
      createProgramsSessionsCollectionIntent('prepare_draft_intent', snapshot, program),
    ).toEqual({
      kind: 'prepare_draft_intent',
      collectionReference: snapshot.collectionReference,
      itemKind: 'program',
      itemReference: program.programReference,
      traineeReference: program.traineeReference,
      draftReference: program.draftReference,
      draftVersionReference: program.draftVersionReference,
    });
    expect(createProgramsSessionsCollectionIntent('refresh_collection', snapshot)).toEqual({
      kind: 'refresh_collection',
      collectionReference: snapshot.collectionReference,
      boundedTimeContext: snapshot.boundedTimeContext,
      selectedFilterReference: snapshot.selectedFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    });
    expect(isProgramsSessionsCollectionIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(
      isProgramsSessionsCollectionIntentEnabled('pending', 'refresh_collection', snapshot),
    ).toBe(false);
  });

  it('does not reorder collections or infer coach scope, transport, routing, or persistence', () => {
    expect(modelSource).not.toContain('.sort(');
    expect(modelSource).not.toContain('.toSorted(');
    expect(modelSource).not.toContain('coach_scope');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
