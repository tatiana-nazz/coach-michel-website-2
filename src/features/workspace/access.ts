import { redirect } from 'next/navigation';
import { requireWorkspaceSession } from '@/platform/auth/access-context';

export type WorkspaceArea = 'trainee' | 'coach' | 'ops';
const areaRoles: Record<WorkspaceArea, readonly string[]> = {
  trainee: ['ROL-003'],
  coach: ['ROL-004', 'ROL-005', 'ROL-006', 'ROL-007', 'ROL-008'],
  ops: ['ROL-008', 'ROL-009', 'ROL-010', 'ROL-011'],
};

/** Navigation boundary; every resource is independently protected by RLS and command checks. */
export async function requireWorkspaceAccess(
  area: WorkspaceArea,
  options: { requireNotices?: boolean } = {},
) {
  const context = await requireWorkspaceSession(options);
  if (!context.roleIds.some((role) => areaRoles[area].includes(role))) {
    redirect('/workspace?state=forbidden');
  }
  return { ...context, principalId: context.principal.id };
}
