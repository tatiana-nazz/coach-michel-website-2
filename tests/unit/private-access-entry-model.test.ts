import { describe, expect, it } from 'vitest';

import { getPrivateAccessEntryViewModel } from '@/features/access/screens/scr-acc-001/private-access-entry.model';

describe('SCR-ACC-001 private access entry view model', () => {
  it('starts at the invited-account boundary without assuming private authority', () => {
    const viewModel = getPrivateAccessEntryViewModel('en', 'default');

    expect(viewModel.direction).toBe('ltr');
    expect(viewModel.statusMessage).toBe('Not signed in');
    expect(viewModel.showCredentialForm).toBe(true);
    expect(viewModel.copy.invitedNotice).toContain('invited by Coach Michel');
    expect(viewModel.copy.invitedNotice).toContain('no public sign-up');
  });

  it('treats access errors as explicit alerts', () => {
    const viewModel = getPrivateAccessEntryViewModel('en', 'authentication_required');

    expect(viewModel.statusRole).toBe('alert');
    expect(viewModel.statusTone).toBe('danger');
    expect(viewModel.statusMessage).toContain('could not be established');
    expect(viewModel.showCredentialForm).toBe(true);
  });

  it('keeps the recovered outcome separate from normal credential entry', () => {
    const viewModel = getPrivateAccessEntryViewModel('en', 'recovered');

    expect(viewModel.statusTone).toBe('success');
    expect(viewModel.showCredentialForm).toBe(false);
    expect(viewModel.outcomeTitle).toBe('Recovery completed');
  });

  it('renders authenticated session establishment as a bounded outcome', () => {
    const viewModel = getPrivateAccessEntryViewModel('en', 'authenticated');

    expect(viewModel.statusTone).toBe('success');
    expect(viewModel.statusMessage).toBe('Authenticated');
    expect(viewModel.showCredentialForm).toBe(false);
    expect(viewModel.outcomeTitle).toBe('Private access established');
    expect(viewModel.outcomeBody).toContain('access context');
  });

  it('keeps transient provider failure recoverable without exposing provider details', () => {
    const viewModel = getPrivateAccessEntryViewModel('en', 'unavailable');

    expect(viewModel.statusRole).toBe('alert');
    expect(viewModel.statusTone).toBe('warning');
    expect(viewModel.showCredentialForm).toBe(true);
    expect(viewModel.statusMessage).toContain('temporarily unavailable');
  });

  it('provides a genuine Arabic RTL presentation of the same access boundary', () => {
    const viewModel = getPrivateAccessEntryViewModel('ar', 'authenticated');

    expect(viewModel.direction).toBe('rtl');
    expect(viewModel.statusMessage).toBe('تمت المصادقة');
    expect(viewModel.copy.invitedNotice).toContain('لا يوجد تسجيل عام');
    expect(viewModel.outcomeTitle).toBe('تم إنشاء الدخول الخاص');
  });
});
