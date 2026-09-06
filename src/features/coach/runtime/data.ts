import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupportedLocale } from '@/i18n/config';
import {
  collection,
  latestVersion,
  localized,
  numberValue,
  row,
  textValue,
  titleFrom,
  type CoachData,
  type CoachDataset,
  type CoachItem,
  type CoachSection,
  type RecordRow,
} from './types';

const empty = (): CoachDataset => ({ items: [], error: false, total: 0 });
type QueryResult = { data: unknown; error: unknown; count?: number | null };
const mapResult = (result: QueryResult, mapper: (item: RecordRow) => CoachItem): CoachDataset => ({
  items: result.error ? [] : collection(result.data).map(mapper),
  error: Boolean(result.error),
  total: result.error ? null : (result.count ?? null),
});
const basic = (item: RecordRow, ref: string, title: string): CoachItem => ({
  ref: textValue(item[ref]),
  title,
  description: textValue(item.reason),
  status: textValue(item.status),
  date: textValue(item.updated_at) || textValue(item.created_at),
  versionRef: '',
  version: 0,
  extra: {},
});
export function normalizeDefinition(
  item: RecordRow,
  kind: 'program' | 'session',
  locale: SupportedLocale,
): CoachItem {
  const version = latestVersion(item[`${kind}_versions`]);
  const definition = row(version.definition);
  return {
    ...basic(
      item,
      `${kind}_ref`,
      titleFrom(
        definition,
        locale,
        titleFrom(item.metadata, locale, textValue(item[`${kind}_ref`])),
      ),
    ),
    description: localized(definition.description, locale),
    status: textValue(version.status) || textValue(item.status),
    versionRef: textValue(version.version_ref),
    version: numberValue(version.version_number),
    extra: {
      definition,
      ownerPrincipalId: textValue(item.owner_coach_principal_id),
      exercises: collection(version.session_exercise_links)
        .sort((a, b) => numberValue(a.sequence_number) - numberValue(b.sequence_number))
        .map((link) => ({
          exerciseRef: textValue(row(link.content_items).content_ref),
          configuration: row(link.configuration),
          sequence: numberValue(link.sequence_number),
        })),
    },
  };
}
export function normalizeExercise(item: RecordRow, locale: SupportedLocale): CoachItem {
  const version = latestVersion(item.content_versions, locale);
  const body = row(version.body);
  return {
    ...basic(
      item,
      'content_ref',
      titleFrom(body, locale, titleFrom(item.metadata, locale, textValue(item.content_ref))),
    ),
    description: localized(body.description, locale),
    status: textValue(version.status) || textValue(item.status),
    versionRef: textValue(version.version_ref),
    version: numberValue(version.version_number),
    extra: {
      body,
      creatorPrincipalId: textValue(item.created_by_principal_id),
      versionCreatorPrincipalId: textValue(version.created_by_principal_id),
      locale: textValue(version.locale) || locale,
      contentKind: textValue(item.content_kind),
    },
  };
}
const trainee = (item: RecordRow, locale: SupportedLocale): CoachItem => ({
  ...basic(item, 'trainee_ref', titleFrom(item.profile, locale, textValue(item.trainee_ref))),
  description: localized(row(item.profile).goal, locale),
  extra: { principalId: textValue(item.principal_id) },
});
const completion = (item: RecordRow): CoachItem => ({
  ...basic(item, 'completion_ref', textValue(item.completion_ref)),
  date: textValue(item.completed_at),
  status: textValue(row(item.completion_state).status) || 'COMPLETED',
  version: numberValue(item.authoritative_version),
  extra: {
    state: row(item.completion_state),
    subjectPrincipalId: textValue(item.trainee_principal_id),
    scheduleRef: textValue(row(item.session_schedules).schedule_ref),
  },
});
const caseItem = (item: RecordRow): CoachItem => {
  const proposal = latestVersion(item.reconciliation_proposals);
  return {
    ...basic(item, 'case_ref', textValue(item.case_ref)),
    versionRef: textValue(proposal.proposal_ref),
    version: numberValue(proposal.version_number),
    extra: {
      affectedReferences: item.affected_references,
      proposal: row(proposal.proposal),
      proposalReason: textValue(proposal.reason),
      proposalCreatorPrincipalId: textValue(proposal.created_by_principal_id),
      decisions: collection(item.reconciliation_authorization_decisions).map((decision) => ({
        decision: textValue(decision.decision),
        reason: textValue(decision.reason),
        date: textValue(decision.created_at),
      })),
    },
  };
};
const programSelect =
  'program_ref,owner_coach_principal_id,status,metadata,updated_at,program_versions(version_ref,version_number,status,definition)';
