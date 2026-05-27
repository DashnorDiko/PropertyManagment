create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";

create type public.property_status as enum ('occupied', 'empty', 'sold');
create type public.currency_code as enum ('EUR', 'ALL');
create type public.charge_type as enum ('rent', 'administration', 'parking', 'internet');
create type public.payment_method as enum ('cash', 'bank');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  apartment_name text,
  subtitle text,
  status public.property_status not null,
  buyer_name text,
  registration_date date not null default current_date,
  document_url text,
  created_at timestamptz not null default now()
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.property_tenancies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lease_start date not null,
  lease_end date,
  created_at timestamptz not null default now()
);

create table public.charge_templates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  charge_type public.charge_type not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency public.currency_code not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.charge_schedules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  charge_type public.charge_type not null,
  due_date date not null,
  month_label text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency public.currency_code not null,
  paid_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  paid_on date not null default current_date,
  payment_method public.payment_method not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency public.currency_code not null,
  note text
);

create table public.payment_items (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  charge_schedule_id uuid not null references public.charge_schedules(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0)
);

create table public.parking_spots (
  id uuid primary key default gen_random_uuid(),
  spot_number text not null,
  access_card_number text not null,
  person_name text not null,
  rent_amount numeric(12,2) not null check (rent_amount >= 0),
  currency public.currency_code not null,
  tenant_id uuid references public.tenants(id) on delete set null
);

create table public.internet_accounts (
  id uuid primary key default gen_random_uuid(),
  account_number text not null,
  person_name text not null,
  rent_amount numeric(12,2) not null check (rent_amount >= 0),
  currency public.currency_code not null,
  tenant_id uuid references public.tenants(id) on delete set null
);

create table public.manager_settings (
  id uuid primary key default gen_random_uuid(),
  administration_fee numeric(12,2) not null check (administration_fee >= 0),
  administration_currency public.currency_code not null default 'ALL',
  updated_at timestamptz not null default now()
);

create table public.notifications_queue (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  message text not null,
  notification_type text not null check (notification_type in ('upcoming', 'overdue')),
  due_date date not null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);
