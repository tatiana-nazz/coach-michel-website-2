export interface OperationDescriptor {
  readonly operationId: string;
  readonly contractReference: string;
}

export interface OperationRegistry {
  get(operationId: string): OperationDescriptor | undefined;
}

/**
 * P4-S04 deliberately provides no production operation registry entries.
 * Operation IDs and transport bindings remain governed by later authority.
 */
export const emptyOperationRegistry: OperationRegistry = {
  get: () => undefined,
};
