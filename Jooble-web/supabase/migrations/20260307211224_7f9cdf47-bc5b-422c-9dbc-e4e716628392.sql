DELETE FROM public.scraped_jobs
WHERE job_id IN (
  SELECT j.id FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE lower(c.slug) = 'glodemia' OR lower(c.name) ILIKE '%glodemia%'
);

DELETE FROM public.jobs
WHERE company_id IN (
  SELECT id FROM public.companies
  WHERE lower(slug) = 'glodemia' OR lower(name) ILIKE '%glodemia%'
);

DELETE FROM public.scraped_jobs WHERE source_url ILIKE '%glodemia%';

DELETE FROM public.companies
WHERE lower(slug) = 'glodemia' OR lower(name) ILIKE '%glodemia%';