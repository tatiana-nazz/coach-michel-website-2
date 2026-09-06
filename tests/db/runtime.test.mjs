import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const pglitePath = process.env.CMH_PGLITE_MODULE;
if (!pglitePath)
  throw new Error('Set CMH_PGLITE_MODULE to an installed @electric-sql/pglite module entry.');
const { PGlite } = await import(pathToFileURL(pglitePath).href);
const db = new PGlite();
await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
await db.exec(
  'create role migration_owner nologin createrole bypassrls; grant postgres to migration_owner; set role migration_owner',
);
for (const file of readdirSync(resolve('supabase/migrations'))
  .filter((x) => x.endsWith('.sql'))
  .sort()) {
  try {
    await db.exec(readFileSync(resolve('supabase/migrations', file), 'utf8'));
    console.log('Applied', file);
  } catch (e) {
    console.error('Migration failed:', file, e.message, e.detail, e.where);
    throw e;
  }
}
await db.exec('reset role');
console.log('PostgreSQL', (await db.query('select version()')).rows[0].version);

const ids = {
  trainee: '10000000-0000-0000-0000-000000000001',
  other: '10000000-0000-0000-0000-000000000002',
  coach: '10000000-0000-0000-0000-000000000003',
  approver: '10000000-0000-0000-0000-000000000004',
  operator: '10000000-0000-0000-0000-000000000005',
  validator: '10000000-0000-0000-0000-000000000006',
  admin: '10000000-0000-0000-0000-000000000007',
};
const principals = {};
for (const [name, id] of Object.entries(ids)) {
  await db.query('insert into auth.users(id) values($1)', [id]);
  principals[name] = (
    await db.query(
      'update app_principals set principal_ref=$1 where auth_user_id=$2 returning id',
      ['P-' + name, id],
    )
  ).rows[0].id;
}
for (const name of ['trainee', 'other'])
  await db.query(
    "insert into trainee_profiles(trainee_ref,principal_id,status,profile) values($1,$2,'ACTIVE','{}')",
    ['T-' + name, principals[name]],
  );
