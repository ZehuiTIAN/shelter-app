-- ⚠️ 说明：此文件是数据库结构的本地备份/文档。
-- ⚠️ 数据库结构说明
-- 推荐使用 Supabase CLI 进行管理：
-- 1. 首次同步云端结构到本地: supabase db pull
-- 2. 推送本地修改到云端: supabase db push
-- (此文件现仅作为参考文档，实际结构以 supabase/migrations/ 下的文件为准)

-- 0. 启用 UUID 扩展 (必须先运行这个，否则 uuid_generate_v4() 会报错)
create extension if not exists "uuid-ossp";

-- 1. 用户档案表
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('seeker', 'provider')),
  sub_role text check (sub_role in ('mental', 'physical')), 
  contact_info text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 漂流瓶表
create table public.bottles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  content text not null,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 漂流瓶回复表
create table public.bottle_responses (
  id uuid default uuid_generate_v4() primary key,
  bottle_id uuid references public.bottles(id),
  provider_id uuid references public.profiles(id),
  message text,
  contact_info_shared text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 物理庇护所表
create table public.shelters (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id),
  name text not null,
  address text,
  latitude float not null,
  longitude float not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 安全策略
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.bottles enable row level security;
create policy "Bottles are viewable by everyone" on public.bottles for select using (true);
-- 仅允许登录用户发送
create policy "Authenticated users can insert bottles" on public.bottles for insert with check (auth.role() = 'authenticated');

alter table public.bottle_responses enable row level security;
create policy "Responses are viewable by everyone" on public.bottle_responses for select using (true);
create policy "Authenticated users can insert responses" on public.bottle_responses for insert with check (auth.role() = 'authenticated');

alter table public.shelters enable row level security;
create policy "Shelters are viewable by everyone" on public.shelters for select using (true);
create policy "Authenticated users can insert shelters" on public.shelters for insert with check (auth.role() = 'authenticated');

-- 关键：自动创建 Profile 的 Trigger
-- 当用户注册时，自动从 meta_data 读取角色并写入 profiles 表
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, role, sub_role)
  values (new.id, new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'sub_role');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();