create type public.user_role as enum ('patient', 'pharmacist', 'doctor', 'admin');
create type public.order_status as enum ('PENDING_VERIFICATION', 'APPROVED', 'DISPATCHED');

create table if not exists public.users (id uuid primary key references auth.users(id) on delete cascade, email text unique not null, name text not null, role public.user_role default 'patient');
create table if not exists public.medicines (id text primary key, name text not null, brand text, composition text, price numeric not null, mrp numeric, is_rx_required boolean default false, category text, stock integer default 0, image_url text);
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), user_id uuid references public.users(id), total_amount numeric not null, status public.order_status default 'APPROVED', prescription_url text, created_at timestamptz default now());
create table if not exists public.lab_tests (id uuid primary key default gen_random_uuid(), name text not null, parameters_covered text[] default '{}', price numeric not null, sample_type text not null);
create table if not exists public.doctors (id uuid primary key default gen_random_uuid(), name text not null, specialty text not null, experience_years integer default 0, fee numeric not null, rating numeric default 0);
create table if not exists public.prescriptions (id uuid primary key default gen_random_uuid(), user_id uuid references public.users(id), storage_path text, status text default 'PENDING_VERIFICATION', rejection_reason text, created_at timestamptz default now());

insert into public.medicines (id, name, brand, composition, price, mrp, is_rx_required, category, stock, image_url) values
('dolo', 'Dolo 650mg Tablet', 'Micro Labs', 'Paracetamol 650mg', 32, 38, false, 'Pain relief', 120, '/assets/product-placeholder.svg'),
('calpol', 'Calpol 650mg Tablet', 'GlaxoSmithKline', 'Paracetamol 650mg', 28, 35, false, 'Pain relief', 80, '/assets/product-placeholder.svg')
on conflict (id) do nothing;