let grantNo = 0;
async function grant(name, role, cap, resources, subject = null, object = null) {
  for (const res of resources)
    await db.query(
      'insert into principal_grants(grant_ref,principal_id,role_id,capability_id,resource_id,subject_ref,object_ref) values($1,$2,$3,$4,$5,$6,$7)',
      ['G-' + ++grantNo, principals[name], role, cap, res, subject, object],
    );
}
for (const name of ['trainee', 'other']) {
  await grant(name, 'ROL-003', 'CAP-003', ['RES-002', 'RES-003', 'RES-004', 'RES-015']);
  await grant(name, 'ROL-003', 'CAP-004', [
    'RES-006',
    'RES-008',
    'RES-009',
    'RES-010',
    'RES-012',
    'RES-019',
  ]);
  await grant(name, 'ROL-003', 'CAP-005', ['RES-010', 'RES-011', 'RES-012']);
  await grant(name, 'ROL-003', 'CAP-006', ['RES-014']);
}
await grant('coach', 'ROL-004', 'CAP-007', ['RES-006'], 'T-trainee');
await grant('coach', 'ROL-004', 'CAP-008', ['RES-009']);
await grant('coach', 'ROL-004', 'CAP-009', ['RES-008']);
await grant(
  'coach',
  'ROL-004',
  'CAP-012',
  ['RES-006', 'RES-009', 'RES-010', 'RES-015'],
  'T-trainee',
);
await grant(
  'coach',
  'ROL-004',
  'CAP-013',
  ['RES-010', 'RES-011', 'RES-012', 'RES-013'],
  'T-trainee',
);
await grant('approver', 'ROL-007', 'CAP-010', ['RES-008', 'RES-002']);
await grant('approver', 'ROL-007', 'CAP-011', ['RES-015']);
await grant('approver', 'ROL-006', 'CAP-014', ['RES-012', 'RES-013'], 'T-trainee');
await grant('operator', 'ROL-009', 'CAP-017', ['RES-016', 'RES-017']);
await grant('operator', 'ROL-008', 'CAP-016', ['RES-014']);
await grant('operator', 'ROL-011', 'CAP-019', ['RES-018']);
await grant('validator', 'ROL-010', 'CAP-018', ['RES-016', 'RES-017']);
await grant('admin', 'ROL-005', 'CAP-015', ['RES-004', 'RES-005']);
await grant('admin', 'ROL-007', 'CAP-011', ['RES-015']);
await grant('admin', 'ROL-007', 'CAP-010', ['RES-002']);
let passed = 0;
async function as(name) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [ids[name] ?? '']);
  await db.exec(`set role ${name === 'anon' ? 'anon' : 'authenticated'}`);
}
async function cmd(op, payload) {
  return (
    await db.query('select public.cmh_command($1,$2::jsonb) result', [op, JSON.stringify(payload)])
  ).rows[0].result;
}
async function test(label, fn) {
  try {
    await fn();
    passed++;
    console.log('PASS', label);
  } catch (e) {
    console.error('FAIL', label, e.message, e.where);
    throw e;
  }
}
async function denied(fn, code) {
  await assert.rejects(fn, (e) => !code || e.code === code);
}
await test('no notices fails trainee capability closed', async () => {
  await as('trainee');
  assert.equal(
    (await db.query("select has_active_grant('CAP-004','RES-006') ok")).rows[0].ok,
    false,
  );
});
await db.exec('reset role');
const noticeDoc = (
  await db.query(
    "insert into disclosure_documents(disclosure_ref,disclosure_kind,status) values('NOTICE','SERVICE','PUBLISHED') returning id",
  )
).rows[0].id;
await db.query(
  "insert into disclosure_versions(disclosure_document_id,version_ref,version_number,status,locale,body,effective_from) values($1,'NOTICE-EN-1',1,'PUBLISHED','en',jsonb_build_object('title','Fixture notice','body','Synthetic fixture notice content'),now()),($1,'NOTICE-AR-1',1,'PUBLISHED','ar',jsonb_build_object('title','Fixture notice','body','Synthetic fixture notice content'),now())",
  [noticeDoc],
);
await test('explicit current notice acceptance persisted', async () => {
  await as('trainee');
  let r = await cmd('p3s11_apin_009_post_1', {
    disclosureVersionReference: 'NOTICE-EN-1',
    response: 'accept',
  });
  assert.equal(r.decision, 'ACCEPTED');
  assert.equal(
    (await db.query("select has_active_grant('CAP-004','RES-006') ok")).rows[0].ok,
    true,
  );
});
await test('latest translated decline overrides earlier acceptance', async () => {
  await as('trainee');
  await cmd('p3s11_apin_009_post_1', {
    disclosureVersionReference: 'NOTICE-AR-1',
    response: 'decline',
  });
  assert.equal(
    (await db.query("select has_active_grant('CAP-004','RES-006') ok")).rows[0].ok,
    false,
  );
  await cmd('p3s11_apin_009_post_1', {
    disclosureVersionReference: 'NOTICE-AR-1',
    response: 'accept',
  });
});
let content, session, release, completion, support, incident, recovery, validation, reconciliation;
await test('author cannot self-publish policy, independent approval establishes scheduling policy', async () => {
  await as('admin');
  const policy = await cmd('delivery_create_policy_draft', {
    title: 'Fixture coaching time',
    reason: 'Fixture scheduling policy',
    timezone: 'UTC',
    maxAdvanceDays: 30,
    allowPastDays: 1,
  });
  await denied(
    () =>
      cmd('p3s11_apin_037_post_1', {
        versionRef: policy.versionRef,
        decision: 'APPROVE',
        reason: 'Self approval fixture',
      }),
    '42501',
  );
  await as('approver');
  assert.equal(
    (
      await cmd('p3s11_apin_037_post_1', {
        versionRef: policy.versionRef,
        decision: 'APPROVE',
        reason: 'Independent policy fixture',
      })
    ).status,
    'PUBLISHED',
  );
});