const sessionSelect =
  'session_ref,owner_coach_principal_id,status,metadata,updated_at,session_versions(version_ref,version_number,status,definition,session_exercise_links(sequence_number,configuration,content_items!exercise_content_item_id(content_ref)))';
const exerciseSelect =
  'content_ref,created_by_principal_id,content_kind,status,metadata,updated_at,content_versions(version_ref,version_number,locale,body,status,created_by_principal_id)';
const caseSelect =
  'case_ref,status,reason,affected_references,updated_at,reconciliation_proposals(proposal_ref,version_number,proposal,reason,created_by_principal_id),reconciliation_authorization_decisions(decision,reason,created_at)';

/** All reads use the authenticated cookie client and the database's row policies. */
export async function loadCoachData(
  db: SupabaseClient,
  section: CoachSection,
  locale: SupportedLocale,
  reference = '',
): Promise<CoachData> {
  const trainees = () =>
    db
      .from('trainee_profiles')
      .select('trainee_ref,principal_id,status,profile,updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(50);
  const programs = () =>
    db
      .from('program_definitions')
      .select(programSelect, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(50);
  const sessions = () =>
    db
      .from('session_definitions')
      .select(sessionSelect, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(50);
  const exercises = () =>
    db
      .from('content_items')
      .select(exerciseSelect, { count: 'exact' })
      .eq('content_kind', 'EXERCISE')
      .order('updated_at', { ascending: false })
      .limit(50);
  const completions = () =>
    db
      .from('workout_completions')
      .select(
        'completion_ref,trainee_principal_id,completed_at,completion_state,authoritative_version,session_schedules(schedule_ref)',
        { count: 'exact' },
      )
      .order('completed_at', { ascending: false })
      .limit(50);
  const cases = () =>
    db
      .from('reconciliation_cases')
      .select(caseSelect, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(50);

  if (section === 'overview') {
    const [a, b, c] = await Promise.all([trainees(), sessions(), cases()]);
    return {
      primary: mapResult(a, (value) => trainee(value, locale)),
      secondary: mapResult(b, (value) => normalizeDefinition(value, 'session', locale)),
      tertiary: mapResult(c, caseItem),
    };
  }
  if (section === 'trainees')
    return {
      primary: mapResult(await trainees(), (value) => trainee(value, locale)),
      secondary: empty(),
      tertiary: empty(),
    };
  if (section === 'trainee') {
    const result = await db
      .from('trainee_profiles')
      .select('trainee_ref,principal_id,status,profile,updated_at')
      .eq('trainee_ref', reference)
      .limit(1);
    const principalId = textValue(collection(result.data)[0]?.principal_id);
    if (!principalId || result.error)
      return {
        primary: mapResult(result, (value) => trainee(value, locale)),
        secondary: empty(),
        tertiary: empty(),
      };
    const [assignments, finished] = await Promise.all([
      db
        .from('trainee_assignments')
        .select(
          'assignment_ref,status,assigned_at,session_versions(version_ref,version_number,definition),session_schedules(schedule_ref,scheduled_for,status)',
          { count: 'exact' },
        )
        .eq('trainee_principal_id', principalId)
        .order('assigned_at', { ascending: false })
        .limit(50),
      completions().eq('trainee_principal_id', principalId),
    ]);
    return {
      primary: mapResult(result, (value) => trainee(value, locale)),
      secondary: mapResult(assignments, (item) => ({
        ...basic(
          item,
          'assignment_ref',
          titleFrom(row(item.session_versions).definition, locale, textValue(item.assignment_ref)),
        ),
        date: textValue(item.assigned_at),
        extra: { schedules: collection(item.session_schedules) },
      })),
      tertiary: mapResult(finished, completion),
    };
  }
  if (section === 'programs') {
    const [a, b] = await Promise.all([programs(), sessions()]);
    return {
      primary: mapResult(a, (value) => normalizeDefinition(value, 'program', locale)),
      secondary: mapResult(b, (value) => normalizeDefinition(value, 'session', locale)),
      tertiary: empty(),
    };
  }
  if (section === 'prepare') {
    const [a, b] = await Promise.all([sessions().eq('session_ref', reference), exercises()]);
    const primary = mapResult(a, (value) => normalizeDefinition(value, 'session', locale));
    const secondary = mapResult(b, (value) => normalizeExercise(value, locale));
    const linked = collection(primary.items[0]?.extra.exercises).map((item) =>
      textValue(item.exerciseRef),
    );
    const missing = linked.filter((ref) => !secondary.items.some((item) => item.ref === ref));
    if (missing.length) {
      const extra = await db
        .from('content_items')
        .select(exerciseSelect)
        .in('content_ref', missing)
        .limit(100);
      if (extra.error) secondary.error = true;
      else
        secondary.items.push(
          ...collection(extra.data).map((item) => normalizeExercise(item, locale)),
        );
      // A removed/unavailable linked exercise remains visibly removable in the draft.
      for (const ref of missing)
        if (!secondary.items.some((item) => item.ref === ref))
          secondary.items.push({
            ref,
            title: ref,
            description: '',
            status: 'UNAVAILABLE',
            date: '',
            versionRef: '',
            version: 0,
            extra: {},
          });
    }
    return {
      primary,
      secondary,
      tertiary: empty(),
    };
  }
  if (section === 'exercises')
    return {
      primary: mapResult(await exercises(), (value) => normalizeExercise(value, locale)),
      secondary: empty(),
      tertiary: empty(),
    };
  if (section === 'release') {
    const [a, b] = await Promise.all([trainees(), sessions()]);
    return {
      primary: mapResult(a, (value) => trainee(value, locale)),
      secondary: mapResult(b, (value) => normalizeDefinition(value, 'session', locale)),
      tertiary: empty(),
    };
  }
  if (section === 'completions') {
    const [a, b] = await Promise.all([completions(), cases()]);
    return {
      primary: mapResult(a, completion),
      secondary: mapResult(b, caseItem),
      tertiary: empty(),
    };
  }
  if (section === 'reconciliation') {
    const primary = mapResult(await cases().eq('case_ref', reference), caseItem);
    const completionRef = textValue(row(primary.items[0]?.extra.proposal).completionRef);
    const secondary = completionRef
      ? mapResult(await completions().eq('completion_ref', completionRef), completion)
      : empty();
    const item = primary.items[0];
    if (item)
      item.extra.subjectPrincipalId = textValue(secondary.items[0]?.extra.subjectPrincipalId);
    return {
      primary,
      secondary,
      tertiary: empty(),
    };
  }
  const [a, principals, grants, roles, capabilities, resources, b, disclosures, c] =
    await Promise.all([
      db
        .from('policies')
        .select(
          'policy_ref,policy_kind,status,metadata,updated_at,policy_versions(version_ref,version_number,payload,status,created_by_principal_id)',
        )
        .order('updated_at', { ascending: false })
        .limit(50),
      db
        .from('app_principals')
        .select('id,principal_ref,status,updated_at')
        .eq('status', 'ACTIVE')
        .limit(100),
      db
        .from('principal_grants')
        .select(
          'grant_ref,principal_id,role_id,capability_id,resource_id,object_ref,subject_ref,created_at,valid_until',
        )
        .is('revoked_at', null)
        .limit(100),
      db.from('role_catalog').select('role_id,name').order('role_id'),
      db.from('capability_catalog').select('capability_id,name').order('capability_id'),
      db.from('resource_catalog').select('resource_id,name').order('resource_id'),
      db
        .from('support_privacy_cases')
        .select('case_ref,principal_id,request_category,status,minimum_routing_facts,updated_at')
        .order('updated_at', { ascending: false })
        .limit(50),
      db
        .from('disclosure_documents')
        .select(
          'disclosure_ref,disclosure_kind,status,metadata,updated_at,disclosure_versions(version_ref,version_number,locale,body,status,created_by_principal_id)',
        )
        .order('updated_at', { ascending: false })
        .limit(50),
      db
        .from('access_provisioning_records')
        .select('provisioning_ref,target_identity_ref,status,requested_role_ids,updated_at')
        .order('updated_at', { ascending: false })
        .limit(50),
    ]);
  return {
    primary: mapResult(a, (item) => {
      const version = latestVersion(item.policy_versions);
      return {
        ...basic(
          item,
          'policy_ref',
          titleFrom(
            version.payload,
            locale,
            titleFrom(item.metadata, locale, textValue(item.policy_ref)),
          ),
        ),
        versionRef: textValue(version.version_ref),
        version: numberValue(version.version_number),
        status: textValue(version.status) || textValue(item.status),
        extra: {
          payload: row(version.payload),
          creatorPrincipalId: textValue(version.created_by_principal_id),
        },
      };
    }),
    secondary: mapResult(b, (item) => ({
      ...basic(item, 'case_ref', textValue(item.request_category)),
      description:
        textValue(row(item.minimum_routing_facts).message) ||
        textValue(row(item.minimum_routing_facts).summary),
      extra: { subjectPrincipalId: textValue(item.principal_id) },
    })),
    tertiary: mapResult(c, (item) => ({
      ...basic(item, 'provisioning_ref', textValue(item.target_identity_ref)),
      extra: { roles: item.requested_role_ids },
    })),
    disclosures: mapResult(disclosures, (item) => {
      const version = latestVersion(item.disclosure_versions, locale);
      return {
        ...basic(
          item,
          'disclosure_ref',
          titleFrom(version.body, locale, textValue(item.disclosure_ref)),
        ),
        versionRef: textValue(version.version_ref),
        version: numberValue(version.version_number),
        status: textValue(version.status) || textValue(item.status),
        extra: {
          body: row(version.body),
          locale: textValue(version.locale) || locale,
          creatorPrincipalId: textValue(version.created_by_principal_id),
        },
      };
    }),
    authority: {
      principals: collection(principals.data).map((item) => ({
        ...basic(item, 'principal_ref', textValue(item.principal_ref)),
        extra: { principalId: textValue(item.id) },
      })),
      grants: collection(grants.data)
        .filter((item) => !item.valid_until || Date.parse(textValue(item.valid_until)) > Date.now())
        .map((item) => ({
          ...basic(
            item,
            'grant_ref',
            `${textValue(item.role_id)} · ${textValue(item.capability_id)} · ${textValue(item.resource_id)}`,
          ),
          extra: {
            principalId: textValue(item.principal_id),
            objectRef: textValue(item.object_ref),
            subjectRef: textValue(item.subject_ref),
          },
        })),
      roles: collection(roles.data).map((item) => ({
        value: textValue(item.role_id),
        label: textValue(item.name),
      })),
      capabilities: collection(capabilities.data).map((item) => ({
        value: textValue(item.capability_id),
        label: textValue(item.name),
      })),
      resources: collection(resources.data).map((item) => ({
        value: textValue(item.resource_id),
        label: textValue(item.name),
      })),
      error: [principals, grants, roles, capabilities, resources].some((result) =>
        Boolean(result.error),
      ),
    },
  };
}
