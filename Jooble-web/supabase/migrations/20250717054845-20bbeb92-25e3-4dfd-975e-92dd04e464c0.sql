-- PostgREST max rows limit-ini 50000-ə çatdır
ALTER DATABASE postgres SET pgrst.db_max_rows = '50000';

-- Dəyişikliyin tətbiqi üçün PostgREST-i restart edin
SELECT pg_reload_conf();