await test('coach creates a real draft version', async () => {
  await as('coach');
  content = await cmd('p3s11_apin_027_create_content_draft', {
    title: 'Fixture exercise',
    description: 'Synthetic test only',
    instructions: 'Fixture instruction',
    locale: 'en',
    reason: 'Test fixture setup',
  });
  assert.equal(content.status, 'DRAFT');
  session = await cmd('p3s11_apin_025_create_session_draft', {
    title: 'Fixture session',
    description: 'Synthetic test only',
    reason: 'Test fixture setup',
    durationMinutes: 20,
    exercises: [{ exerciseRef: content.contentRef, sets: 2, reps: 5, restSeconds: 30 }],
  });
  assert.equal(session.versionNumber, 1);
});
await test('unauthorized publication and unapproved release fail closed', async () => {
  await as('coach');
  await denied(
    () =>
      cmd('p3s11_apin_028_post_1', {
        versionRef: content.versionRef,
        decision: 'APPROVE',
        reason: 'Cannot self approve',
      }),
    '42501',
  );
  await denied(
    () =>
      cmd('p3s11_apin_030_post_1', {
        traineeRef: 'T-trainee',
        sessionVersionRef: session.versionRef,
        scheduledFor: new Date().toISOString(),
        reason: 'Unapproved fixture',
        businessIntentRef: 'unapproved-fixture',
      }),
    '40001',
  );
});
await test('independent approver publishes content', async () => {
  await as('approver');
  const r = await cmd('p3s11_apin_028_post_1', {
    versionRef: content.versionRef,
    decision: 'APPROVE',
    reason: 'Independent fixture approval',
  });
  assert.equal(r.status, 'PUBLISHED');
});
await test('published coaching exercise is invisible to anonymous users', async () => {
  await as('anon');
  assert.equal((await db.query('select id,body from content_versions')).rows.length, 0);
  assert.equal((await db.query('select * from content_items')).rows.length, 0);
  await denied(() => cmd('p3s11_apin_019_post_1', {}), '42501');
});
await test('scoped coach cannot assign another trainee', async () => {
  await as('coach');
  await denied(() =>
    cmd('p3s11_apin_030_post_1', {
      traineeRef: 'T-other',
      sessionVersionRef: session.versionRef,
      scheduledFor: new Date().toISOString(),
      reason: 'Wrong subject fixture',
      businessIntentRef: 'wrong-subject-fixture',
    }),
  );
});
await test('approved release is atomic and becomes readable by assigned trainee', async () => {
  await as('coach');
  const releaseBody = {
    traineeRef: 'T-trainee',
    sessionVersionRef: session.versionRef,
    scheduledFor: new Date().toISOString(),
    reason: 'Approved fixture release',
    businessIntentRef: 'release-fixture-intent',
  };
  release = await cmd('p3s11_apin_030_post_1', releaseBody);
  const retry = await cmd('p3s11_apin_030_post_1', releaseBody);
  assert.equal(retry.scheduleRef, release.scheduleRef);
  await denied(
    () => cmd('p3s11_apin_030_post_1', { ...releaseBody, reason: 'Changed payload' }),
    '40001',
  );
  assert.equal(release.status, 'RELEASED');
  await as('trainee');
  assert.equal((await db.query('select * from session_schedules')).rows.length, 1);
  assert.equal((await db.query('select * from session_versions')).rows.length, 1);
  assert.equal((await db.query('select * from content_versions')).rows.length, 1);
});
await test('another trainee sees no schedules/content, even with unscoped self grants', async () => {
  await as('other');
  await cmd('p3s11_apin_009_post_1', {
    disclosureVersionReference: 'NOTICE-EN-1',
    response: 'accept',
  });
  assert.equal((await db.query('select * from session_schedules')).rows.length, 0);
  assert.equal((await db.query('select id,body from content_versions')).rows.length, 0);
  await denied(() =>
    cmd('p3s11_apin_016_post_1', {
      scheduleRef: release.scheduleRef,
      businessIntentRef: 'other-completion-intent',
      clientEvidenceContext: {},
    }),
  );
});
await test('trainee cannot forge direct writes or audit events', async () => {
  await as('trainee');
  await denied(
    () =>
      db.query(
        "insert into workout_completions(completion_ref,session_schedule_id,trainee_principal_id,completed_at) values('forged',gen_random_uuid(),gen_random_uuid(),now())",
      ),
    '42501',
  );
  await denied(
    () =>
      db.query(
        "insert into audit_events(event_ref,action,category,result) values('forged','X','X','X')",
      ),
    '42501',
  );
});
await test('completion is atomic and identical retry is idempotent', async () => {
  await as('trainee');
  const body = {
    scheduleRef: release.scheduleRef,
    businessIntentRef: 'fixture-completion-intent',
    clientEvidenceContext: { note: 'Fixture completed' },
  };
  completion = await cmd('p3s11_apin_016_post_1', body);
  assert.equal(completion.status, 'CONFIRMED');
  const retry = await cmd('p3s11_apin_016_post_1', body);
  assert.equal(retry.completionRef, completion.completionRef);
  assert.equal((await db.query('select * from workout_completions')).rows.length, 1);
  await denied(
    () =>
      cmd('p3s11_apin_016_post_1', {
        ...body,
        clientEvidenceContext: { note: 'Different intent payload' },
      }),
    '40001',
  );
});
await test('support request is durable and hides handler fields at REST boundary', async () => {
  await as('trainee');
  support = await cmd('p3s11_apin_019_post_1', {
    requestCategory: 'training',
    minimumRoutingFacts: { message: 'Fixture support request' },
    consentPurposeContext: { purpose: 'support-request' },
  });
  assert.equal(support.status, 'OPEN');
  await denied(() => db.query('select handler_scope from support_privacy_cases'), '42501');
  await as('operator');
  const r = await cmd('p3s11_apin_039_patch_1', {
    caseRef: support.caseRef,
    expectedStatus: 'OPEN',
    status: 'IN_REVIEW',
    reason: 'Fixture review',
    evidence: ['fixture://support'],
  });
  assert.equal(r.status, 'IN_REVIEW');
});
await test('proposal author cannot authorize own correction', async () => {
  await as('coach');
  reconciliation = await cmd('p3s11_apin_032_post_1', {
    affectedReferences: [completion.completionRef],
    reason: 'Fixture correction',
    proposal: {
      completionRef: completion.completionRef,
      expectedVersion: 1,
      newState: { status: 'CORRECTED', note: 'Fixture' },
    },
  });
  await denied(() =>
    cmd('p3s11_apin_034_post_1', {
      caseRef: reconciliation.caseRef,
      proposalRef: reconciliation.proposalRef,
      decision: 'APPROVE',
      reason: 'Self authorization denied',
    }),
  );
});
await test('independent correction approval increments authoritative version', async () => {
  await as('approver');
  const r = await cmd('p3s11_apin_034_post_1', {
    caseRef: reconciliation.caseRef,
    proposalRef: reconciliation.proposalRef,
    decision: 'APPROVE',
    reason: 'Independent fixture decision',
  });
  assert.equal(r.status, 'APPLIED');
  await as('trainee');
  assert.equal(
    (await db.query('select authoritative_version from workout_completions')).rows[0]
      .authoritative_version,
    2,
  );
});
await test('operational intake and independent validation preserve separation', async () => {
  await as('operator');
  incident = await cmd('p3s11_apin_040_intake', {
    classificationRef: 'data-integrity',
    affectedReferences: [completion.completionRef],
    evidence: { summary: 'Fixture incident evidence', references: ['fixture://incident'] },
  });
  recovery = await cmd('p3s11_apin_041_post_1', {
    incidentRef: incident.incidentRef,
    activityIntent: { category: 'verification', reason: 'Fixture investigation only' },
    evidence: { summary: 'Fixture activity evidence', references: ['fixture://activity'] },
  });
  await denied(() =>
    cmd('p3s11_apin_042_submit_validation', {
      recoveryActivityRef: recovery.recoveryActivityRef,
      result: 'PASS',
      evidence: { summary: 'Cannot validate own work', references: ['fixture://invalid'] },
    }),
  );
  await as('validator');
  validation = await cmd('p3s11_apin_042_submit_validation', {
    recoveryActivityRef: recovery.recoveryActivityRef,
    result: 'PASS',
    evidence: { summary: 'Independent fixture validation', references: ['fixture://validation'] },
  });
  assert.equal(validation.result, 'PASS');
});
await test('technical operator cannot submit validator-only handoff through direct RPC', async () => {
  await as('operator');
  await denied(
    () =>
      cmd('p3s11_apin_043_post_1', {
        validationRef: validation.validationRef,
        targetReferences: [completion.completionRef],
        reason: 'Operator role bypass attempt',
      }),
    '42501',
  );
});
await test('handoff cannot cross incident scope and does not alter trainee state', async () => {
  await as('validator');
  await denied(
    () =>
      cmd('p3s11_apin_043_post_1', {
        validationRef: validation.validationRef,
        targetReferences: ['OTHER-COMPLETION'],
        reason: 'Cross scope fixture',
      }),
    '42501',
  );
  const r = await cmd('p3s11_apin_043_post_1', {
    validationRef: validation.validationRef,
    targetReferences: [completion.completionRef],
    reason: 'Fixture reconciliation handoff',
  });
  assert.equal(r.status, 'PENDING');
  await as('trainee');
  assert.equal(
    (await db.query('select authoritative_version from workout_completions')).rows[0]
      .authoritative_version,
    2,
  );
});
await test('access administrator cannot elevate self or grant privileged authority', async () => {
  await as('admin');
  await denied(
    () =>
      cmd('p3s11_apin_035_post_1', {
        action: 'GRANT',
        principalRef: 'P-admin',
        roleId: 'ROL-003',
        capabilityId: 'CAP-004',
        resourceId: 'RES-010',
        reason: 'Self delegation fixture',
      }),
    '42501',
  );
  await denied(
    () =>
      cmd('p3s11_apin_035_post_1', {
        action: 'GRANT',
        principalRef: 'P-other',
        roleId: 'ROL-006',
        capabilityId: 'CAP-015',
        resourceId: 'RES-005',
        reason: 'Privileged delegation fixture',
      }),
    '42501',
  );
});
await test('audit is append only and restricted to audit reviewer', async () => {
  await as('trainee');
  assert.equal((await db.query('select * from audit_events')).rows.length, 0);
  await as('operator');
  assert.ok((await db.query('select * from audit_events')).rows.length > 10);
  await denied(() => db.query("update audit_events set result='FORGED'"), '42501');
});

