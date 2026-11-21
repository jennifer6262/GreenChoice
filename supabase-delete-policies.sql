alter table public.analysis_records enable row level security;
drop policy if exists "Users can delete their own analysis records"
  on public.analysis_records;
create policy "Users can delete their own analysis records"
  on public.analysis_records for delete
  using (auth.uid() = user_id);
grant delete on public.analysis_records to authenticated;

alter table public.ledger_transactions enable row level security;
drop policy if exists "Users can delete their own ledger transactions"
  on public.ledger_transactions;
create policy "Users can delete their own ledger transactions"
  on public.ledger_transactions for delete
  using (auth.uid() = user_id);
grant delete on public.ledger_transactions to authenticated;

do $$
declare
  constraint_name text;
begin
  if to_regclass('public.reminders') is not null then
    for constraint_name in
      select conname
      from pg_constraint
      where contype = 'f'
        and conrelid = 'public.reminders'::regclass
        and confrelid = 'public.analysis_records'::regclass
    loop
      execute format('alter table public.reminders drop constraint %I', constraint_name);
    end loop;

    alter table public.reminders
      add constraint reminders_analysis_record_id_fkey
      foreign key (analysis_record_id)
      references public.analysis_records(id)
      on delete cascade;
  end if;
end $$;

notify pgrst, 'reload schema';
