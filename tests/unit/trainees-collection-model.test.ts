import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  createTraineesCollectionIntent,
  getTraineesCollectionViewModel,
  isTraineesCollectionIntentEnabled,
  mapTraineesCollectionErrorCode,
  traineesCollectionErrorCodes,
  traineesCollectionStates,
} from '@/features/coach/screens/scr-coa-002/trainees-collection.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-002/trainees-collection.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const firstTrainee = {
  traineeReference: 'TRAINEE::opaque/2',
  orderingReference: 'ORDER::stable/1',
  displayLabel: 'Caller-supplied first trainee',
  statusLabel: 'Caller-supplied status',
  summary: 'Caller-supplied summary',
  selectionAvailable: true,
} as const;

const secondTrainee = {
  traineeReference: 'TRAINEE::opaque/1',
  orderingReference: 'ORDER::stable/2',
  displayLabel: 'Caller-supplied second trainee',
  statusLabel: 'Caller-supplied status',
  summary: 'Caller-supplied summary',
  selectionAvailable: true,
} as const;

const option = { optionReference: 'OPTION::allowlisted/COA-002', label: 'Caller option' } as const;

const snapshot = {
  collectionReference: 'COLLECTION::opaque/COA-002',
  authorityStatusReference: 'AUTHORITY::opaque/COA-002',
  lifecycleStatusReference: 'LIFECYCLE::opaque/COA-002',
  coachGrantReference: 'GRANT::opaque/COA-002',
  trainees: [firstTrainee, secondTrainee],
  searchOptions: [option],
  selectedSearchReference: option.optionReference,
  filterOptions: [option],
  selectedFilterReference: option.optionReference,
  sortOptions: [option],
  selectedSortReference: option.optionReference,
  recoveryContext: {
    retryContext: 'RETRY::opaque/COA-002',
    reconciliationContext: 'RECONCILE::opaque/COA-002',
  },
} as const;

const visibility = {
  select_trainee: true,
  refresh_collection: true,
  retry: false,
  reconcile: true,
} as const;

describe('SCR-COA-002 trainees collection model', () => {
  it('preserves the exact collection readiness error mapping and state distinctions', () => {
    expect(traineesCollectionStates).toContain('empty');
    expect(traineesCollectionStates).toContain('duplicate_or_already_applied');
    expect(traineesCollectionStates).toContain('authoritative_final');
    expect(traineesCollectionErrorCodes).toEqual([
      'AUTHENTICATION_REQUIRED_OR_INVALID',
      'AUTHORITY_DENIED',
      'DEPENDENCY_UNAVAILABLE',
      'RATE_LIMITED',
      'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
      'STALE_OR_CONFLICTING_STATE',
    ]);
    expect(mapTraineesCollectionErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
  });

  it('preserves caller ordering and opaque collection/trainee/grant references exactly', () => {
    const viewModel = getTraineesCollectionViewModel('ar', 'ready', snapshot, visibility);
    const selectIntent = createTraineesCollectionIntent('select_trainee', snapshot, firstTrainee);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences.traineeReferences).toEqual([
      firstTrainee.traineeReference,
      secondTrainee.traineeReference,
    ]);
    expect(viewModel.opaqueReferences.orderingReferences).toEqual([
      firstTrainee.orderingReference,
      secondTrainee.orderingReference,
    ]);
    expect(viewModel.opaqueReferences.coachGrantReference).toBe(snapshot.coachGrantReference);
    expect(selectIntent).toEqual({
      kind: 'select_trainee',
      collectionReference: snapshot.collectionReference,
      traineeReference: firstTrainee.traineeReference,
      orderingReference: firstTrainee.orderingReference,
    });
  });

  it('uses only allowlisted caller selections and state-supported semantic intents', () => {
    const refresh = createTraineesCollectionIntent('refresh_collection', snapshot);

    expect(refresh).toEqual({
      kind: 'refresh_collection',
      collectionReference: snapshot.collectionReference,
      coachGrantReference: snapshot.coachGrantReference,
      selectedSearchReference: snapshot.selectedSearchReference,
      selectedFilterReference: snapshot.selectedFilterReference,
      selectedSortReference: snapshot.selectedSortReference,
    });
    expect(
      isTraineesCollectionIntentEnabled('ready', 'select_trainee', snapshot, firstTrainee),
    ).toBe(true);
    expect(isTraineesCollectionIntentEnabled('pending', 'refresh_collection', snapshot)).toBe(
      false,
    );
    expect(isTraineesCollectionIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
  });

  it('does not sort/filter membership or infer authority, transport, routing, or persistence', () => {
    expect(modelSource).not.toContain('.sort(');
    expect(modelSource).not.toContain('.toSorted(');
    expect(modelSource).not.toContain('coach_scope');
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('browserApiClient');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
  });
});