await test('derived projections enforce self ownership for unscoped trainee grants', async () => {
  await db.exec('reset role');
  await db.query(
    "insert into derived_status_projections(projection_ref,subject_type,subject_ref,projection_kind,projection) values('PROJ-SELF','TRAINEE','T-trainee','SUMMARY','{}'),('PROJ-OTHER','TRAINEE','T-other','SUMMARY','{}')",
  );
  await as('trainee');
  assert.deepEqual((await db.query('select projection_ref from derived_status_projections')).rows, [
    { projection_ref: 'PROJ-SELF' },
  ]);
  await as('other');
  assert.deepEqual((await db.query('select projection_ref from derived_status_projections')).rows, [
    { projection_ref: 'PROJ-OTHER' },
  ]);
});
await test('suspended principal loses domain reads and commands immediately', async () => {
  await db.exec('reset role');
  await db.query("update app_principals set status='SUSPENDED' where id=$1", [principals.trainee]);
  await as('trainee');
  assert.equal((await db.query('select * from session_schedules')).rows.length, 0);
  await denied(
    () =>
      cmd('p3s11_apin_019_post_1', {
        requestCategory: 'training',
        minimumRoutingFacts: { message: 'Suspended fixture request' },
      }),
    '42501',
  );
  await db.exec('reset role');
  await db.query("update app_principals set status='ACTIVE' where id=$1", [principals.trainee]);
});
await test('wrong role capability tuple never establishes authority', async () => {
  await db.exec('reset role');
  await grant('other', 'ROL-003', 'CAP-015', ['RES-005']);
  await as('other');
  assert.equal(
    (await db.query("select has_active_grant('CAP-015','RES-005') ok")).rows[0].ok,
    false,
  );
  await denied(() =>
    cmd('p3s11_apin_035_post_1', {
      action: 'GRANT',
      principalRef: 'P-trainee',
      roleId: 'ROL-003',
      capabilityId: 'CAP-004',
      resourceId: 'RES-010',
      reason: 'Wrong role fixture',
    }),
  );
});
await test('activity scoped validator reads only related evidence and duplicate validation is rejected', async () => {
  await db.exec('reset role');
  await db.query(
    "update principal_grants set revoked_at=now() where principal_id=$1 and capability_id='CAP-018'",
    [principals.validator],
  );
  await grant('validator', 'ROL-010', 'CAP-018', ['RES-017'], null, recovery.recoveryActivityRef);
  await as('validator');
  assert.equal((await db.query('select * from recovery_activities')).rows.length, 1);
  assert.equal((await db.query('select * from operational_incidents')).rows.length, 1);
  assert.equal((await db.query('select * from recovery_validations')).rows.length, 1);
  await denied(
    () =>
      cmd('p3s11_apin_042_submit_validation', {
        recoveryActivityRef: recovery.recoveryActivityRef,
        result: 'PASS',
        evidence: { summary: 'Duplicate scoped validation', references: ['fixture://duplicate'] },
      }),
    '23505',
  );
});
await test('private command role has no login, no RLS bypass, no client membership, no schema creation', async () => {
  await db.exec('reset role');
  const role = (
    await db.query(
      "select rolcanlogin,rolsuper,rolbypassrls from pg_roles where rolname='cmh_runtime'",
    )
  ).rows[0];
  assert.deepEqual(role, { rolcanlogin: false, rolsuper: false, rolbypassrls: false });
  assert.equal(
    (
      await db.query(
        "select pg_has_role('authenticated','cmh_runtime','MEMBER') member,has_schema_privilege('cmh_runtime','cmh_private','CREATE') can_create",
      )
    ).rows[0].member,
    false,
  );
  assert.equal(
    (await db.query("select has_schema_privilege('cmh_runtime','cmh_private','CREATE') can_create"))
      .rows[0].can_create,
    false,
  );
});

