-- Extend attorneys table with fields needed for chatbot lawyer-matching and profile linking
alter table public.attorneys add column if not exists designation text;
alter table public.attorneys add column if not exists profile_url text;
alter table public.attorneys add column if not exists is_default_fallback boolean not null default false;

-- Seed the real attorney roster (matches attorneys.html)
insert into public.attorneys
  (name, slug, designation, practice_areas, languages, is_active, availability_status, office_location, priority_weight, profile_url, is_default_fallback)
values
  ('Mohammad Mostofa Kamal', 'kamal', 'Advocate, Appellate Division, Supreme Court of Bangladesh — Head of Chamber & Founder',
    '{criminal,corporate,family,administrative}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 100, 'attorney-kamal.html', true),
  ('Harun-Or-Rayhan', 'harun', 'Managing Partner',
    '{corporate,commercial}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 90, 'attorney-harun.html', false),
  ('Nasrin Akter', 'nasrin', 'Senior Partner',
    '{criminal,family}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 80, 'attorney-nasrin.html', false),
  ('Jagadish Chandra Saha', 'jagadish', 'Senior Partner',
    '{criminal,family}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 80, 'attorney-jagadish.html', false),
  ('Habibur Rahman', 'habibur', 'Senior Partner',
    '{criminal,family}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 80, 'attorney-habibur.html', false),
  ('Mustafa Kamal Chowdhury', 'chowdhury', 'Senior Associate',
    '{criminal}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 60, 'attorney-chowdhury.html', false),
  ('Mohammad Kabir', 'kabir', 'Senior Associate',
    '{family}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 60, 'attorney-kabir.html', false),
  ('Yeasin Arafat Rashed', 'rashed', 'Associate',
    '{property}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 40, 'attorney-rashed.html', false),
  ('Mahadi Hosin Manik', 'mahadi', 'Associate',
    '{administrative}', '{en,bn}', true, 'available', 'Dhaka, Bangladesh', 40, 'attorney-mahadi.html', false)
on conflict (slug) do update set
  name = excluded.name,
  designation = excluded.designation,
  practice_areas = excluded.practice_areas,
  languages = excluded.languages,
  is_active = excluded.is_active,
  availability_status = excluded.availability_status,
  office_location = excluded.office_location,
  priority_weight = excluded.priority_weight,
  profile_url = excluded.profile_url,
  is_default_fallback = excluded.is_default_fallback;

create index if not exists idx_attorneys_is_default_fallback on public.attorneys(is_default_fallback) where is_default_fallback = true;
