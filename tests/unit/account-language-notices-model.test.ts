import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  accountLanguageNoticesErrorCodes,
  accountLanguageNoticesStates,
  createAccountLanguageNoticesIntent,
  getAccountLanguageNoticesViewModel,
  isAccountLanguageNoticesIntentEnabled,
  mapAccountLanguageNoticesErrorCode,
} from '@/features/trainee/screens/scr-trn-007/account-language-notices.model';

const modelSource = readFileSync(
  fileURLToPath(
    new URL(
      '../../src/features/trainee/screens/scr-trn-007/account-language-notices.model.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

const snapshot = {
  accountReference: 'ACCOUNT::opaque/TRN-007',
  boundedPrincipalContext: 'PRINCIPAL-CONTEXT::bounded/TRN-007',
  audienceContext: 'AUDIENCE::bounded/TRN-007',
  effectiveTimeContext: 'EFFECTIVE-TIME::authoritative/TRN-007',
  authorityStatusReference: 'AUTHORITY-STATUS::opaque/TRN-007',
  notices: [
    {
      noticeReference: 'NOTICE::opaque/TRN-007/1',
      heading: 'Caller-supplied notice heading',
      body: 'Caller-supplied notice body',
      effectiveReference: 'EFFECTIVE::opaque/TRN-007/1',
    },
  ],
  retryContext: 'RETRY::opaque/TRN-007',
} as const;

const visibility = {
  refresh_notices: true,
  retry: false,
  reconcile: true,
} as const;

describe('SCR-TRN-007 account language notices model', () => {
  it('keeps the governed state and exact mapped error vocabulary distinct', () => {
    expect(accountLanguageNoticesStates).toContain('loading');
    expect(accountLanguageNoticesStates).toContain('empty');
    expect(accountLanguageNoticesStates).toContain('validation_error');
    expect(accountLanguageNoticesStates).toContain('pending');
    expect(accountLanguageNoticesStates).toContain('recovery');
    expect(accountLanguageNoticesStates).toContain('authoritative_final');
    expect(accountLanguageNoticesErrorCodes).toEqual([
      'AUTHENTICATION_REQUIRED_OR_INVALID',
      'AUTHORITY_DENIED',
      'DEPENDENCY_UNAVAILABLE',
      'RATE_LIMITED',
      'RESOURCE_NOT_FOUND_OR_UNAVAILABLE',
      'STALE_OR_CONFLICTING_STATE',
    ]);
    expect(mapAccountLanguageNoticesErrorCode('AUTHORITY_DENIED')).toBe('authority_denied');
    expect(mapAccountLanguageNoticesErrorCode('RESOURCE_NOT_FOUND_OR_UNAVAILABLE')).toBe(
      'resource_not_found_or_unavailable',
    );
  });

  it('preserves caller-fed account, notice, audience, and effective context exactly', () => {
    const viewModel = getAccountLanguageNoticesViewModel('ar', 'ready', snapshot, visibility);
    const refresh = createAccountLanguageNoticesIntent('refresh_notices', snapshot);
    const reconcile = createAccountLanguageNoticesIntent('reconcile', snapshot);

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.opaqueReferences).toEqual({
      accountReference: snapshot.accountReference,
      authorityStatusReference: snapshot.authorityStatusReference,
      noticeReferences: [snapshot.notices[0].noticeReference],
    });
    expect(refresh).toEqual({
      kind: 'refresh_notices',
      accountReference: snapshot.accountReference,
      audienceContext: snapshot.audienceContext,
      effectiveTimeContext: snapshot.effectiveTimeContext,
    });
    expect(reconcile).toEqual({
      kind: 'reconcile',
      accountReference: snapshot.accountReference,
      noticeReferences: [snapshot.notices[0].noticeReference],
    });
  });

  it('enables only caller-visible intents supported by explicit state and context', () => {
    const viewModel = getAccountLanguageNoticesViewModel('en', 'ready', snapshot, visibility);

    expect(viewModel.visibleIntents).toEqual(['refresh_notices', 'reconcile']);
    expect(isAccountLanguageNoticesIntentEnabled('ready', 'refresh_notices', snapshot)).toBe(true);
    expect(isAccountLanguageNoticesIntentEnabled('pending', 'refresh_notices', snapshot)).toBe(
      false,
    );
    expect(isAccountLanguageNoticesIntentEnabled('rate_limited', 'retry', snapshot)).toBe(true);
    expect(isAccountLanguageNoticesIntentEnabled('authority_denied', 'retry', snapshot)).toBe(
      false,
    );
  });

  it('does not infer persistence, transport, navigation, device time, or durable success', () => {
    expect(
      getAccountLanguageNoticesViewModel('en', 'ready', snapshot, visibility).authoritativeFinal,
    ).toBe(false);
    expect(
      getAccountLanguageNoticesViewModel('en', 'authoritative_final', snapshot, visibility)
        .authoritativeFinal,
    ).toBe(true);
    expect(modelSource).not.toContain('fetch(');
    expect(modelSource).not.toContain('useRouter');
    expect(modelSource).not.toContain('localStorage');
    expect(modelSource).not.toContain('Date.now');
    expect(modelSource).not.toContain('new Date');
    expect(modelSource).not.toContain('accept_notice');
  });
});