-- 0001_initial_schema.sql
-- Base schema for the property management backend.

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_status') then
    create type public.property_status as enum ('empty', 'occupied', 'maintenance', 'reserved', 'sold');
  end if;

  if not exists (select 1 from pg_type where typname = 'currency_code') then
    create type public.currency_code as enum ('ALL', 'EUR', 'USD', 'GBP', 'CHF');
  end if;

  if not exists (select 1 from pg_type where typname = 'charge_type') then
    create type public.charge_type as enum ('rent', 'utilities', 'maintenance', 'parking', 'internet', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('cash', 'bank_transfer', 'card', 'online', 'other');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state_region text,
  postal_code text,
  country_code char(2) not null default 'AL',
  status public.property_status not null default 'empty',
  bedrooms smallint check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(3,1) check (bathrooms is null or bathrooms >= 0),
  square_meters numeric(10,2) check (square_meters is null or square_meters > 0),
  purchase_price numeric(12,2) check (purchase_price is null or purchase_price >= 0),
  listed_sale_price numeric(12,2) check (listed_sale_price is null or listed_sale_price >= 0),
  currency public.currency_code not null default 'ALL',
  buyer_name text,
  sold_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email citext,
  phone text,
  national_id text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_tenancies (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete restrict,
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  starts_on date not null,
  ends_on date,
  monthly_rent numeric(12,2) not null check (monthly_rent >= 0),
  deposit_amount numeric(12,2) not null default 0 check (deposit_amount >= 0),
  currency public.currency_code not null default 'ALL',
  contract_reference text,
  move_in_notes text,
  move_out_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_tenancies_period_check check (ends_on is null or ends_on >= starts_on)
);

create table if not exists public.charge_templates (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete cascade,
  name text not null,
  charge_type public.charge_type not null,
  amount numeric(12,2) not null check (amount > 0),
  currency public.currency_code not null default 'ALL',
  billing_day smallint not null check (billing_day between 1 and 28),
  starts_on date,
  ends_on date,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint charge_templates_target_check check (property_id is not null or tenant_id is not null),
  constraint charge_templates_period_check check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.charge_schedules (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid references public.charge_templates (id) on delete set null,
  tenancy_id uuid references public.property_tenancies (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  tenant_id uuid references public.tenants (id) on delete set null,
  charge_type public.charge_type not null,
  description text not null,
  amount_due numeric(12,2) not null check (amount_due > 0),
  currency public.currency_code not null default 'ALL',
  due_date date not null,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'pending', 'paid', 'overdue', 'cancelled', 'waived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid references public.properties (id) on delete set null,
  payment_method public.payment_method not null,
  payment_reference text,
  received_on date not null default current_date,
  received_at timestamptz not null default now(),
  total_amount numeric(12,2) not null check (total_amount > 0),
  currency public.currency_code not null default 'ALL',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_items (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  payment_id uuid not null references public.payments (id) on delete cascade,
  charge_schedule_id uuid references public.charge_schedules (id) on delete set null,
  amount_applied numeric(12,2) not null check (amount_applied > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.parking_spots (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  spot_label text not null,
  monthly_fee numeric(12,2) not null default 0 check (monthly_fee >= 0),
  currency public.currency_code not null default 'ALL',
  is_active boolean not null default true,
  assigned_tenant_id uuid references public.tenants (id) on delete set null,
  assigned_since date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parking_spots_assignment_check check (
    (assigned_tenant_id is null and assigned_since is null) or
    (assigned_tenant_id is not null and assigned_since is not null)
  )
);

create table if not exists public.internet_accounts (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  provider_name text not null,
  account_identifier text not null,
  monthly_fee numeric(12,2) not null default 0 check (monthly_fee >= 0),
  currency public.currency_code not null default 'ALL',
  billing_day smallint check (billing_day is null or billing_day between 1 and 28),
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications_queue (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  notification_type text not null
    check (notification_type in ('upcoming_due', 'overdue_due', 'payment_received', 'general')),
  channel text not null default 'in_app'
    check (channel in ('in_app', 'email', 'sms')),
  recipient text not null,
  subject text,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  related_charge_schedule_id uuid references public.charge_schedules (id) on delete set null,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manager_settings (
  manager_id uuid primary key references auth.users (id) on delete cascade,
  default_currency public.currency_code not null default 'ALL',
  notify_days_before_due smallint not null default 3 check (notify_days_before_due between 0 and 30),
  notify_overdue_every_days smallint not null default 3 check (notify_overdue_every_days between 1 and 30),
  timezone text not null default 'Europe/Tirane',
  email_notifications_enabled boolean not null default true,
  sms_notifications_enabled boolean not null default false,
  in_app_notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_properties_set_updated_at on public.properties;
create trigger trg_properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

drop trigger if exists trg_tenants_set_updated_at on public.tenants;
create trigger trg_tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists trg_property_tenancies_set_updated_at on public.property_tenancies;
create trigger trg_property_tenancies_set_updated_at
before update on public.property_tenancies
for each row execute function public.set_updated_at();

drop trigger if exists trg_charge_templates_set_updated_at on public.charge_templates;
create trigger trg_charge_templates_set_updated_at
before update on public.charge_templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_charge_schedules_set_updated_at on public.charge_schedules;
create trigger trg_charge_schedules_set_updated_at
before update on public.charge_schedules
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_set_updated_at on public.payments;
create trigger trg_payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_parking_spots_set_updated_at on public.parking_spots;
create trigger trg_parking_spots_set_updated_at
before update on public.parking_spots
for each row execute function public.set_updated_at();

drop trigger if exists trg_internet_accounts_set_updated_at on public.internet_accounts;
create trigger trg_internet_accounts_set_updated_at
before update on public.internet_accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_notifications_queue_set_updated_at on public.notifications_queue;
create trigger trg_notifications_queue_set_updated_at
before update on public.notifications_queue
for each row execute function public.set_updated_at();

drop trigger if exists trg_manager_settings_set_updated_at on public.manager_settings;
create trigger trg_manager_settings_set_updated_at
before update on public.manager_settings
for each row execute function public.set_updated_at();

commit;
