export interface PrivacyBoundary {
  readonly purpose: string;
  readonly dataClass: string;
}

/**
 * This foundation records no retention duration and performs no destructive privacy action.
 * Those behaviors require separate governed authority.
 */
export const destructivePrivacyBehaviorEnabled = false as const;
