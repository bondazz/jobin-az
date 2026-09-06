-- Restrict direct column access to application_email for anonymous users
REVOKE SELECT(application_email) ON TABLE public.jobs FROM anon;
-- Keep authenticated (logged-in) users able to read it (admins use this in dashboard)
GRANT SELECT(application_email) ON TABLE public.jobs TO authenticated;