alter default privileges for role postgres in schema public
  revoke execute on functions from PUBLIC, anon, authenticated;

revoke execute on function public.current_app_principal_id() from PUBLIC, anon;
revoke execute on function public.has_active_grant(text, text, text, text) from PUBLIC, anon;

alter function public.reject_audit_event_mutation() security invoker;
revoke execute on function public.reject_audit_event_mutation() from PUBLIC, anon, authenticated;

alter policy app_principals_self_read
on public.app_principals
using (auth_user_id = (select auth.uid()));
