-- Retry migration without IF NOT EXISTS on policies

-- 1) referrals table
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  code text not null unique,
  clicks integer not null default 0,
  earnings_azn numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

create policy "Admins can do everything on referrals"
  on public.referrals
  as permissive
  for all
  using (get_user_role(auth.uid()) = 'admin')
  with check (get_user_role(auth.uid()) = 'admin');

create policy "Users can view their own referral"
  on public.referrals
  as permissive
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own referral"
  on public.referrals
  as permissive
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own referral"
  on public.referrals
  as permissive
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger trg_referrals_updated_at
before update on public.referrals
for each row execute function public.update_updated_at_column();


-- 2) referral_clicks table
create table public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referral_user_id uuid not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.referral_clicks enable row level security;

create policy "Admins can view referral_clicks"
  on public.referral_clicks
  as permissive
  for select
  using (get_user_role(auth.uid()) = 'admin');

create policy "Users can view their own referral_clicks"
  on public.referral_clicks
  as permissive
  for select
  using (referral_user_id = auth.uid());


-- 3) referral_requests table
create table public.referral_requests (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referral_user_id uuid not null,
  company_name text not null,
  contact_name text,
  contact_email text,
  phone text,
  job_title text,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.referral_requests enable row level security;

create policy "Admins can do everything on referral_requests"
  on public.referral_requests
  as permissive
  for all
  using (get_user_role(auth.uid()) = 'admin')
  with check (get_user_role(auth.uid()) = 'admin');

create policy "Users can view their own referral_requests"
  on public.referral_requests
  as permissive
  for select
  using (referral_user_id = auth.uid());

create trigger trg_referral_requests_updated_at
before update on public.referral_requests
for each row execute function public.update_updated_at_column();


-- 4) wallets table
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  card_number text,
  m10_number text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint at_least_one_destination check (card_number is not null or m10_number is not null)
);

alter table public.wallets enable row level security;

create policy "Admins can do everything on wallets"
  on public.wallets
  as permissive
  for all
  using (get_user_role(auth.uid()) = 'admin')
  with check (get_user_role(auth.uid()) = 'admin');

create policy "Users can view their own wallets"
  on public.wallets
  as permissive
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own wallets"
  on public.wallets
  as permissive
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own wallets"
  on public.wallets
  as permissive
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own wallets"
  on public.wallets
  as permissive
  for delete
  using (user_id = auth.uid());

create trigger trg_wallets_updated_at
before update on public.wallets
for each row execute function public.update_updated_at_column();


-- 5) withdrawals table
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  method text not null,
  amount numeric(10,2) not null,
  destination text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.withdrawals enable row level security;

create policy "Admins can manage withdrawals"
  on public.withdrawals
  as permissive
  for all
  using (get_user_role(auth.uid()) = 'admin')
  with check (get_user_role(auth.uid()) = 'admin');

create policy "Users can insert withdrawals"
  on public.withdrawals
  as permissive
  for insert
  with check (user_id = auth.uid());

create policy "Users can view their own withdrawals"
  on public.withdrawals
  as permissive
  for select
  using (user_id = auth.uid());

create trigger trg_withdrawals_updated_at
before update on public.withdrawals
for each row execute function public.update_updated_at_column();


-- 6) Functions
create or replace function public.log_referral_click(code text, ua text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from public.referrals r where r.code = code and r.is_active = true;
  if not found then
    return;
  end if;

  insert into public.referral_clicks (referral_code, referral_user_id, user_agent)
  select r.code, r.user_id, ua from public.referrals r where r.code = code;

  update public.referrals set clicks = clicks + 1, updated_at = now() where code = code;
end;
$$;

create or replace function public.submit_referral_request(
  _code text,
  _company_name text,
  _contact_name text,
  _contact_email text,
  _phone text,
  _job_title text,
  _message text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid;
  _new_id uuid := gen_random_uuid();
begin
  select user_id into _user_id from public.referrals where code = _code and is_active = true;
  if _user_id is null then
    return null;
  end if;

  insert into public.referral_requests (
    id, referral_code, referral_user_id, company_name, contact_name, contact_email, phone, job_title, message, status
  ) values (
    _new_id, _code, _user_id, _company_name, _contact_name, _contact_email, _phone, _job_title, _message, 'pending'
  );

  return _new_id;
end;
$$;