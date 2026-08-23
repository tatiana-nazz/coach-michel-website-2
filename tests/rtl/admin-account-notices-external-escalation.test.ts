import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getAdminAccountNoticesExternalEscalationViewModel } from '@/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-010/admin-account-notices-external-escalation.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const notice = {
  orderingReference: 'ORDER::neutral/AR-010',
  noticeReference: 'NOTICE::neutral/AR-010',
  heading: 'إشعار يقدمه المستدعي',
  body: 'نص يقدمه المستدعي',
  statusLabel: 'حالة يقدمها المستدعي',
  reviewAvailable: true,
} as const;
const snapshot = {
  workspaceReference: 'WORKSPACE::neutral/AR-010',
  accountReference: 'ACCOUNT::neutral/AR-010',
  adminContextReferences: ['ADMIN::neutral/AR-010'],
  authorityStatusReference: 'AUTHORITY::neutral/AR-010',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-010',
  notices: [notice],
  policyApprovalContexts: [],
  supportPrivacyCases: [],
  externalHandoffOptions: [],
} as const;
const visibility = {
  review_admin_context: true,
  review_notice: true,
  review_policy_approval_context: true,
  review_support_case: true,
  external_handoff: true,
  refresh_context: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-010 English and Arabic direction equivalence', () => {
  it('keeps state, order, consequence, visibility, and exact references equivalent', () => {
    const english = getAdminAccountNoticesExternalEscalationViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getAdminAccountNoticesExternalEscalationViewModel(
      'ar',
      'authoritative_final',
      snapshot,
      visibility,
    );
    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
    expect(arabic.state).toBe(english.state);
    expect(arabic.consequence).toBe(english.consequence);
    expect(arabic.visibleIntents).toEqual(english.visibleIntents);
    expect(arabic.opaqueReferences).toEqual(english.opaqueReferences);
  });

  it('uses semantic direction, neutral references, logical CSS, and retained breakpoints', () => {
    expect(component).toContain('lang={locale}');
    expect(component).toContain('dir={viewModel.direction}');
    expect(component).toContain('<bdi className={styles.reference} dir="ltr">');
    expect(styles).toContain('margin-inline: auto;');
    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('border-inline-start:');
    expect(styles).toContain('@media (min-width: 600px)');
    expect(styles).toContain('@media (min-width: 900px)');
    expect(styles).not.toContain('margin-left:');
    expect(styles).not.toContain('padding-right:');
    expect(styles).not.toContain('direction:');
  });
});
