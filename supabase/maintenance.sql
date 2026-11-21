-- Atividade de madrugada para o Supabase não pausar o projeto.
-- Rode uma vez no SQL Editor do Supabase.
--
-- Usa uma tabela própria, separada dos lugares e visitas, para que nada
-- fictício apareça no app. Ninguém acessa a tabela direto (RLS sem políticas);
-- só a função abaixo, que o GitHub Actions chama com a chave pública.

create table if not exists public.keepalive (
  id bigint generated always as identity primary key,
  nota text not null,
  criado_em timestamptz not null default now(),
  alterado_em timestamptz
);

alter table public.keepalive enable row level security;

-- etapa 'criar': cria um registro e depois altera ele.
-- etapa 'apagar': apaga os registros.
create or replace function public.keepalive_tick(etapa text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  novo_id bigint;
begin
  -- Faxina de segurança: nunca guarda nada com mais de 1 dia.
  delete from public.keepalive where criado_em < now() - interval '1 day';

  if etapa = 'criar' then
    -- Evita acúmulo caso alguém chame a função repetidamente.
    if (select count(*) from public.keepalive) >= 10 then
      return 'limite atingido';
    end if;
    insert into public.keepalive (nota) values ('registro fictício') returning id into novo_id;
    update public.keepalive set nota = 'registro fictício alterado', alterado_em = now() where id = novo_id;
    return 'criado e alterado: ' || novo_id;
  elsif etapa = 'apagar' then
    delete from public.keepalive;
    return 'apagado';
  else
    raise exception 'etapa inválida: %', etapa;
  end if;
end;
$$;

revoke all on function public.keepalive_tick(text) from public;
grant execute on function public.keepalive_tick(text) to anon, authenticated;
