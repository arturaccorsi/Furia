-- Palpites da torcida. Sem login ainda: cada navegador tem um id aleatório (device_id).
-- O site não acessa a tabela direto: só pelas duas funções abaixo.

create table if not exists public.palpites (
  device_id uuid not null,
  match_id text not null check (char_length(match_id) <= 80),
  winner text not null check (winner in ('furia', 'opp')),
  score text not null check (char_length(score) <= 10),
  nome text check (char_length(nome) <= 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (device_id, match_id)
);

alter table public.palpites enable row level security;
-- sem policies: ninguém lê nem escreve direto pela API

-- Salva ou atualiza o palpite deste navegador para a partida.
create or replace function public.salvar_palpite(p_device uuid, p_match text, p_winner text, p_score text, p_nome text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into palpites (device_id, match_id, winner, score, nome)
  values (p_device, p_match, p_winner, p_score, left(p_nome, 24))
  on conflict (device_id, match_id)
  do update set winner = excluded.winner, score = excluded.score, nome = excluded.nome, updated_at = now();
$$;

-- Resumo público: quantos palpites e quantos foram de FURIA (sem expor quem votou).
create or replace function public.resumo_palpites(p_match text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object('total', count(*), 'furia', count(*) filter (where winner = 'furia'))
  from palpites where match_id = p_match;
$$;

revoke all on function public.salvar_palpite(uuid, text, text, text, text) from public;
revoke all on function public.resumo_palpites(text) from public;
grant execute on function public.salvar_palpite(uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.resumo_palpites(text) to anon, authenticated;
