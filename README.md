# BoraLah

PWA para decidir onde comer, com foco em lugares com espaço kids. Catálogo de restaurantes, filtros, sorteio ("Decide pra mim") e registro de visitas com notas.

**Stack:** Vite + React + TypeScript, Tailwind e componentes no padrão shadcn/ui, Supabase (banco, login e fotos), publicado no GitHub Pages.

## Rodar no computador

```bash
npm install
npm run dev
```

Sem configurar nada, o app abre em **modo demonstração**: usa dados fictícios salvos só no navegador e qualquer pessoa pode editar. Serve para testar a interface antes de ligar o banco.

## Ligar o Supabase

Os nomes dos menus do painel do Supabase podem ter mudado; se algo não bater, confira a documentação deles.

1. Crie um projeto em [supabase.com](https://supabase.com) (plano grátis).
2. No **SQL Editor**, cole e rode o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas, as regras de segurança e o bucket de fotos.
3. Em **Authentication**, desative novos cadastros públicos (sign ups), para ninguém além de você conseguir criar conta. Depois convide ou crie o seu usuário com o seu e-mail.
4. Em **Authentication > URL Configuration**, adicione `https://neybarao.github.io/boralah/` (e `http://localhost:5173/boralah/` para testar localmente) nas URLs de redirecionamento.
5. Pegue o seu user id em **Authentication > Users** e rode no SQL Editor:
   ```sql
   insert into public.admins (user_id) values ('SEU-USER-ID');
   ```
6. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do projeto.

## Publicar no GitHub Pages

1. Em **Settings > Pages** do repositório, escolha **Source: GitHub Actions**.
2. Em **Settings > Secrets and variables > Actions**, crie os segredos `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY` (os mesmos do `.env.local`). Sem eles, o site sai em modo demonstração.
3. Cada push na `main` publica em `https://neybarao.github.io/boralah/`.

A chave usada aqui é a pública (anon/publishable), feita para ficar no navegador. Quem protege os dados são as regras de segurança do `schema.sql`: leitura aberta, escrita só para quem está na tabela `admins`.

## Pausa do plano grátis

O Supabase pausa projetos grátis com pouca atividade em 7 dias. O workflow `keepalive.yml` faz uma consulta leve a cada 3 dias para evitar isso. O GitHub pode desativar tarefas agendadas em repositórios sem atividade por muito tempo; se a pausa acontecer, reative o projeto no painel do Supabase (os dados não se perdem) e rode o workflow de novo.

## Estrutura

```
src/
  lib/data.ts       acesso ao banco (Supabase ou modo demonstração)
  lib/store.tsx     estado global: lugares, visitas, filtros, admin
  lib/utils.ts      filtros, datas, redução de fotos antes do envio
  components/ui/    componentes no padrão shadcn/ui
  pages/            telas: início, sorteio, lugar, visita, cadastro, login
supabase/schema.sql banco, regras de segurança e bucket de fotos
```
