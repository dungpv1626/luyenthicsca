create or replace function admin_module_coverage()
returns table(subject text, module text, approved bigint, in_review bigint)
language sql stable as $$
  select subject, coalesce(module, 'unclassified'), count(*) filter (where status = 'approved'), count(*) filter (where status = 'review')
  from questions group by 1, 2
$$;
revoke all on function admin_module_coverage() from public, anon, authenticated;
grant execute on function admin_module_coverage() to service_role;
