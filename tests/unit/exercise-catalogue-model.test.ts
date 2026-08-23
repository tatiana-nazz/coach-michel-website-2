import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createExerciseCatalogueIntent,
  exerciseCatalogueErrorCodes,
  exerciseCatalogueStates,
  getExerciseCatalogueViewModel,
  isExerciseCatalogueIntentEnabled,
  mapExerciseCatalogueErrorCode,
} from '@/features/coach/screens/scr-coa-006/exercise-catalogue.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-006/exercise-catalogue.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const exercise = {
  exerciseReference: 'EXERCISE::opaque/COA-006',
  orderingReference: 'ORDER::opaque/COA-006',
  contentDraftReference: 'CONTENT-DRAFT::opaque/COA-006',
  draftVersionReference: 'VERSION::opaque/COA-006',
  publicationDecisionReference: 'PUBLICATION-DECISION::opaque/COA-006',
  evidenceReferences: ['EVIDENCE::opaque/COA-006'],
  displayLabel: 'Caller-supplied exercise',
  approvalStatusLabel: 'Caller-supplied approval status',
  safetyStatusLabel: 'Caller-supplied safety status',
  rightsStatusLabel: 'Caller-supplied rights status',
  complexityStatusLabel: 'Caller-supplied complexity status',
  languageStatusLabel: 'Caller-supplied language status',
  accessibilityStatusLabel: 'Caller-supplied accessibility status',
  summary: 'Caller-supplied summary',
  reviewAvailable: true,
  draftIntentAvailable: true,
  publicationContextAvailable: true,
} as const;

const option = { optionReference: 'OPTION::allowlisted/COA-006', label: 'Caller option' } as const;

const snapshot = {
  catalogueReference: 'CATALOGUE::opaque/COA-006',
  authorityStatusReference: 'AUTHORITY::opaque/COA-006',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-006',
  boundedTimeContext: 'TIME::bounded/COA-006',
  exercises: [exercise],
  approvalFilterOptions: [option],
  selectedApprovalFilterReference: option.optionReference,
  sortOptions: [option],
  selectedSortReference: option.optionReference,
  recoveryContext: {
    retryContext: 'RETRY::opaque/COA-006',
    reconciliationContext: 'RECONCILE::opaque/COA-006',
  },
} as const;

const visibility = {
  review_exercise: true,
  prepare_content_draft_intent: true,
  review_publication_context: true,
  refresh_catalogue: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-006 exercise catalogue model', () => {
  it('preserves the exact mapped errors and collection-readiness state distinctions', () => {
    expect(exerciseCatalogueStates).toContain('empty');
    expect(exerciseCatalogueStates).toContain('lifecycle_conflict');
    expect(exerciseCatalogueStates).toContain('duplicate_or_already_applied');
    expect(exerciseCatalogueStates).toContain('pending');
    expect(exerciseCatalogueStates).toContain('authoritative_final');
    expect(exerciseCatalogueErrorCodes).toEqual([
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
    expect(mapExerciseCatalogueErrorCode('DUPLICATE_OR_ALREADY_APPLIED')).toBe(
      'duplicate_or_already_applied',
    );
    expect(mapExerciseCatalogueErrorCode('VALIDATION_FAILED')).toBe('validation_error');
  });

  it('preserves exercise, draft, publication-decision, evidence, and ordering references exactly', () => {
    const viewModel = getExerciseCatalogueViewModel('ar', 'ready', snapshot, visibility);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.exerciseReferences).toEqual([exercise.exerciseReference]);
    expect(viewModel.opaqueReferences.orderingReferences).toEqual([exercise.orderingReference]);
    expect(viewModel.opaqueReferences.contentDraftReferences).toEqual([
      exercise.contentDraftReference,
    ]);
    expect(viewModel.opaqueReferences.publicationDecisionReferences).toEqual([
      exercise.publicationDecisionReference,
    ]);
    expect(viewModel.opaqueReferences.evidenceReferences).toEqual(exercise.evidenceReferences);
  });

  it('constructs review-only publication context and bounded semantic intents without authority', () => {
    expect(createExerciseCatalogueIntent('review_publication_context', snapshot, exercise)).toEqual(
      {
        kind: 'review_publication_context',
        catalogueReference: snapshot.catalogueReference,
        exerciseReference: exercise.exerciseReference,
        publicationDecisionReference: exercise.publicationDecisionReference,
        evidenceReferences: exercise.evidenceReferences,
      },
    );
    expect(
      createExerciseCatalogueIntent('prepare_content_draft_intent', snapshot, exercise),
    ).toEqual({
      kind: 'prepare_content_draft_intent',
      catalogueReference: snapshot.catalogueReference,
      exerciseReference: exercise.exerciseReference,
      contentDraftReference: exercise.contentDraftReference,
      draftVersionReference: exercise.draftVersionReference,
      evidenceReferences: exercise.evidenceReferences,
    });
    expect(createExerciseCatalogueIntent('refresh_catalogue', snapshot)).toEqual({
      kind: 'refresh_catalogue',
      catalogueReference: snapshot.catalogueReference,
      boundedTimeContext: snapshot.boundedTimeContext,
      selectedApprovalFilterReference: snapshot.selectedApprovalFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    });
    expect(isExerciseCatalogueIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(isExerciseCatalogueIntentEnabled('pending', 'refresh_catalogue', snapshot)).toBe(false);
  });

  it('does not sort membership or infer actor scope, approval, publication, transport, or persistence', () => {
    expect(modelSource).not.toContain('.sort(');
    expect(modelSource).not.toContain('.toSorted(');
    expect(modelSource).not.toContain('approver_scope');
    expect(modelSource).not.toContain('approval_decision');
    expect(modelSource).not.toContain('effective_publish_intent');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
