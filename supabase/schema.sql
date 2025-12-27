-- 1. 用户档案表 (扩展 auth.users)
-- 存储用户的角色（求助者/志愿者）和子角色（精神支持/物理庇护）
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('seeker', 'provider')),
  sub_role text check (sub_role in ('mental', 'physical')), 
  contact_info text, -- 志愿者提供的联系方式 (如邮箱、电话)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 漂流瓶表 (求助信息)
-- 求助者发送的匿名或半匿名信息
create table public.bottles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id), -- 发送者
  content text not null, -- 求助内容
  status text default 'open', -- open, solved
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 漂流瓶回复表 (精神帮助)
-- 志愿者认领漂流瓶后，发送自己的联系方式
create table public.bottle_responses (
  id uuid default uuid_generate_v4() primary key,
  bottle_id uuid references public.bottles(id),
  provider_id uuid references public.profiles(id),
  message text, -- 志愿者的留言
  contact_info_shared text, -- 自动填入志愿者的联系方式
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 物理庇护所表
-- 商家或公共场所上传的地址
create table public.shelters (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id),
  name text not null, -- 场所名称
  address text, -- 详细地址
  latitude float not null,
  longitude float not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 简单的 RLS (行级安全) 策略示例 - 开发阶段可先允许所有
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

alter table public.bottles enable row level security;
create policy "Bottles are viewable by everyone" on public.bottles for select using (true);
create policy "Users can insert bottles" on public.bottles for insert with check (auth.uid() = user_id);