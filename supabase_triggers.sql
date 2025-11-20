-- FUNCTION: Handle New User Signup
-- This function automatically creates a profile row when a new user signs up via Supabase Auth.
-- It grabs the 'username' from the user's metadata (passed from the client).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', 'Player ' || substr(new.id::text, 1, 8)));
  return new;
end;
$$;

-- TRIGGER: On Auth User Created
-- Runs the function above after every insert into auth.users

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
