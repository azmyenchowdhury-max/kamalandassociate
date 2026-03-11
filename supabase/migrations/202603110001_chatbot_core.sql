create extension if not exists pgcrypto;

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  preferred_language text not null default 'en' check (preferred_language in ('en', 'bn')),
  source_page text,
  device_fingerprint text,
  consent_marketing boolean not null default false
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors(id),
  channel text not null default 'web',
  status text not null default 'open' check (status in ('open', 'closed', 'escalated')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  current_intent text,
  current_flow text
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('user', 'bot', 'agent', 'system')),
  message_type text not null default 'text' check (message_type in ('text', 'button', 'link', 'file', 'system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors(id),
  conversation_id uuid references public.conversations(id),
  lead_status text not null default 'new' check (lead_status in ('new', 'qualified', 'contacted', 'booked', 'closed')),
  name text,
  phone text,
  email text,
  case_type text,
  urgency_level text not null default 'low' check (urgency_level in ('low', 'medium', 'high', 'emergency')),
  issue_summary text,
  city_district text,
  source text not null default 'chatbot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id),
  conversation_id uuid references public.conversations(id),
  event_name text not null,
  event_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversations_visitor_id on public.conversations(visitor_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
create index if not exists idx_leads_visitor_id on public.leads(visitor_id);
create index if not exists idx_leads_status on public.leads(lead_status);
create index if not exists idx_chat_events_conversation_id on public.chat_events(conversation_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();
