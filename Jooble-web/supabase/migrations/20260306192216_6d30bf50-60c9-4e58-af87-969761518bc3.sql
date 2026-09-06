
CREATE TABLE public.scraped_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url text NOT NULL UNIQUE,
    job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
    source_site text NOT NULL DEFAULT 'jobsearch.az',
    scraped_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'success',
    error_message text
);

ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on scraped_jobs"
ON public.scraped_jobs FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::text);

CREATE POLICY "Scraped jobs are viewable by admins"
ON public.scraped_jobs FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::text);
