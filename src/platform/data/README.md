# Database runtime contract

All application commands call `supabase.rpc('cmh_command', {p_operation: operationId, p_payload: payload})`. The cookie-authenticated Supabase client is required; no service-role credential is used. The RPC runs atomically. UUID database IDs are not client route references.

- SQLSTATE 42501: denied; 22023: invalid input; P0002: scoped record unavailable; 40001: stale version or lifecycle conflict; 23505: uniqueness conflict.
- Command responses use camelCase. All command paths append `eventRef` after a durable audit insert.
- References from route parameters are merged server-side: scheduleRef, draftRef, caseRef, incidentRef, recoveryActivityRef, validationRef.
- Canonical subject scope is the target principal reference or its trainee reference. Object scope is the stable parent reference (sessionRef/programRef/contentRef), specific case reference, or grant reference. Role, capability, resource, object, subject, validity, revocation and active principal are checked together.
- Authenticated users have scoped SELECT. Sensitive writes are only executable through the allowlisted RPC and a private NOLOGIN NOBYPASSRLS role; RLS remains active inside commands.
- Draft revisions append versions. `expectedVersion` is the current integer version number. Session definition stores title, description and durationMinutes; exercise link configuration stores sets, reps and restSeconds.
- APIN009: `{disclosureVersionReference,response:'accept'|'decline'}` -> `{acceptanceRef,disclosureVersionReference,response,decision,status:'RECORDED'}`. Only the effective published version is accepted.
- APIN016: `{scheduleRef,businessIntentRef,clientEvidenceContext:{note?,reportedCompletedAt?}}` -> `{intentRef,status:'CONFIRMED',completionRef}` after authoritative completion commit. The released schedule must belong to the actor. Repeating an identical business intent is idempotent; no optimistic confirmation.
- APIN019: `{requestCategory,minimumRoutingFacts:{message},consentPurposeContext:{purpose:'support-request'}}` -> `{caseRef,status:'OPEN'}`.
- APIN025: create/revise program or session `{title,description,reason,expectedVersion?,draftRef?,durationMinutes?,exercises?:[{exerciseRef,sets,reps,restSeconds}],exerciseRefs?:string[]}` -> `{programRef|sessionRef,draftRef,versionRef,versionNumber,status:'DRAFT'}`.
- APIN027: create/revise content `{title,description,instructions,locale,reason,expectedVersion?,draftRef?,videoUrl?}` -> `{contentRef,draftRef,versionRef,versionNumber,status:'DRAFT'}`.
- APIN028: `{versionRef,decision:'APPROVE'|'DENY',reason,effectiveFrom?}` -> `{decisionRef,versionRef,status}`. Only PUBLISHED effective content is readable by visitors/trainees.
- APIN029/APIN030: preview/commit `{traineeRef,sessionVersionRef,scheduledFor,reason}` -> preview or `{assignmentRef,scheduleRef,releaseRef,status:'RELEASED'}`. Draft session version is frozen for assignment; referenced exercise versions must already be published.
- APIN032: `{affectedReferences:[completionRef],reason,proposal:{completionRef,expectedVersion,newState:{...}}}` -> `{caseRef,proposalRef,versionNumber,status:'OPEN'}`.
- APIN033 update: `{caseRef,reason,proposal,expectedVersion}` -> `{caseRef,proposalRef,versionNumber,status:'OPEN'}`. APIN034 `{caseRef,proposalRef,decision:'APPROVE'|'DENY',reason}` -> `{caseRef,decisionRef,status}`; proposal authors cannot authorize their own correction.
- APIN039: `{caseRef,expectedStatus,status:'IN_REVIEW'|'ESCALATED'|'RESOLVED',reason,evidence:string[]}` -> `{caseRef,status}`.
- APIN040: `{classificationRef,affectedReferences:string[],evidence:{summary,references:string[]}}` -> `{incidentRef,status:'OPEN'}`.
- APIN041: `{incidentRef,activityIntent:{category,reason},evidence:{summary,references:string[]}}` -> `{recoveryActivityRef,status:'RECORDED'}`. Records work; does not claim external infrastructure changes.
- APIN042: `{recoveryActivityRef,result:'PASS'|'FAIL'|'INCONCLUSIVE',evidence:{summary,references:string[]}}` -> `{validationRef,result,status:'VALIDATED'}`. Actor must differ from recovery initiator.
- APIN043: `{validationRef,targetReferences:string[],reason}` -> `{handoffRef,status:'PENDING'}`. PASS required. Handoff does not itself change trainee state.

