/**
 * Synthetic provider for isolated browser presentation verification.
 * Never deploy or import this adapter from application code.
 * It does not test Supabase authentication, authorization, RLS, or persistence.
 */
const ids = {
  trainee: '10000000-0000-4000-8000-000000000001',
  coach: '10000000-0000-4000-8000-000000000002',
  ops: '10000000-0000-4000-8000-000000000003',
};
const principalIds = {
  trainee: '20000000-0000-4000-8000-000000000001',
  coach: '20000000-0000-4000-8000-000000000002',
  ops: '20000000-0000-4000-8000-000000000003',
};
const timestamp = '2026-09-06T09:00:00.000Z';
const text = (en, ar) => ({ en, ar });
const rows = {
  app_principals: Object.keys(ids).map((area) => ({
    id: principalIds[area],
    principal_ref: `fixture-${area}`,
    auth_user_id: ids[area],
    status: 'ACTIVE',
  })),
  trainee_profiles: [
    {
      id: 'profile-1',
      trainee_ref: 'fixture-trainee',
      principal_id: principalIds.trainee,
      status: 'ACTIVE',
      profile: {
        displayName: text('Alex — fixture trainee', 'أليكس — متدرب تجريبي'),
        title: text('Alex — fixture trainee', 'أليكس — متدرب تجريبي'),
        goal: text('Synthetic data for layout verification.', 'بيانات تجريبية للتحقق من التصميم.'),
      },
      updated_at: timestamp,
    },
  ],
  account_preferences: Object.values(principalIds).map((principal_id) => ({
    principal_id,
    locale: 'en',
  })),
  disclosure_versions: [
    {
      id: 'notice-1',
      disclosure_document_id: 'notice-document-1',
      version_ref: 'fixture-notice',
      version_number: 1,
      locale: 'en',
      status: 'PUBLISHED',
      body: {
        title: 'Fixture notice',
        paragraphs: ['Synthetic notice used only by the local browser check.'],
      },
      effective_from: timestamp,
      effective_until: null,
    },
  ],
  acceptance_records: [
    { principal_id: principalIds.trainee, disclosure_version_id: 'notice-1', decision: 'ACCEPTED' },
  ],
  trainee_assignments: [
    {
      id: 'assignment-1',
      assignment_ref: 'fixture-assignment',
      trainee_principal_id: principalIds.trainee,
      status: 'ACTIVE',
      session_version_id: 'session-version-1',
      assigned_at: timestamp,
      session_versions: {
        version_ref: 'fixture-session-v1',
        version_number: 1,
        definition: { title: text('Movement foundations — fixture', 'أساسيات الحركة — تجريبي') },
      },
      session_schedules: [
        { schedule_ref: 'fixture-schedule', scheduled_for: timestamp, status: 'RELEASED' },
      ],
    },
  ],
  session_schedules: [
    {
      id: 'schedule-1',
      schedule_ref: 'fixture-schedule',
      trainee_assignment_id: 'assignment-1',
      session_version_id: 'session-version-1',
      scheduled_for: timestamp,
      status: 'RELEASED',
      schedule_context: {},
    },
  ],
  session_definitions: [
    {
      id: 'session-definition-1',
      session_ref: 'fixture-session',
      status: 'READY',
      metadata: { title: text('Movement foundations — fixture', 'أساسيات الحركة — تجريبي') },
      updated_at: timestamp,
    },
  ],
  session_versions: [
    {
      id: 'session-version-1',
      session_definition_id: 'session-definition-1',
      version_ref: 'fixture-session-v1',
      version_number: 1,
      status: 'PUBLISHED',
      definition: {
        title: text('Movement foundations — fixture', 'أساسيات الحركة — تجريبي'),
        description: text(
          'A sample session created only to inspect this interface. No training is prescribed by this fixture.',
          'جلسة تجريبية لمعاينة الواجهة فقط. هذه البيانات لا تمثل وصفة تدريبية.',
        ),
        durationMinutes: 25,
      },
    },
  ],
  session_exercise_links: [1, 2, 3].map((number) => ({
    id: `link-${number}`,
    link_ref: `fixture-exercise-${number}`,
    session_version_id: 'session-version-1',
    exercise_content_item_id: `exercise-${number}`,
    guidance_content_item_id: null,
    sequence_number: number,
    configuration: { sets: 2, reps: '8', restSeconds: 45 },
    content_items: { content_ref: `fixture-content-${number}` },
  })),
  release_records: [
    {
      id: 'release-1',
      release_ref: 'fixture-release',
      trainee_assignment_id: 'assignment-1',
      session_schedule_id: 'schedule-1',
      status: 'RELEASED',
      effective_at: timestamp,
    },
  ],
  content_items: [1, 2, 3].map((number) => ({
    id: `exercise-${number}`,
    content_ref: `fixture-content-${number}`,
    content_kind: 'EXERCISE',
    status: 'PUBLISHED',
    metadata: {},
    updated_at: timestamp,
  })),
  content_versions: [1, 2, 3].flatMap((number) =>
    ['en', 'ar'].map((locale) => ({
      id: `exercise-${number}-${locale}`,
      content_item_id: `exercise-${number}`,
      version_ref: `fixture-content-${number}-${locale}-v1`,
      version_number: 1,
      locale,
      status: 'PUBLISHED',
      effective_from: timestamp,
      effective_until: null,
      body: {
        title: locale === 'en' ? `Sample movement ${number}` : `حركة تجريبية ${number}`,
        description:
          locale === 'en'
            ? 'Synthetic exercise content for checking layout and language.'
            : 'محتوى تمرين تجريبي للتحقق من التصميم واللغة.',
        instructions:
          locale === 'en'
            ? [
                'This is a layout fixture, not a training instruction.',
                'The real application displays guidance approved by your coach.',
              ]
            : [
                'هذه بيانات لفحص التصميم، وليست تعليمات تدريبية.',
                'يعرض التطبيق الفعلي التعليمات المعتمدة من مدربك.',
              ],
      },
    })),
  ),
  completion_intents: [],
  workout_completions: [],
  support_privacy_cases: [
    {
      id: 'support-1',
      case_ref: 'fixture-support',
      principal_id: principalIds.trainee,
      request_category: 'training',
      status: 'OPEN',
      minimum_routing_facts: {
        message: 'Synthetic support request for visual verification.',
        summary: 'Synthetic support request for visual verification.',
      },
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],
  reconciliation_cases: [
    {
      id: 'case-1',
      case_ref: 'fixture-case',
      status: 'OPEN',
      reason: 'Synthetic correction case for presentation checks.',
      affected_references: ['fixture-completion'],
      evidence: {},
      created_at: timestamp,
      updated_at: timestamp,
      reconciliation_proposals: [
        {
          proposal_ref: 'fixture-proposal',
          version_number: 1,
          proposal: {
            completionRef: 'fixture-completion',
            expectedVersion: 1,
            newState: { status: 'COMPLETED' },
          },
          reason: 'Fixture proposal for checking the form.',
        },
      ],
      reconciliation_authorization_decisions: [],
    },
  ],
  operational_incidents: [
    {
      id: 'incident-1',
      incident_ref: 'fixture-incident',
      classification_ref: 'availability',
      affected_references: ['fixture-service'],
      status: 'OPEN',
      evidence: {
        summary: 'Synthetic availability incident. No real service outage.',
        references: ['fixture-evidence'],
      },
      created_at: timestamp,
      updated_at: timestamp,
    },
  ],
  recovery_activities: [
    {
      id: 'recovery-1',
      recovery_activity_ref: 'fixture-recovery',
      operational_incident_id: 'incident-1',
      initiated_by_principal_id: principalIds.coach,
      status: 'RECORDED',
      activity_intent: { category: 'investigation', reason: 'Synthetic investigation evidence.' },
      evidence: {
        summary: 'Fixture recovery evidence for visual verification.',
        references: ['fixture-check'],
      },
      started_at: timestamp,
      completed_at: null,
    },
  ],
  recovery_validations: [
    {
      id: 'validation-1',
      validation_ref: 'fixture-validation',
      recovery_activity_id: 'recovery-1',
      validator_principal_id: principalIds.ops,
      result: 'PASS',
      evidence: {
        summary: 'Synthetic passed validation for the handoff layout.',
        references: ['fixture-check'],
      },
      validated_at: timestamp,
    },
  ],
  state_reconciliation_handoffs: [],
  audit_events: [
    {
      id: 1,
      event_ref: 'fixture-audit',
      action: 'FIXTURE_PRESENTATION',
      category: 'TEST',
      result: 'RECORDED',
      occurred_at: timestamp,
    },
  ],
  policies: [],
  access_provisioning_records: [],
  program_definitions: [
    {
      id: 'program-1',
      program_ref: 'fixture-program',
      status: 'DRAFT',
      metadata: { title: text('Steady progress — fixture', 'تقدم ثابت — تجريبي') },
      updated_at: timestamp,
      program_versions: [
        {
          version_ref: 'fixture-program-v1',
          version_number: 1,
          status: 'DRAFT',
          definition: {
            title: text('Steady progress — fixture', 'تقدم ثابت — تجريبي'),
            description: text('A layout-only program example.', 'مثال برنامج لفحص التصميم فقط.'),
          },
        },
      ],
    },
  ],
};
// Separate pending and confirmed fixtures exercise the two visible outcomes without sharing state.
rows.session_schedules.push(
  {
    ...rows.session_schedules[0],
    id: 'schedule-confirmed',
    schedule_ref: 'fixture-confirmed-schedule',
    status: 'COMPLETED',
  },
  {
    ...rows.session_schedules[0],
    id: 'schedule-pending',
    schedule_ref: 'fixture-pending-schedule',
    status: 'RELEASED',
  },
);
rows.release_records.push(
  {
    ...rows.release_records[0],
    id: 'release-confirmed',
    release_ref: 'fixture-confirmed-release',
    session_schedule_id: 'schedule-confirmed',
  },
  {
    ...rows.release_records[0],
    id: 'release-pending',
    release_ref: 'fixture-pending-release',
    session_schedule_id: 'schedule-pending',
  },
);
rows.completion_intents.push({
  intent_ref: 'fixture-pending-intent',
  trainee_principal_id: principalIds.trainee,
  session_schedule_id: 'schedule-pending',
  status: 'SUBMITTED',
  submitted_at: timestamp,
});
rows.workout_completions.push({
  completion_ref: 'fixture-completion',
  trainee_principal_id: principalIds.trainee,
  session_schedule_id: 'schedule-confirmed',
  completed_at: timestamp,
  authoritative_version: 1,
  completion_state: { status: 'COMPLETED' },
  session_schedules: { schedule_ref: 'fixture-confirmed-schedule' },
});

rows.session_definitions[0].session_versions = rows.session_versions.map((version) => ({
  ...version,
  session_exercise_links: rows.session_exercise_links,
}));
for (const item of rows.content_items)
  item.content_versions = rows.content_versions.filter(
    (version) => version.content_item_id === item.id,
  );

const roles = {
  trainee: ['ROL-003'],
  coach: ['ROL-004', 'ROL-005', 'ROL-006', 'ROL-007', 'ROL-008'],
  ops: ['ROL-008', 'ROL-009', 'ROL-010', 'ROL-011'],
};
rows.principal_grants = Object.keys(roles).flatMap((area) =>
  roles[area].flatMap((role_id) =>
    Array.from({ length: 20 }, (_, c) =>
      Array.from({ length: 20 }, (_, r) => ({
        principal_id: principalIds[area],
        role_id,
        capability_id: `CAP-${String(c + 1).padStart(3, '0')}`,
        resource_id: `RES-${String(r + 1).padStart(3, '0')}`,
        object_ref: null,
        subject_ref: null,
        valid_from: '2020-01-01T00:00:00Z',
        valid_until: null,
        revoked_at: null,
      })),
    ).flat(),
  ),
);

// Explicit authoring fixtures: draft review and policy/notice editing use real UI components.
for (const [index, grant] of rows.principal_grants.entries())
  Object.assign(grant, { grant_ref: `fixture-grant-${index}`, created_at: timestamp });
for (const principal of rows.app_principals) principal.updated_at = timestamp;
for (const item of [...rows.session_definitions, ...rows.program_definitions])
  item.owner_coach_principal_id = principalIds.coach;
for (const item of rows.content_items) item.created_by_principal_id = principalIds.coach;
for (const item of rows.content_versions) item.created_by_principal_id = principalIds.coach;
rows.content_items.push({
  id: 'exercise-draft',
  content_ref: 'fixture-content-draft',
  content_kind: 'EXERCISE',
  status: 'DRAFT',
  metadata: {},
  created_by_principal_id: principalIds.coach,
  updated_at: timestamp,
  content_versions: ['en', 'ar'].map((locale) => ({
    version_ref: `fixture-content-draft-${locale}`,
    version_number: 1,
    locale,
    status: 'DRAFT',
    created_by_principal_id: principalIds.ops,
    body: {
      title: locale === 'ar' ? 'مسودة تمرين تجريبية' : 'Fixture exercise draft',
      description:
        locale === 'ar'
          ? 'مسودة لفحص نموذج المراجعة فقط.'
          : 'Draft for form presentation checks only.',
      instructions:
        locale === 'ar'
          ? 'محتوى تجريبي وليس تعليمات تدريب.'
          : 'Synthetic content, not training instructions.',
    },
  })),
});
rows.disclosure_documents = [
  {
    id: 'draft-notice-document',
    disclosure_ref: 'fixture-draft-notice',
    disclosure_kind: 'ACCOUNT_NOTICE',
    status: 'DRAFT',
    metadata: {},
    updated_at: timestamp,
    disclosure_versions: ['en', 'ar'].map((locale) => ({
      version_ref: `fixture-draft-notice-${locale}`,
      version_number: 1,
      locale,
      status: 'DRAFT',
      created_by_principal_id: principalIds.ops,
      body: {
        title: locale === 'ar' ? 'مسودة إشعار تجريبية' : 'Fixture notice draft',
        body:
          locale === 'ar'
            ? 'نص تجريبي لمعاينة نموذج الإشعار. ليس إشعاراً قانونياً نافذاً.'
            : 'Synthetic text for notice form presentation. This is not an effective legal notice.',
      },
    })),
  },
];
rows.policies = [
  {
    id: 'fixture-policy-id',
    policy_ref: 'fixture-policy',
    policy_kind: 'SCHEDULING',
    status: 'DRAFT',
    metadata: {},
    updated_at: timestamp,
    policy_versions: [
      {
        version_ref: 'fixture-policy-v1',
        version_number: 1,
        status: 'DRAFT',
        created_by_principal_id: principalIds.ops,
        payload: {
          title: text('Fixture scheduling policy', 'سياسة جدولة تجريبية'),
          timezone: 'UTC',
          maxAdvanceDays: 60,
          allowPastDays: 0,
        },
      },
    ],
  },
];
rows.role_catalog = [...new Set(Object.values(roles).flat())].map((role_id) => ({
  role_id,
  name: `Fixture ${role_id}`,
}));
rows.capability_catalog = Array.from({ length: 20 }, (_, index) => ({
  capability_id: `CAP-${String(index + 1).padStart(3, '0')}`,
  name: `Fixture action ${index + 1}`,
}));
rows.resource_catalog = Array.from({ length: 20 }, (_, index) => ({
  resource_id: `RES-${String(index + 1).padStart(3, '0')}`,
  name: `Fixture resource ${index + 1}`,
}));

export function fixtureSession(area) {
  const user = {
    id: ids[area],
    aud: 'authenticated',
    role: 'authenticated',
    email: `${area}@fixture.invalid`,
    email_confirmed_at: timestamp,
    phone: '',
    confirmed_at: timestamp,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { fixture: true },
    identities: [],
    created_at: timestamp,
    updated_at: timestamp,
    is_anonymous: false,
  };
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: 4102444800, iat: 1788685200 })}.synthetic-not-a-signature`;
  return {
    user,
    access_token: token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: 4102444800,
    refresh_token: 'synthetic-not-a-refresh-token',
  };
}

function match(value, filter) {
  if (filter.startsWith('eq.')) return String(value) === filter.slice(3);
  if (filter.startsWith('is.'))
    return filter.slice(3) === 'null' ? value == null : String(value) === filter.slice(3);
  if (filter.startsWith('in.('))
    return filter
      .slice(4, -1)
      .split(',')
      .map((s) => s.replaceAll('"', ''))
      .includes(String(value));
  if (filter.startsWith('lte.')) return String(value) <= filter.slice(4);
  if (filter.startsWith('gte.')) return String(value) >= filter.slice(4);
  return true;
}

export function createFixtureProvider({ providerHost }) {
  let area = 'trainee';
  const requests = [];
  const blocked = [];
  const unexpected = [];
  const permissionCalls = [];
  const fail = (message) => {
    unexpected.push(message);
    throw Error(message);
  };
  function setArea(value) {
    area = value;
  }
  async function fetchFixture(input, init) {
    const url = new URL(
      typeof input === 'string' || input instanceof URL ? String(input) : input.url,
    );
    if (url.hostname !== providerHost) {
      blocked.push(url.origin);
      throw new Error(`Isolated presentation test blocked outbound request: ${url.origin}`);
    }
    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
    requests.push({ method, path: url.pathname });
    const response = (payload, extra = {}) =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...extra },
      });
    if (url.pathname === '/auth/v1/user') return response(fixtureSession(area).user);
    if (url.pathname === '/auth/v1/token') return response(fixtureSession(area));
    if (url.pathname === '/rest/v1/rpc/cmh_permission_checks' && method === 'POST') {
      const raw = init?.body ?? (input instanceof Request ? await input.clone().text() : '');
      let body;
      try {
        body = JSON.parse(String(raw));
      } catch {
        return fail('Invalid synthetic permission RPC body');
      }
      if (
        !body ||
        Object.keys(body).some((key) => key !== 'p_checks') ||
        !Array.isArray(body.p_checks) ||
        body.p_checks.length > 200
      )
        return fail('Unexpected synthetic permission RPC shape');
      const allowedPairs = new Set([
        'CAP-008/RES-009',
        'CAP-009/RES-008',
        'CAP-010/RES-008',
        'CAP-010/RES-002',
        'CAP-011/RES-015',
        'CAP-012/RES-010',
        'CAP-013/RES-012',
        'CAP-013/RES-013',
        'CAP-014/RES-012',
        'CAP-014/RES-013',
        'CAP-015/RES-005',
        'CAP-016/RES-014',
      ]);
      const allowed = {};
      for (const check of body.p_checks) {
        if (
          !check ||
          typeof check.key !== 'string' ||
          Object.keys(check).some(
            (key) => !['key', 'capabilityId', 'resourceId', 'objectRef', 'subjectId'].includes(key),
          )
        )
          return fail('Unexpected synthetic permission check');
        allowed[check.key] =
          area === 'coach' && allowedPairs.has(`${check.capabilityId}/${check.resourceId}`);
      }
      permissionCalls.push({
        checks: body.p_checks.length,
        syntheticallyAllowed: Object.values(allowed).filter(Boolean).length,
      });
      return response(allowed);
    }
    if (!url.pathname.startsWith('/rest/v1/'))
      return fail(`Unhandled fixture endpoint ${url.pathname}`);
    const table = url.pathname.slice('/rest/v1/'.length);
    if (method !== 'GET' && method !== 'HEAD')
      return fail(`Fixture adapter does not implement mutations: ${table}`);
    if (!(table in rows)) return fail(`Unhandled fixture table ${table}`);
    let selected = rows[table].filter((row) =>
      [...url.searchParams].every(
        ([key, filter]) =>
          ['select', 'order', 'offset', 'limit'].includes(key) || match(row[key], filter),
      ),
    );
    const total = selected.length;
    selected = selected.slice(
      Number(url.searchParams.get('offset') ?? 0),
      Number(url.searchParams.get('offset') ?? 0) + Number(url.searchParams.get('limit') ?? 10000),
    );
    const payload = headers.get('Accept')?.includes('application/vnd.pgrst.object+json')
      ? (selected[0] ?? null)
      : selected;
    return response(payload, { 'Content-Range': `0-${Math.max(0, selected.length - 1)}/${total}` });
  }
  return { fetch: fetchFixture, setArea, requests, blocked, unexpected, permissionCalls };
}
