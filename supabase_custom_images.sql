-- Add custom_images column to profiles if it doesn't exist
alter table public.profiles 
add column if not exists custom_images text[] default array[]::text[];
