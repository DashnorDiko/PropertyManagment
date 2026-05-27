create unique index if not exists uq_active_tenancy_per_property
  on public.property_tenancies(property_id)
  where lease_end is null;

create index if not exists idx_tenancies_property on public.property_tenancies(property_id);
create index if not exists idx_tenancies_tenant on public.property_tenancies(tenant_id);
create index if not exists idx_charge_due_date on public.charge_schedules(due_date);
create index if not exists idx_charge_property on public.charge_schedules(property_id);
create index if not exists idx_charge_currency on public.charge_schedules(currency);
create index if not exists idx_payments_currency on public.payments(currency);
create index if not exists idx_payments_property on public.payments(property_id);
create index if not exists idx_notifications_processed on public.notifications_queue(processed, due_date);
create index if not exists idx_properties_status on public.properties(status);

alter table public.properties
  add constraint chk_empty_property_fields
  check (
    status <> 'empty'
    or (apartment_name is not null and subtitle is not null and buyer_name is null)
  );

alter table public.properties
  add constraint chk_sold_property_fields
  check (
    status <> 'sold'
    or (buyer_name is not null and apartment_name is null and subtitle is null)
  );

alter table public.property_tenancies
  add constraint chk_lease_dates
  check (lease_end is null or lease_end > lease_start);
-- 0002_constraints_and_indexes.sql
-- Integrity constraints, business guards, and query indexes.

begin;

create schema if not exists private;

alter table public.properties
  add constraint properties_sold_buyer_semantics_check
  check (
    (status = 'sold' and buyer_name is not null and btrim(buyer_name) <> '' and sold_at is not null)
    or
    (status <> 'sold' and buyer_name is null and sold_at is null)
  );

alter table public.properties
  add constraint properties_empty_has_no_buyer_check
  check (
    status <> 'empty' or (buyer_name is null and sold_at is null)
  );

alter table public.charge_schedules
  add constraint charge_schedules_paid_at_consistency_check
  check (
    (status = 'paid' and paid_at is not null) or (status <> 'paid' and paid_at is null)
  );

create or replace function private.guard_property_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('empty', 'sold') and exists (
    select 1
    from public.property_tenancies pt
    where pt.property_id = new.id
      and pt.ends_on is null
  ) then
    raise exception 'Cannot set property % to % while an active tenancy exists', new.id, new.status;
  end if;

  return new;
end;
$$;

create or replace function private.guard_active_tenancy_for_property_status()
returns trigger
language plpgsql
as $$
declare
  v_status public.property_status;
begin
  if new.ends_on is null then
    select p.status
      into v_status
      from public.properties p
     where p.id = new.property_id;

    if v_status in ('empty', 'sold') then
      raise exception 'Property % is %, cannot create/update active tenancy', new.property_id, v_status;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_property_status_transition on public.properties;
create trigger trg_guard_property_status_transition
before insert or update of status on public.properties
for each row execute function private.guard_property_status_transition();

drop trigger if exists trg_guard_active_tenancy_status on public.property_tenancies;
create trigger trg_guard_active_tenancy_status
before insert or update of ends_on, property_id on public.property_tenancies
for each row execute function private.guard_active_tenancy_for_property_status();

create unique index if not exists properties_manager_name_unique_idx
  on public.properties (manager_id, lower(name));

create unique index if not exists tenants_manager_email_unique_idx
  on public.tenants (manager_id, email)
  where email is not null;

create unique index if not exists property_tenancies_one_active_per_property_idx
  on public.property_tenancies (property_id)
  where ends_on is null;

create index if not exists properties_manager_status_idx
  on public.properties (manager_id, status);

create index if not exists property_tenancies_property_history_idx
  on public.property_tenancies (property_id, starts_on desc, ends_on desc);

create index if not exists property_tenancies_tenant_history_idx
  on public.property_tenancies (tenant_id, starts_on desc, ends_on desc);

create index if not exists charge_schedules_due_date_open_idx
  on public.charge_schedules (due_date)
  where status in ('scheduled', 'pending', 'overdue');

create index if not exists charge_schedules_status_due_date_idx
  on public.charge_schedules (status, due_date);

create index if not exists charge_schedules_tenant_due_idx
  on public.charge_schedules (tenant_id, due_date desc);

create index if not exists payments_tenant_received_idx
  on public.payments (tenant_id, received_on desc);

create index if not exists payments_currency_received_idx
  on public.payments (currency, received_on desc);

create index if not exists charge_schedules_currency_due_idx
  on public.charge_schedules (currency, due_date desc);

create index if not exists payment_items_charge_schedule_idx
  on public.payment_items (charge_schedule_id)
  where charge_schedule_id is not null;

create index if not exists notifications_queue_status_schedule_idx
  on public.notifications_queue (status, scheduled_for);

create unique index if not exists parking_spots_unique_label_per_property_idx
  on public.parking_spots (property_id, lower(spot_label));

create unique index if not exists internet_accounts_unique_identifier_per_manager_idx
  on public.internet_accounts (manager_id, lower(account_identifier));

commit;
