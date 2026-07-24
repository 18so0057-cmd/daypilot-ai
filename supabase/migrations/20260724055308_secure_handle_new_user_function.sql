/*
# Lock down handle_new_user() trigger function

## Problem
The `public.handle_new_user()` SECURITY DEFINER function was callable via
`/rest/v1/rpc/handle_new_user` by both `anon` and `authenticated` roles.
This exposed the function as a public endpoint — any client could invoke it
directly, even though it is only meant to run as an auth-user-creation trigger.

## Fix
1. Revoke EXECUTE from `PUBLIC`, `anon`, and `authenticated` roles.
2. Grant EXECUTE only to the `postgres` / service-role (trigger execution
   runs with SECURITY DEFINER privileges regardless of caller grants, so
   the trigger continues to work).
3. The function stays SECURITY DEFINER because it must INSERT into
   `public.profiles` during the auth.users trigger — which may run before
   the session is fully established.

## Security impact
- `anon` and `authenticated` can no longer call the function via REST/RPC.
- The `on_auth_user_created` trigger still fires normally on signup.
- No data is lost or changed; only execute privileges are tightened.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;