No production users, role grants, health data or exercise recommendations are seeded by this migration. Local fixtures use synthetic identities only.

## Additional delivery commands

- `delivery_create_disclosure_draft` / `delivery_revise_disclosure_draft`: `{title,body,locale,reason,draftRef?,expectedVersion?}` returns `{disclosureRef,draftRef,versionRef,versionNumber,status:'DRAFT'}`. Requires `ROL-007/CAP-010/RES-002`; publication uses APIN028 and an independent authorizer. Revisions append versions.
- `delivery_create_policy_draft` / `delivery_revise_policy_draft`: `{title,reason,timezone:'UTC',maxAdvanceDays,allowPastDays,draftRef?,expectedVersion?}` returns `{policyRef,draftRef,versionRef,versionNumber,status:'DRAFT'}`. Requires `ROL-007/CAP-011/RES-015`; publication uses APIN037 and an independent authorizer.
- APIN035: `{action:'GRANT',principalRef,roleId,capabilityId,resourceId,objectRef?,subjectRef?,reason,validUntil?}` or `{action:'REVOKE_GRANT',grantRef,reason}`. Existing, active principals only; self changes are forbidden. Privileged delegation requires an independent privileged-access approver. Scoped administrators cannot expand their delegated object/subject scope. A verified ROL003/004 grant initializes the corresponding empty trainee/coach profile, requiring account authority as well as grant authority.
- APIN037: `{versionRef,decision:'APPROVE'|'DENY',reason}` returns `{decisionRef,versionRef,status:'PUBLISHED'|'REJECTED'}`.
- `cmh_permission_checks({p_checks:[{key,capabilityId,resourceId,objectRef?,subjectId?}]})` returns an object of booleans. Maximum 200 checks. This is a UI visibility helper; the command independently rechecks current authorization.

## Runtime safeguards

Release preview and commit require one effective published `COACHING_TIME` policy. The release stores its policy reference, version and payload. The scheduled time must fit that policy; content becomes available at the release's `effective_at`, which is the requested scheduled time. APIN030 requires `businessIntentRef`; the same actor, operation and intent returns the original durable result. Changing a payload under that key fails with 40001. Current authorization is rechecked even when returning an earlier result.

Pure trainee CAP004/CAP005 reads and commands require an explicit current disclosure decision. Coverage is evaluated per document at its highest effective published version number. The latest recorded decision across equivalent English/Arabic translations wins. No published notices is an unavailable setup, never acceptance. Active privileged ROL004–011 grants allow the privileged workspace to configure and publish notices without a setup deadlock.

APIN043 is validator-only (CAP018), even when called directly through the database API. Technical operators may read relevant history but cannot submit validation handoffs. Validation is unique per recovery activity, handoff is unique per validation, and every handoff target must belong to the parent incident. Neither activity recording nor handoff creation claims an external infrastructure change.

Content approval evidence requires explicit content management authority. Published exercise content is private to an assigned trainee and authorized content staff; only `PUBLIC_GUIDANCE`, `PUBLIC_OVERVIEW` and `PUBLIC_NEXT_STEP` content kinds are anonymous-readable. Raw disclosure `provider_evidence` is unavailable to both anonymous and authenticated client roles. Authenticated staff may read the author UUID needed to hide self-approval actions; anonymous readers cannot. Support case handler and escalation fields are unavailable through direct client column selection.

## Account setup boundary

The migration creates no Auth user, application user, grants, training records, notices or exercise recommendations. An **after-insert Auth trigger** registers each future provider identity as an application principal with zero grants. It uses only the provider-created user ID; user metadata never grants authority. An account without grants cannot enter a role workspace or submit training commands.

The first owner and independent approver still need verified Supabase Auth identities and deliberate bootstrap grants through a trusted operator. Use the Supabase Auth administration interface to establish identities; a publishable browser key cannot administer Auth users. The application does not send invitations or manufacture credentials. Existing Auth identities created before this migration are not backfilled automatically. Once an administrator is bootstrapped, APIN035 manages application grants and initializes empty trainee/coach profiles. The coach can then draft content/sessions, obtain independent content approval and publish a coaching-time policy before assigning training.

A clean fixture of all migrations and the runtime's allow/deny behavior is available in `tests/db/runtime.test.mjs`; see `tests/db/README.md` for reproduction and limits.
