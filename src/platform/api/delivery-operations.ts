/** Explicit delivery additions needed to operate an initially empty project. */
export const deliveryOperationDescriptors = [
  {
    operationId: 'delivery_create_disclosure_draft',
    contractReference: 'CMH-DELIVERY-DISCLOSURE-DRAFT-001',
    method: 'POST',
    path: '/configuration/disclosure-drafts',
  },
  {
    operationId: 'delivery_revise_disclosure_draft',
    contractReference: 'CMH-DELIVERY-DISCLOSURE-DRAFT-001',
    method: 'PATCH',
    path: '/configuration/disclosure-drafts/{draft_ref}',
  },
  {
    operationId: 'delivery_create_policy_draft',
    contractReference: 'CMH-DELIVERY-POLICY-DRAFT-001',
    method: 'POST',
    path: '/configuration/policy-drafts',
  },
  {
    operationId: 'delivery_revise_policy_draft',
    contractReference: 'CMH-DELIVERY-POLICY-DRAFT-001',
    method: 'PATCH',
    path: '/configuration/policy-drafts/{draft_ref}',
  },
] as const;
const descriptors = new Map<string, (typeof deliveryOperationDescriptors)[number]>(
  deliveryOperationDescriptors.map((operation) => [operation.operationId, operation]),
);
export const deliveryOperationRegistry = {
  get: (operationId: string) => descriptors.get(operationId),
};
export const deliveryOperationAuthorities: Record<
  string,
  { roleIds: readonly string[]; capabilityIds: readonly string[]; resourceIds: readonly string[] }
> = {
  delivery_create_disclosure_draft: {
    roleIds: ['ROL-007'],
    capabilityIds: ['CAP-010'],
    resourceIds: ['RES-002'],
  },
  delivery_revise_disclosure_draft: {
    roleIds: ['ROL-007'],
    capabilityIds: ['CAP-010'],
    resourceIds: ['RES-002'],
  },
  delivery_create_policy_draft: {
    roleIds: ['ROL-007'],
    capabilityIds: ['CAP-011'],
    resourceIds: ['RES-015'],
  },
  delivery_revise_policy_draft: {
    roleIds: ['ROL-007'],
    capabilityIds: ['CAP-011'],
    resourceIds: ['RES-015'],
  },
};
