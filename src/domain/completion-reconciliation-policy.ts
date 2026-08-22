export interface CompletionControlFacts {
  readonly completionIntentObserved: boolean;
  readonly authoritativeCompletionExists: boolean;
  readonly retryOrDuplicateObserved: boolean;
  readonly conflictingStateObserved: boolean;
  readonly recoveryValidationSufficient: boolean;
  readonly reconciliationOpen: boolean;
}

export interface CompletionControlDecision {
  readonly completionIsFinal: boolean;
  readonly mayCreateAuthoritativeCompletion: boolean;
  readonly reconciliationRequired: boolean;
  readonly mayResumeNormalFlow: boolean;
}

export function evaluateCompletionControl(
  facts: CompletionControlFacts,
): CompletionControlDecision {
  const reconciliationRequired =
    facts.retryOrDuplicateObserved ||
    facts.conflictingStateObserved ||
    !facts.recoveryValidationSufficient ||
    facts.reconciliationOpen;

  return {
    completionIsFinal: facts.authoritativeCompletionExists,
    mayCreateAuthoritativeCompletion:
      !facts.authoritativeCompletionExists && !reconciliationRequired,
    reconciliationRequired,
    mayResumeNormalFlow: facts.recoveryValidationSufficient && !facts.reconciliationOpen,
  };
}

export interface CompletionCorrectionFacts {
  readonly governedCaseEstablished: boolean;
  readonly proposerAuthorizerSeparated: boolean;
  readonly preservedEvidenceAvailable: boolean;
  readonly auditEvidenceAvailable: boolean;
}

export function mayApplyCompletionCorrection(facts: CompletionCorrectionFacts): boolean {
  return (
    facts.governedCaseEstablished &&
    facts.proposerAuthorizerSeparated &&
    facts.preservedEvidenceAvailable &&
    facts.auditEvidenceAvailable
  );
}
