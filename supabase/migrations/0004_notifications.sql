create or replace function public.enqueue_due_notifications()
returns void
language plpgsql
security definer
as $$
begin
  insert into public.notifications_queue (property_id, tenant_id, message, notification_type, due_date)
  select
    cs.property_id,
    cs.tenant_id,
    concat(initcap(cs.charge_type::text), ' for ', cs.month_label, ' is overdue'),
    'overdue',
    cs.due_date
  from public.charge_schedules cs
  where cs.paid_at is null
    and cs.due_date < current_date
    and not exists (
      select 1 from public.notifications_queue nq
      where nq.property_id = cs.property_id
        and nq.tenant_id is not distinct from cs.tenant_id
        and nq.notification_type = 'overdue'
        and nq.due_date = cs.due_date
    );

  insert into public.notifications_queue (property_id, tenant_id, message, notification_type, due_date)
  select
    cs.property_id,
    cs.tenant_id,
    concat(initcap(cs.charge_type::text), ' for ', cs.month_label, ' is due soon'),
    'upcoming',
    cs.due_date
  from public.charge_schedules cs
  where cs.paid_at is null
    and cs.due_date between current_date and current_date + interval '5 days'
    and not exists (
      select 1 from public.notifications_queue nq
      where nq.property_id = cs.property_id
        and nq.tenant_id is not distinct from cs.tenant_id
        and nq.notification_type = 'upcoming'
        and nq.due_date = cs.due_date
    );
end;
$$;

select cron.schedule(
  'enqueue-payment-notifications-daily',
  '0 8 * * *',
  $$select public.enqueue_due_notifications();$$
);
-- 0004_notifications.sql
-- Notification queueing function and pg_cron schedule.

begin;

create extension if not exists pg_cron;
create schema if not exists private;

create unique index if not exists notifications_queue_daily_dedupe_idx
  on public.notifications_queue (
    manager_id,
    notification_type,
    related_charge_schedule_id,
    date_trunc('day', scheduled_for)
  );

create or replace function private.enqueue_upcoming_and_overdue_notifications()
returns integer
language plpgsql
security definer
set search_path = public, private, extensions, pg_temp
as $$
declare
  v_inserted integer := 0;
begin
  with candidate_upcoming as (
    select
      cs.manager_id,
      cs.id as charge_schedule_id,
      coalesce(nullif(t.email::text, ''), nullif(t.phone, ''), 'manager:' || cs.manager_id::text) as recipient,
      cs.due_date
    from public.charge_schedules cs
    left join public.tenants t
      on t.id = cs.tenant_id
     and t.manager_id = cs.manager_id
    left join public.manager_settings ms
      on ms.manager_id = cs.manager_id
    where cs.status in ('scheduled', 'pending')
      and cs.due_date >= current_date
      and cs.due_date <= current_date + coalesce(ms.notify_days_before_due, 3)
  ),
  ins_upcoming as (
    insert into public.notifications_queue (
      manager_id,
      notification_type,
      channel,
      recipient,
      subject,
      body,
      payload,
      related_charge_schedule_id,
      scheduled_for,
      status
    )
    select
      cu.manager_id,
      'upcoming_due',
      'in_app',
      cu.recipient,
      'Upcoming payment due',
      'A scheduled charge is coming due soon.',
      jsonb_build_object('charge_schedule_id', cu.charge_schedule_id, 'due_date', cu.due_date),
      cu.charge_schedule_id,
      now(),
      'pending'
    from candidate_upcoming cu
    on conflict do nothing
    returning 1
  ),
  candidate_overdue as (
    select
      cs.manager_id,
      cs.id as charge_schedule_id,
      coalesce(nullif(t.email::text, ''), nullif(t.phone, ''), 'manager:' || cs.manager_id::text) as recipient,
      cs.due_date
    from public.charge_schedules cs
    left join public.tenants t
      on t.id = cs.tenant_id
     and t.manager_id = cs.manager_id
    where cs.status in ('scheduled', 'pending', 'overdue')
      and cs.due_date < current_date
  ),
  ins_overdue as (
    insert into public.notifications_queue (
      manager_id,
      notification_type,
      channel,
      recipient,
      subject,
      body,
      payload,
      related_charge_schedule_id,
      scheduled_for,
      status
    )
    select
      co.manager_id,
      'overdue_due',
      'in_app',
      co.recipient,
      'Payment overdue',
      'A charge is overdue and requires follow-up.',
      jsonb_build_object('charge_schedule_id', co.charge_schedule_id, 'due_date', co.due_date),
      co.charge_schedule_id,
      now(),
      'pending'
    from candidate_overdue co
    on conflict do nothing
    returning 1
  )
  select
    coalesce((select count(*) from ins_upcoming), 0) +
    coalesce((select count(*) from ins_overdue), 0)
  into v_inserted;

  return v_inserted;
end;
$$;

do $$
declare
  v_job_id bigint;
begin
  select jobid
    into v_job_id
    from cron.job
   where jobname = 'enqueue-property-notifications'
   limit 1;

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'enqueue-property-notifications',
    '15 7 * * *',
    $$select private.enqueue_upcoming_and_overdue_notifications();$$
  );
end;
$$;

commit;
