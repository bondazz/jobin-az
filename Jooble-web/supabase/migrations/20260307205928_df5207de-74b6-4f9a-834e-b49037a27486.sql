-- Remove scraped history entries linked to Glodemia jobs
DELETE FROM public.scraped_jobs
WHERE job_id IN (
  SELECT j.id
  FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE lower(c.slug) = 'glodemia' OR lower(c.name) = 'glodemia'
);

-- Remove Glodemia jobs
DELETE FROM public.jobs
WHERE company_id IN (
  SELECT id
  FROM public.companies
  WHERE lower(slug) = 'glodemia' OR lower(name) = 'glodemia'
);

-- Remove any remaining scrape rows by source URL
DELETE FROM public.scraped_jobs
WHERE source_url ILIKE '%glodemia%';

-- Remove Glodemia company record
DELETE FROM public.companies
WHERE lower(slug) = 'glodemia' OR lower(name) = 'glodemia';