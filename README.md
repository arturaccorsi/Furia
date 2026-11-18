# FURIA · Torcida

App gratuito para o torcedor da FURIA, feito a partir do arquivo "FURIA Sócio-Torcedor — Home" no Figma.

## Rodar localmente

```bash
npm install
npm run dev
```

Build de produção em `dist/`:

```bash
npm run build
```

## Como está hoje (protótipo)

- **Sem login real:** na primeira visita o torcedor só escolhe um nome. Ele fica salvo no navegador (localStorage), junto com palpites, lembretes, check-ins e carrinho.
- **Modalidades fixas:** o torcedor acompanha CS2 > LoL > Valorant, nessa ordem de preferência (`PREFERRED_GAMES` em `src/data.ts`).
- **Dados de demonstração:** partidas, resultados, produtos e conquistas estão em `src/data.ts`. Os horários das partidas são calculados a partir do momento em que a página abre.
- **Telas:** boas-vindas, Jogos (home), Agenda, Partida (ao vivo e antes do jogo), História do FalleN, Loja, Produto, Carrinho, Perfil (com o modal "Como ganhar pontos") e Conquista.

## Estrutura

- `src/data.ts`: conteúdo (partidas, timeline do FalleN, loja, conquistas)
- `src/store.ts`: estado do torcedor salvo no navegador
- `src/components.tsx`: componentes do design (cards, faixa de título, tab bar etc.)
- `src/pages/`: uma tela por arquivo
- `public/img/`: imagens exportadas do Figma e capas dos vídeos

## Supabase

O site funciona sem Supabase (tudo fica no navegador). Para ligar:

1. No painel do Supabase, abra **SQL Editor** e rode, em ordem, cada arquivo de `supabase/migrations/` (`0001_sugestoes.sql`, `0002_palpites.sql`, `0003_limite_sugestoes.sql`).
2. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (em **Project Settings > API**).
3. Rode `npm run dev`. As sugestões da história do FalleN vão para a tabela `sugestoes` e os palpites para `palpites` (o "% da torcida" passa a ser real).

Na hospedagem (Vercel, Netlify), cadastre as mesmas duas variáveis de ambiente.

## PandaScore (partidas reais)

A função `api/partidas.ts` roda na Vercel, consulta a PandaScore e devolve ao site as partidas da FURIA em CS2, LoL e Valorant (ao vivo, próximas e últimos resultados). O resultado fica em cache por 1 dia.

- **Resultados:** 100% PandaScore.
- **Agenda (próximos):** PandaScore quando houver jogos marcados; senão, a agenda de exemplo.
- **Home "Ao vivo e próximos" e detalhe da partida:** continuam com os exemplos (mapas incluídos).

- Cadastre o token na Vercel como `PANDASCORE_TOKEN` (sem `VITE_`, como segredo). Ele nunca vai para o navegador.
- Sem o token, ou rodando local com `npm run dev`, o site usa os dados de demonstração de `src/data.ts`.
- Para conferir, abra `/api/partidas` no site publicado.
