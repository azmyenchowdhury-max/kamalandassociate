-- Security hardening: lock every application table behind RLS with no
-- permissive policies. All legitimate access goes through Edge Functions
-- using the service_role key, which bypasses RLS by design. This closes
-- direct PostgREST access (GET/POST .../rest/v1/<table>) via the public
-- anon key, which is shipped to every visitor's browser.
alter table public.visitors enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.chat_events enable row level security;
alter table public.attorneys enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_reminders enable row level security;
alter table public.intakes enable row level security;
alter table public.knowledge_documents enable row level security;

-- Durable rate-limit ledger used by Edge Functions (IP-based throttling).
create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_events_lookup
  on public.rate_limit_events (bucket, identifier, created_at);

alter table public.rate_limit_events enable row level security;
