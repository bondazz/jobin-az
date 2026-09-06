-- pg_cron və pg_net extension-larını aktivləşdir (əgər yoxdursa)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron job: hər gün saat 03:00-da sitemap yenilənir
SELECT cron.schedule(
  'update-sitemap-daily',
  '0 3 * * *', -- Hər gün saat 03:00 (gecə)
  $$
  SELECT
    net.http_post(
      url := 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/update-sitemap',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0"}'::jsonb,
      body := concat('{"triggered_at": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);