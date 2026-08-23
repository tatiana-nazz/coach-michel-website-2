import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getCompletionAdherenceMonitoringViewModel } from '@/features/coach/screens/scr-coa-008/completion-adherence-monitoring.model';

const component = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-008/completion-adherence-monitoring.tsx',
      import.meta.url,
    ),
  ),
  'utf8',
);
const styles = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/coach/screens/scr-coa-008/completion-adherence-monitoring.module.css',
      import.meta.url,
    ),
  ),
  'utf8',
);
const item = {
  orderingReference: 'ORDER::neutral/AR-008',
  traineeReference: 'TRAINEE::neutral/AR-008',
  scheduleReference: 'SCHEDULE::neutral/AR-008',
  evidenceReferences: ['EVIDENCE::neutral/AR-008'],
  displayLabel: 'عنصر يقدمه المستدعي',
  scheduleStatusLabel: 'حالة جدول يقدمها المستدعي',
  completionStatusLabel: 'حالة إكمال يقدمها المستدعي',
  adherenceStatusLabel: 'حالة التزام يقدمها المستدعي',
  authoritativeTimeLabel: 'وقت موثوق يقدمه المستدعي',
  projectionStatusLabel: 'حالة إسقاط يقدمها المستدعي',
  summary: 'ملخص يقدمه المستدعي',
  reviewAvailable: true,
} as const;
const snapshot = {
  monitoringReference: 'MONITORING::neutral/AR-008',
  authoritativeTimeContext: 'TIME::neutral/AR-008',
  authorityStatusReference: 'AUTHORITY::neutral/AR-008',
  lifecycleStatusReference: 'LIFECYCLE::neutral/AR-008',
  items: [item],
  statusFilterOptions: [],
  sortOptions: [],
} as const;
const visibility = {
  review_item: true,
  refresh_monitoring: true,
  request_projection_refresh_intent: true,
  retry: true,
  reconcile: true,
} as const;

describe('SCR-COA-008 English and Arabic direction equivalence', () => {
  it('keeps state, order, consequence, visibility, and exact references equivalent', () => {
    const english = getCompletionAdherenceMonitoringViewModel(
      'en',
      'authoritative_final',
      snapshot,
      visibility,
    );
    const arabic = getCompletionAdherenceMonitoringViewModel(
      'ar',
      'authoritative_final',
      snapshot,
      visibility,
    );
    expect(english.direction).toBe('ltr');
    expect(arabic.direction).toBe('rtl');
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
