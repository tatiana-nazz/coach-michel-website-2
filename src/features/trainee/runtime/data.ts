import 'server-only';
import type { createSupabaseServerClient } from '@/platform/auth/supabase-server';
import type { SupportedLocale } from '@/i18n/config';
import {
  instructionLines,
  localizedValue,
  recordValue,
  releasedSessionReadable,
  textValue,
} from './model';
import type { TraineeExercise, TraineeSession, TraineeWorkspaceData } from './types';

type DatabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type Row = Record<string, unknown>;

function rows(value: unknown): Row[] {
  return Array.isArray(value) ? value.map(recordValue) : [];
}

function stringList(values: Row[], key: string): string[] {
  return [...new Set(values.map((row) => textValue(row[key])).filter(Boolean))];
}

function assertQueries(results: readonly { error: unknown }[]): void {
  if (results.some((result) => result.error))
    throw new Error('Trainee information is temporarily unavailable.');
}

/** All queries use the signed-in RLS client and an explicit principal scope. */
export async function readTraineeWorkspace(
  supabase: DatabaseClient,
  principalId: string,
  locale: SupportedLocale,
): Promise<TraineeWorkspaceData> {
  const initial = await Promise.all([
    supabase
      .from('trainee_assignments')
      .select('id,status')
      .eq('trainee_principal_id', principalId)
      .eq('status', 'ACTIVE')
      .limit(200),
    supabase
      .from('trainee_profiles')
      .select('trainee_ref,status,profile')
      .eq('principal_id', principalId)
      .maybeSingle(),
    supabase
      .from('account_preferences')
      .select('locale')
      .eq('principal_id', principalId)
      .maybeSingle(),
    supabase
      .from('workout_completions')
      .select('completion_ref,session_schedule_id,completed_at,authoritative_version')
      .eq('trainee_principal_id', principalId)
      .order('completed_at', { ascending: false })
      .limit(200),
    supabase
      .from('completion_intents')
      .select('intent_ref,session_schedule_id,status,submitted_at')
      .eq('trainee_principal_id', principalId)
      .order('submitted_at', { ascending: false })
      .limit(200),
    supabase
      .from('support_privacy_cases')
      .select('case_ref,request_category,status,created_at')
      .eq('principal_id', principalId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  assertQueries(initial);
  const [
    assignmentsResult,
    profileResult,
    preferencesResult,
    completionsResult,
    intentsResult,
    supportResult,
  ] = initial;
  const profile = recordValue(profileResult?.data);
  const profileBody = recordValue(profile.profile);
  const preferences = recordValue(preferencesResult?.data);
  const completions = rows(completionsResult?.data);
  const intents = rows(intentsResult?.data);
  const assignmentIds = stringList(rows(assignmentsResult?.data), 'id');
  const base: TraineeWorkspaceData = {
    displayName:
      localizedValue(profileBody.displayName, locale) || localizedValue(profileBody.name, locale),
    accountRef: textValue(profile.trainee_ref),
    profileStatus: textValue(profile.status),
    savedLocale: preferences.locale === 'ar' ? 'ar' : 'en',
    sessions: [],
    completions: [],
    supportCases: rows(supportResult?.data).map((item) => ({
      ref: textValue(item.case_ref),
      category: textValue(item.request_category),
      status: textValue(item.status),
      createdAt: textValue(item.created_at),
    })),
  };
  if (assignmentIds.length === 0) return base;
  const schedulesResult = await supabase
    .from('session_schedules')
    .select(
      'id,schedule_ref,trainee_assignment_id,session_version_id,scheduled_for,status,schedule_context',
    )
    .in('trainee_assignment_id', assignmentIds)
    .order('scheduled_for', { ascending: true, nullsFirst: false })
    .limit(200);
  assertQueries([schedulesResult]);
  const schedules = rows(schedulesResult.data);
  if (schedules.length === 0) return base;
  const scheduleIds = stringList(schedules, 'id');
  const versionIds = stringList(schedules, 'session_version_id');
  const detail = await Promise.all([
    supabase
      .from('session_versions')
      .select('id,session_definition_id,version_ref,definition,status')
      .in('id', versionIds),
    supabase
      .from('session_exercise_links')
      .select(
        'link_ref,session_version_id,exercise_content_item_id,guidance_content_item_id,sequence_number,configuration',
      )
      .in('session_version_id', versionIds)
      .order('sequence_number'),
    supabase
      .from('release_records')
      .select('session_schedule_id,trainee_assignment_id,status,effective_at')
      .in('trainee_assignment_id', assignmentIds)
      .eq('status', 'RELEASED')
      .lte('effective_at', new Date().toISOString()),
    supabase
      .from('release_records')
      .select('session_schedule_id,trainee_assignment_id,status,effective_at')
      .in('session_schedule_id', scheduleIds)
      .eq('status', 'RELEASED')
      .lte('effective_at', new Date().toISOString()),
  ]);
  assertQueries(detail);
  const versions = rows(detail[0]?.data);
  const links = rows(detail[1]?.data);
  const releases = [...rows(detail[2]?.data), ...rows(detail[3]?.data)];
  const contentIds = [
    ...new Set([
      ...stringList(links, 'exercise_content_item_id'),
      ...stringList(links, 'guidance_content_item_id'),
    ]),
  ];
  const definitionIds = stringList(versions, 'session_definition_id');
  const [contentResult, definitionsResult] = await Promise.all([
    contentIds.length
      ? supabase
          .from('content_versions')
          .select(
            'content_item_id,locale,body,status,effective_from,effective_until,version_number',
          )
          .in('content_item_id', contentIds)
          .eq('status', 'PUBLISHED')
          .order('version_number', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    definitionIds.length
      ? supabase
          .from('session_definitions')
          .select('id,session_ref,metadata')
          .in('id', definitionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  assertQueries([contentResult, definitionsResult]);
  const now = Date.now();
  const content = rows(contentResult.data).filter(
    (item) =>
      (!item.effective_from || Date.parse(textValue(item.effective_from)) <= now) &&
      (!item.effective_until || Date.parse(textValue(item.effective_until)) > now),
  );
  const definitions = rows(definitionsResult.data);
  const selectContent = (id: unknown): Row | undefined =>
    content.find((item) => item.content_item_id === id && item.locale === locale) ??
    content.find((item) => item.content_item_id === id && item.locale === 'en');
  base.sessions = schedules.map((schedule): TraineeSession => {
    const version = versions.find((item) => item.id === schedule.session_version_id);
    const definition = definitions.find((item) => item.id === version?.session_definition_id);
    const body = recordValue(version?.definition);
    const metadata = recordValue(definition?.metadata);
    const completion = completions.find((item) => item.session_schedule_id === schedule.id);
    const intent = intents.find((item) => item.session_schedule_id === schedule.id);
    const released = releasedSessionReadable(
      textValue(schedule.status),
      releases.some(
        (release) =>
          release.session_schedule_id === schedule.id ||
          (release.session_schedule_id == null &&
            release.trainee_assignment_id === schedule.trainee_assignment_id),
      ),
      completion !== undefined,
    );
    const exercises = links
      .filter((link) => link.session_version_id === schedule.session_version_id)
      .map((link): TraineeExercise => {
        const exercise = selectContent(link.exercise_content_item_id);
        const guidance = selectContent(link.guidance_content_item_id);
        const exerciseBody = recordValue(exercise?.body);
        const guidanceBody = recordValue(guidance?.body);
        const configuration = recordValue(link.configuration);
        return {
          ref: textValue(link.link_ref),
          order: Number(link.sequence_number),
          title:
            localizedValue(exerciseBody.title, locale) ||
            (locale === 'ar' ? 'تمرين بدون عنوان' : 'Untitled exercise'),
          description: localizedValue(exerciseBody.description, locale),
          instructions: instructionLines(guidanceBody.instructions ?? exerciseBody.instructions),
          sets: textValue(configuration.sets),
          reps: textValue(configuration.reps),
          rest: textValue(configuration.restSeconds),
          contentLocale: exercise?.locale === 'ar' ? 'ar' : 'en',
          available:
            released &&
            exercise !== undefined &&
            (!link.guidance_content_item_id || guidance !== undefined),
        };
      });
    return {
      scheduleRef: textValue(schedule.schedule_ref),
      sessionRef: textValue(definition?.session_ref),
      versionRef: textValue(version?.version_ref),
      title:
        localizedValue(body.title, locale) ||
        localizedValue(metadata.title, locale) ||
        (locale === 'ar' ? 'جلسة تدريب' : 'Training session'),
      description: localizedValue(body.description, locale),
      scheduledFor: typeof schedule.scheduled_for === 'string' ? schedule.scheduled_for : null,
      status: textValue(schedule.status),
      released,
      exercises,
      completionRef: completion ? textValue(completion.completion_ref) : null,
      intentRef: intent ? textValue(intent.intent_ref) : null,
      intentStatus: intent ? textValue(intent.status) : null,
    };
  });
  base.completions = completions.flatMap((completion) => {
    const schedule = schedules.find((item) => item.id === completion.session_schedule_id);
    return schedule
      ? [
          {
            ref: textValue(completion.completion_ref),
            scheduleRef: textValue(schedule.schedule_ref),
            completedAt: textValue(completion.completed_at),
            version: Number(completion.authoritative_version),
          },
        ]
      : [];
  });
  return base;
}
