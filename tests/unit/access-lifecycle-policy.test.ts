import { describe, expect, it } from 'vitest';
import {
  activeGrants,
  hasWorkspaceGrant,
  safeAccessRedirect,
  workspaceDestination,
  type ActiveGrant,
} from '@/platform/auth/access-policy';
const grant: ActiveGrant = {
  role_id: 'ROL-004',
  capability_id: 'CAP-007',
  resource_id: 'RES-006',
  object_ref: null,
  subject_ref: 'trainee-a',
  valid_from: '2020-01-01T00:00:00Z',
  valid_until: null,
  revoked_at: null,
};
describe('live access policy', () => {
  it('filters revoked, expired, future and invalid grant windows', () => {
    expect(
      activeGrants(
        [
          grant,
          { ...grant, revoked_at: '2021-01-01' },
          { ...grant, valid_until: '2022-01-01' },
          { ...grant, valid_from: '2100-01-01' },
          { ...grant, valid_from: 'invalid' },
        ],
        Date.parse('2026-01-01'),
      ),
    ).toEqual([grant]);
  });
  it('preserves both object and subject restrictions instead of treating role as blanket authority', () => {
    expect(hasWorkspaceGrant([grant], { capabilityId: 'CAP-007', resourceId: 'RES-006' })).toBe(
      false,
    );
    expect(
      hasWorkspaceGrant([grant], {
        capabilityId: 'CAP-007',
        resourceId: 'RES-006',
        subjectRef: 'trainee-b',
      }),
    ).toBe(false);
    expect(
      hasWorkspaceGrant([grant], {
        capabilityId: 'CAP-007',
        resourceId: 'RES-006',
        subjectRef: 'trainee-a',
      }),
    ).toBe(true);
    expect(
      hasWorkspaceGrant([{ ...grant, object_ref: 'object-a' }], {
        capabilityId: 'CAP-007',
        resourceId: 'RES-006',
        subjectRef: 'trainee-a',
        objectRef: 'object-b',
      }),
    ).toBe(false);
  });
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/access/password?next=https://evil.example',
    '/workspace%0aLocation:bad',
    '/access/callback',
    '/coach',
    'javascript:alert(1)',
  ])('rejects unapproved callback target %s', (value) =>
    expect(safeAccessRedirect(value)).toBe('/workspace'),
  );
  it('allows only the fixed password and workspace destinations', () => {
    expect(safeAccessRedirect('/access/password')).toBe('/access/password');
    expect(safeAccessRedirect('/workspace')).toBe('/workspace');
  });
  it('chooses meaningful landing pages and denies unknown roles', () => {
    expect(workspaceDestination(['ROL-003'])).toBe('/trainee/today');
    expect(workspaceDestination(['ROL-008'])).toBe('/coach/admin');
    expect(workspaceDestination(['ROL-010'])).toBe('/ops/incidents');
    expect(workspaceDestination(['ROL-004'])).toBe('/coach');
    expect(workspaceDestination(['admin'])).toBeNull();
  });
});
