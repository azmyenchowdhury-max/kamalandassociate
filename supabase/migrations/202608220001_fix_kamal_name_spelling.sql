-- Fix spelling: "Mostofa" was a typo, correct spelling is "Mostafa".
-- The original 202607170001_attorneys_roster.sql migration is left as a
-- historical record — this migration corrects the already-seeded row instead
-- of editing that file, since editing an old migration doesn't retroactively
-- change data already applied to the live database.
update public.attorneys
set name = 'Mohammad Mostafa Kamal'
where slug = 'kamal';
