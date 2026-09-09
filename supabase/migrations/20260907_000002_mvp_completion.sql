-- Complementos do MVP: permitir registrar cada chamada de IA na própria conta
-- e criar as políticas ausentes para dados derivados do uso do produto.

create policy ai_usage_insert_own on public.ai_usage
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy feedback_update_own on public.feedback
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy history_delete_own on public.outfit_history
  for delete to authenticated
  using (owner_id = auth.uid());

create policy inspiration_matches_delete_own on public.inspiration_matches
  for delete to authenticated
  using (owner_id = auth.uid());
