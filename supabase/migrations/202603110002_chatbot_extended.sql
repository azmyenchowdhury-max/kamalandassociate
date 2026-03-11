create table if not exists public.attorneys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  practice_areas text[] not null default '{}',
  languages text[] not null default '{en}',
  is_active boolean not null default true,
  availability_status text not null default 'available',
  office_location text,
  priority_weight int not null default 50
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  attorney_id uuid references public.attorneys(id),
  scheduled_at timestamptz not null,
  timezone text not null default 'Asia/Dhaka',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  meeting_mode text not null default 'phone' check (meeting_mode in ('phone', 'video', 'in_person')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('24h', '2h', 'custom')),
  channel text not null check (channel in ('email', 'sms', 'whatsapp')),
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed'))
);

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  case_type text not null,
  incident_date date,
  opposing_party_type text,
  documents_available boolean not null default false,
  facts text,
  intake_score int,
  recommended_service text,
  recommended_attorney_id uuid references public.attorneys(id),
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null check (doc_type in ('faq', 'blog', 'glossary', 'process', 'court_info')),
  title text not null,
  slug text not null unique,
  language text not null check (language in ('en', 'bn')),
  content_markdown text not null,
  tags text[] not null default '{}',
  source_url text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_lead_id on public.appointments(lead_id);
create index if not exists idx_appointments_scheduled_at on public.appointments(scheduled_at);
create index if not exists idx_appointment_reminders_appointment_id on public.appointment_reminders(appointment_id);
create index if not exists idx_intakes_lead_id on public.intakes(lead_id);
create index if not exists idx_knowledge_documents_doc_type on public.knowledge_documents(doc_type);
create index if not exists idx_knowledge_documents_language on public.knowledge_documents(language);

-- Full-text index can be added in a follow-up migration with a trigger-maintained
-- column strategy depending on your Postgres immutability constraints.
