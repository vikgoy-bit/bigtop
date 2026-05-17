DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT queue_name FROM pgmq.list_queues() LOOP
    PERFORM pgmq.purge_queue(r.queue_name);
  END LOOP;
END $$;

UPDATE public.email_send_log
SET status = 'failed',
    error_message = COALESCE(error_message, 'Cleared: test backlog purged')
WHERE status IN ('pending','dlq');