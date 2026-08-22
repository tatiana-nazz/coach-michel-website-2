import { describe, expect, it } from 'vitest';

import {
  evaluateCompletionControl,
  mayApplyCompletionCorrection,
  type CompletionControlFacts,
} from '@/domain/completion-reconciliation-policy';

const baseFacts = {
  completionIntentObserved: false,
  authoritativeCompletionExists: false,
  retryOrDuplicateObserved: false,
  conflictingStateObserved: false,
  recoveryValidationSufficient: true,
  reconciliationOpen: false,
} as const;

const convergenceOverrides: readonly Partial<CompletionControlFacts>[] = [
  { retryOrDuplicateObserved: true },
  { conflictingStateObserved: true },
  { recoveryValidationSufficient: false },
  { reconciliationOpen: true },
];

describe('completion reconciliation policy', () => {
  it('does not treat completion intent alone as final', () => {
    const decision = evaluateCompletionControl({
      ...baseFacts,
      completionIntentObserved: true,
    });

    expect(decision.completionIsFinal).toBe(false);
    expect(decision.mayCreateAuthoritativeCompletion).toBe(true);
  });

  it('blocks a second authoritative completion result', () => {
    const decision = evaluateCompletionControl({
      ...baseFacts,
      authoritativeCompletionExists: true,
    });

    expect(decision.completionIsFinal).toBe(true);
    expect(decision.mayCreateAuthoritativeCompletion).toBe(false);
  });

  it.each(convergenceOverrides)(
    'requires reconciliation for convergence facts: %o',
    (override: Partial<CompletionControlFacts>) => {
      const decision = evaluateCompletionControl({ ...baseFacts, ...override });

      expect(decision.reconciliationRequired).toBe(true);
      expect(decision.mayCreateAuthoritativeCompletion).toBe(false);
    },
  );

  it('requires governed case, separated authorization, preserved evidence and audit evidence for correction', () => {
    expect(
      mayApplyCompletionCorrection({
        governedCaseEstablished: true,
        proposerAuthorizerSeparated: true,
        preservedEvidenceAvailable: true,
        auditEvidenceAvailable: true,
      }),
    ).toBe(true);

    for (const missing of [
      'governedCaseEstablished',
      'proposerAuthorizerSeparated',
      'preservedEvidenceAvailable',
      'auditEvidenceAvailable',
    ] as const) {
      expect(
        mayApplyCompletionCorrection({
          governedCaseEstablished: missing !== 'governedCaseEstablished',
          proposerAuthorizerSeparated: missing !== 'proposerAuthorizerSeparated',
          preservedEvidenceAvailable: missing !== 'preservedEvidenceAvailable',
          auditEvidenceAvailable: missing !== 'auditEvidenceAvailable',
        }),
      ).toBe(false);
    }
  });

  it('does not resume normal flow while recovery validation is insufficient or reconciliation is open', () => {
    expect(
      evaluateCompletionControl({
        ...baseFacts,
        recoveryValidationSufficient: false,
      }).mayResumeNormalFlow,
    ).toBe(false);

    expect(
      evaluateCompletionControl({
        ...baseFacts,
        reconciliationOpen: true,
      }).mayResumeNormalFlow,
    ).toBe(false);
  });

  it('never uses recovery evidence to overwrite authoritative completion truth', () => {
    const decision = evaluateCompletionControl({
      ...baseFacts,
      authoritativeCompletionExists: true,
      recoveryValidationSufficient: true,
    });

    expect(decision.completionIsFinal).toBe(true);
    expect(decision.mayCreateAuthoritativeCompletion).toBe(false);
  });
});
