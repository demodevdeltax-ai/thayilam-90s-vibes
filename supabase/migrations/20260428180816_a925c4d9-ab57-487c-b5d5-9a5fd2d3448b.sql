-- ============================================================
-- 1. Roles enum + user_roles + helper function
-- ============================================================
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

create policy "Admins can view all roles"
  on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2. Profiles + auto-create trigger
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Admins view all profiles"
  on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users insert own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- ============================================================
-- 3. Categories
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_telugu text,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  icon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Anyone can view visible categories"
  on public.categories for select to anon, authenticated
  using (is_visible = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.tg_set_updated_at();

-- ============================================================
-- 4. Products
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  name_telugu text,
  slug text not null unique,
  description text not null default '',
  highlights text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  price numeric(10,2) not null,
  mrp numeric(10,2),
  default_weight text not null default '250g',
  pack_sizes int[] not null default '{100,250,500}',
  diet text[] not null default '{}',
  image_url text,
  badge text,
  popularity int not null default 50,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage products"
  on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger products_updated_at
  before update on public.products
  for each row execute function public.tg_set_updated_at();

create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(is_active);

-- ============================================================
-- 5. Coupons
-- ============================================================
create type public.coupon_type as enum ('flat', 'percent');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type public.coupon_type not null,
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  usage_limit int,
  usage_count int not null default 0,
  scope text not null default 'all', -- 'all' | 'category' | 'product'
  scope_ref uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "Anyone can read active coupons"
  on public.coupons for select to anon, authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage coupons"
  on public.coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger coupons_updated_at
  before update on public.coupons
  for each row execute function public.tg_set_updated_at();

-- ============================================================
-- 6. Banners
-- ============================================================
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  active_from timestamptz,
  active_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;

create policy "Anyone can view active banners"
  on public.banners for select to anon, authenticated
  using (
    is_active = true
    and (active_from is null or active_from <= now())
    and (active_until is null or active_until >= now())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Admins manage banners"
  on public.banners for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger banners_updated_at
  before update on public.banners
  for each row execute function public.tg_set_updated_at();

-- ============================================================
-- 7. Orders + Order items
-- ============================================================
create type public.order_status as enum ('Pending','Packed','Shipped','Delivered','Cancelled');
create type public.payment_method as enum ('UPI','Card','NetBanking','COD');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('THY-' || to_char(now(),'YYYYMMDD') || '-' || substr(gen_random_uuid()::text,1,6)),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'Pending',
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_code text,
  payment_method public.payment_method not null default 'UPI',

  -- shipping snapshot
  ship_name text not null,
  ship_phone text not null,
  ship_line text not null,
  ship_city text not null,
  ship_state text not null,
  ship_pincode text not null,

  courier text,
  tracking text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Customers view own orders"
  on public.orders for select to authenticated
  using (user_id = auth.uid());

create policy "Customers create own orders"
  on public.orders for insert to authenticated
  with check (user_id = auth.uid());

create policy "Admins view all orders"
  on public.orders for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update orders"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.tg_set_updated_at();

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_sku text,
  product_name text not null,
  weight text not null,
  qty int not null,
  unit_price numeric(10,2) not null,
  pack_breakdown jsonb,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Customers view own order items"
  on public.order_items for select to authenticated
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "Customers insert own order items"
  on public.order_items for insert to authenticated
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "Admins view all order items"
  on public.order_items for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create index order_items_order_idx on public.order_items(order_id);