await test('disclosure authoring preserves independent approval and changes required notice coverage', async () => {
  await as('admin');
  const notice = await cmd('delivery_create_disclosure_draft', {
    title: 'Additional fixture notice',
    body: 'Synthetic fixture disclosure body for verification only.',
    locale: 'en',
    reason: 'Test authoring workflow',
  });
  await denied(
    () =>
      cmd('p3s11_apin_028_post_1', {
        versionRef: notice.versionRef,
        decision: 'APPROVE',
        reason: 'Self publication denied',
      }),
    '42501',
  );
  await as('approver');
  assert.equal(
    (
      await cmd('p3s11_apin_028_post_1', {
        versionRef: notice.versionRef,
        decision: 'APPROVE',
        reason: 'Independent disclosure approval',
      })
    ).status,
    'PUBLISHED',
  );
  await as('trainee');
  assert.equal((await db.query('select * from session_schedules')).rows.length, 0);
  await cmd('p3s11_apin_009_post_1', {
    disclosureVersionReference: notice.versionRef,
    response: 'accept',
  });
  assert.equal((await db.query('select * from session_schedules')).rows.length, 1);
});

await test('new Auth identity ignores metadata authority and starts with zero grants', async () => {
  await db.exec('reset role');
  ids.newbie = '10000000-0000-0000-0000-000000000008';
  await db.query(
    'insert into auth.users(id,raw_user_meta_data) values($1,\'{"role":"ROL-006","capability":"CAP-015","admin":true}\')',
    [ids.newbie],
  );
  const row = (
    await db.query('select id,principal_ref from app_principals where auth_user_id=$1', [
      ids.newbie,
    ])
  ).rows[0];
  principals.newbie = row.id;
  assert.equal(
    (await db.query('select * from principal_grants where principal_id=$1', [row.id])).rows.length,
    0,
  );
  await as('newbie');
  assert.equal(
    (await db.query("select has_active_grant('CAP-015','RES-005') ok")).rows[0].ok,
    false,
  );
  await denied(() =>
    cmd('p3s11_apin_019_post_1', {
      requestCategory: 'account',
      minimumRoutingFacts: { message: 'No authority fixture' },
    }),
  );
  await as('admin');
  await cmd('p3s11_apin_035_post_1', {
    action: 'GRANT',
    principalRef: row.principal_ref,
    roleId: 'ROL-003',
    capabilityId: 'CAP-004',
    resourceId: 'RES-006',
    subjectRef: row.principal_ref,
    reason: 'Approved trainee onboarding fixture',
  });
  assert.equal(
    (await db.query('select * from trainee_profiles where principal_id=$1', [row.id])).rows.length,
    1,
  );
});
await test('published provider evidence and approval internals are hidden from visitors and trainees', async () => {
  await as('anon');
  await denied(() => db.query('select provider_evidence from disclosure_versions'), '42501');
  await denied(() => db.query('select created_by_principal_id from disclosure_versions'), '42501');
  await as('trainee');
  await denied(() => db.query('select provider_evidence from disclosure_versions'), '42501');
  assert.equal((await db.query('select * from content_approval_decisions')).rows.length, 0);
});

await test('parent-scoped disclosure approver can review and independently publish the exact draft', async () => {
  await as('admin');
  const notice = await cmd('delivery_create_disclosure_draft', {
    title: 'Scoped fixture notice',
    body: 'Synthetic fixture disclosure for parent scope verification.',
    locale: 'en',
    reason: 'Scoped publication fixture',
  });
  await db.exec('reset role');
  await grant('other', 'ROL-007', 'CAP-010', ['RES-002'], null, notice.disclosureRef);
  await as('other');
  assert.equal(
    (
      await db.query(
        'select version_ref,created_by_principal_id from disclosure_versions where version_ref=$1',
        [notice.versionRef],
      )
    ).rows.length,
    1,
  );
  assert.equal(
    (
      await cmd('p3s11_apin_028_post_1', {
        versionRef: notice.versionRef,
        decision: 'APPROVE',
        reason: 'Independent parent scope fixture',
      })
    ).status,
    'PUBLISHED',
  );
});
console.log(`Verified ${passed} database scenarios.`);
await db.close();
