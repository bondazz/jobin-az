-- Delete scraped_jobs that reference Glodemia's jobs
DELETE FROM scraped_jobs WHERE job_id IN (
  SELECT id FROM jobs WHERE company_id = '1037325b-31ff-4932-9707-19683b000360'
);

-- Delete jobs belonging to Glodemia
DELETE FROM jobs WHERE company_id = '1037325b-31ff-4932-9707-19683b000360';

-- Delete the Glodemia company
DELETE FROM companies WHERE id = '1037325b-31ff-4932-9707-19683b000360';

-- Also delete any scraped_jobs with glodemia in the source_url to allow re-scraping
DELETE FROM scraped_jobs WHERE source_url ILIKE '%glodemia%';