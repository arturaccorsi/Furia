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
