-- Rode uma vez no SQL Editor: troca os nomes antigos pelos novos.
alter table if exists public.keepalive rename to recycle;
drop function if exists public.keepalive_tick(text);
create or replace function public.run_recycle(etapa text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  novo_id bigint;
begin
  -- Faxina de segurança: nunca guarda nada com mais de 1 dia.
  delete from public.recycle where criado_em < now() - interval '1 day';

  if etapa = 'criar' then
    -- Evita acúmulo caso alguém chame a função repetidamente.
    if (select count(*) from public.recycle) >= 10 then
      return 'limite atingido';
    end if;
    insert into public.recycle (nota) values ('registro fictício') returning id into novo_id;
    update public.recycle set nota = 'registro fictício alterado', alterado_em = now() where id = novo_id;
    return 'criado e alterado: ' || novo_id;
  elsif etapa = 'apagar' then
    delete from public.recycle;
    return 'apagado';
  else
    raise exception 'etapa inválida: %', etapa;
  end if;
end;
$$;

revoke all on function public.run_recycle(text) from public;
grant execute on function public.run_recycle(text) to anon, authenticated;
delete from public.recycle;
