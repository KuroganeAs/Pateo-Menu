-- Fired by the ensure_rls event trigger only; never meant to be called over the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
