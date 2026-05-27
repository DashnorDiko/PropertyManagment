alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.property_tenancies enable row level security;
alter table public.charge_templates enable row level security;
alter table public.charge_schedules enable row level security;
alter table public.payments enable row level security;
alter table public.payment_items enable row level security;
alter table public.parking_spots enable row level security;
alter table public.internet_accounts enable row level security;
alter table public.manager_settings enable row level security;
alter table public.notifications_queue enable row level security;

create policy "manager read properties"
  on public.properties for select
  to authenticated
  using (true);
create policy "manager mutate properties"
  on public.properties for all
  to authenticated
  using (true)
  with check (true);

create policy "manager read tenants"
  on public.tenants for select to authenticated using (true);
create policy "manager mutate tenants"
  on public.tenants for all to authenticated using (true) with check (true);

create policy "manager read tenancies"
  on public.property_tenancies for select to authenticated using (true);
create policy "manager mutate tenancies"
  on public.property_tenancies for all to authenticated using (true) with check (true);

create policy "manager read charge templates"
  on public.charge_templates for select to authenticated using (true);
create policy "manager mutate charge templates"
  on public.charge_templates for all to authenticated using (true) with check (true);

create policy "manager read charge schedules"
  on public.charge_schedules for select to authenticated using (true);
create policy "manager mutate charge schedules"
  on public.charge_schedules for all to authenticated using (true) with check (true);

create policy "manager read payments"
  on public.payments for select to authenticated using (true);
create policy "manager mutate payments"
  on public.payments for all to authenticated using (true) with check (true);

create policy "manager read payment items"
  on public.payment_items for select to authenticated using (true);
create policy "manager mutate payment items"
  on public.payment_items for all to authenticated using (true) with check (true);

create policy "manager read parking"
  on public.parking_spots for select to authenticated using (true);
create policy "manager mutate parking"
  on public.parking_spots for all to authenticated using (true) with check (true);

create policy "manager read internet"
  on public.internet_accounts for select to authenticated using (true);
create policy "manager mutate internet"
  on public.internet_accounts for all to authenticated using (true) with check (true);

create policy "manager read settings"
  on public.manager_settings for select to authenticated using (true);
create policy "manager mutate settings"
  on public.manager_settings for all to authenticated using (true) with check (true);

create policy "manager read notifications"
  on public.notifications_queue for select to authenticated using (true);
create policy "manager mutate notifications"
  on public.notifications_queue for all to authenticated using (true) with check (true);
-- 0003_rls_policies.sql
-- Row level security scaffold (manager-owned data model).

begin;

alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.property_tenancies enable row level security;
alter table public.charge_templates enable row level security;
alter table public.charge_schedules enable row level security;
alter table public.payments enable row level security;
alter table public.payment_items enable row level security;
alter table public.parking_spots enable row level security;
alter table public.internet_accounts enable row level security;
alter table public.notifications_queue enable row level security;
alter table public.manager_settings enable row level security;

alter table public.properties force row level security;
alter table public.tenants force row level security;
alter table public.property_tenancies force row level security;
alter table public.charge_templates force row level security;
alter table public.charge_schedules force row level security;
alter table public.payments force row level security;
alter table public.payment_items force row level security;
alter table public.parking_spots force row level security;
alter table public.internet_accounts force row level security;
alter table public.notifications_queue force row level security;
alter table public.manager_settings force row level security;

create policy properties_manager_all_policy
  on public.properties
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy tenants_manager_all_policy
  on public.tenants
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy property_tenancies_manager_all_policy
  on public.property_tenancies
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy charge_templates_manager_all_policy
  on public.charge_templates
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy charge_schedules_manager_all_policy
  on public.charge_schedules
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy payments_manager_all_policy
  on public.payments
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy payment_items_manager_all_policy
  on public.payment_items
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy parking_spots_manager_all_policy
  on public.parking_spots
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy internet_accounts_manager_all_policy
  on public.internet_accounts
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy notifications_queue_manager_all_policy
  on public.notifications_queue
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

create policy manager_settings_manager_all_policy
  on public.manager_settings
  for all
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());

commit;
