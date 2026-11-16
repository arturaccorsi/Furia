-- Sugestões de correção/adição para a história do FalleN.
-- Qualquer visitante pode enviar; ninguém lê pelo site (só pelo painel do Supabase).

create table if not exists public.sugestoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('Adição', 'Correção', 'Vídeo ou matéria', 'Outro')),
  momento text check (char_length(momento) <= 200),
  texto text not null check (char_length(texto) between 10 and 1000),
  link text check (link is null or (char_length(link) <= 500 and link ~* '^https?://')),
  nome text check (char_length(nome) <= 24),
  status text not null default 'nova' check (status in ('nova', 'aceita', 'recusada'))
);

alter table public.sugestoes enable row level security;

drop policy if exists "qualquer um envia sugestao" on public.sugestoes;
create policy "qualquer um envia sugestao"
  on public.sugestoes for insert
  to anon, authenticated
  with check (status = 'nova');

-- Sem policy de select/update/delete: o site só consegue inserir.
