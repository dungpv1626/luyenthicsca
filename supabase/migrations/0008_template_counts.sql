create or replace function admin_template_counts()
returns table(template_key text, live bigint, total bigint)
language sql stable as $$
  select template_key, count(*) filter (where status = 'approved'), count(*)
  from questions where template_key is not null group by template_key
$$;
revoke all on function admin_template_counts() from public, anon, authenticated;
grant execute on function admin_template_counts() to service_role;
