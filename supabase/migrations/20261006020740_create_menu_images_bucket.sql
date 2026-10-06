insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images', 'menu-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Public bucket: anyone can view files by URL without a policy. These cover
-- listing/upload/replace/delete, which only admins may do.
create policy "Admins read menu images" on storage.objects
  for select to authenticated
  using (bucket_id = 'menu-images' and (select private.is_admin()));
create policy "Admins upload menu images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'menu-images' and (select private.is_admin()));
create policy "Admins update menu images" on storage.objects
  for update to authenticated
  using (bucket_id = 'menu-images' and (select private.is_admin()))
  with check (bucket_id = 'menu-images' and (select private.is_admin()));
create policy "Admins delete menu images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'menu-images' and (select private.is_admin()));
