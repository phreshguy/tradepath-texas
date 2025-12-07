-- Enable Row Level Security (RLS) and necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Schools Table
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  state text not null,
  zip text not null,
  website text,
  accreditation_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table schools enable row level security;

create policy "Allow public read access to schools"
  on schools for select
  to public
  using (true);

create policy "Allow service role full access to schools"
  on schools for all
  to service_role
  using (true)
  with check (true);


-- 2. Programs Table
create table programs (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id) on delete cascade not null,
  program_name text not null,
  cip_code text not null, -- Classification of Instructional Programs code from Dept of Ed
  tuition_cost numeric,
  program_length_months integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table programs enable row level security;

create policy "Allow public read access to programs"
  on programs for select
  to public
  using (true);

create policy "Allow service role full access to programs"
  on programs for all
  to service_role
  using (true)
  with check (true);


-- 3. BLS Salary Data Table (SOC Codes)
create table bls_salary_data (
  id uuid primary key default uuid_generate_v4(),
  soc_code text not null, -- Standard Occupational Classification code
  soc_title text not null,
  state_abbr text not null,
  county_code text, -- NULL for state-level data, populated for county-specific
  median_annual_salary numeric,
  hourly_mean numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table bls_salary_data enable row level security;

create policy "Allow public read access to bls_salary_data"
  on bls_salary_data for select
  to public
  using (true);

create policy "Allow service role full access to bls_salary_data"
  on bls_salary_data for all
  to service_role
  using (true)
  with check (true);


-- 4. CIP to SOC Matrix (The Linkage Table)
-- This maps an educational program (CIP) to potential occupations (SOC).
create table cip_soc_matrix (
  cip_code text not null,
  soc_code text not null,
  confidence_score integer check (confidence_score >= 1 and confidence_score <= 100),
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (cip_code, soc_code)
);

alter table cip_soc_matrix enable row level security;

create policy "Allow public read access to cip_soc_matrix"
  on cip_soc_matrix for select
  to public
  using (true);

create policy "Allow service role full access to cip_soc_matrix"
  on cip_soc_matrix for all
  to service_role
  using (true)
  with check (true);


-- 5. Leads Table
create table leads (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  target_school_id uuid references schools(id) on delete set null,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table leads enable row level security;

-- Leads logic: Public can insert (e.g., submitting a form), but maybe not read all leads (privacy).
-- Service role can do everything.
create policy "Allow public insert to leads"
  on leads for insert
  to public
  with check (true);

create policy "Allow service role full access to leads"
  on leads for all
  to service_role
  using (true)
  with check (true);


-- 6. ROI Calculator Function
-- Maps Input (Tuition) vs Output (Salary)
create or replace function calculate_roi(program_cost numeric, soc_salary numeric)
returns numeric
language plpgsql
immutable
as $$
begin
  -- Prevent division by zero if program_cost is free (unlikely but possible)
  if program_cost = 0 then
    -- If cost is 0 and salary is > 0, ROI is infinite. return null or large number?
    -- For simplicity, let's just return soc_salary (implied pure gain) or 0.
    -- Let's return NULL to signify "N/A" or infinite.
    return null;
  end if;

  -- ROI = (Net Return / Cost) * 100
  -- Net Return = soc_salary - program_cost
  -- ROI = ( (soc_salary - program_cost) / program_cost ) * 100
  return round( ( (soc_salary - program_cost) / program_cost ) * 100, 2 );
end;
$$;
