-- Limite de envio de sugestões: 3 por hora por navegador.
-- O site deixa de inserir direto na tabela e passa a usar a função enviar_sugestao,
-- que confere o limite antes de gravar.
--
-- Como o device_id é gerado no navegador (e muda ao "Sair"), também há um teto por IP
-- (10/hora), um pouco mais alto para não barrar várias pessoas na mesma rede (4G, arena, faculdade).

alter table public.sugestoes add column if not exists device_id uuid;
alter table public.sugestoes add column if not exists ip text;

create index if not exists sugestoes_device_recentes on public.sugestoes (device_id, created_at desc);
create index if not exists sugestoes_ip_recentes on public.sugestoes (ip, created_at desc);

-- Fim do insert direto pela API: só pela função abaixo.
drop policy if exists "qualquer um envia sugestao" on public.sugestoes;

create or replace function public.enviar_sugestao(
  p_device uuid,
  p_tipo text,
  p_momento text,
  p_texto text,
  p_link text,
  p_nome text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip text := coalesce(
    v_headers ->> 'cf-connecting-ip',
    split_part(v_headers ->> 'x-forwarded-for', ',', 1),
    'desconhecido'
  );
begin
  if p_device is null then
    raise exception 'device_obrigatorio';
  end if;

  -- Evita que dois envios simultâneos do mesmo navegador passem juntos pelo limite.
  perform pg_advisory_xact_lock(hashtext('sugestao:' || p_device::text));

  if (select count(*) from sugestoes
      where device_id = p_device and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from sugestoes
      where ip = v_ip and created_at > now() - interval '1 hour') >= 10
  then
    raise exception 'limite_sugestoes' using hint = 'Máximo de 3 sugestões por hora.';
  end if;

  insert into sugestoes (tipo, momento, texto, link, nome, device_id, ip)
  values (p_tipo, nullif(p_momento, ''), p_texto, nullif(p_link, ''), left(p_nome, 24), p_device, trim(v_ip));
end;
$$;

revoke all on function public.enviar_sugestao(uuid, text, text, text, text, text) from public;
grant execute on function public.enviar_sugestao(uuid, text, text, text, text, text) to anon, authenticated;
