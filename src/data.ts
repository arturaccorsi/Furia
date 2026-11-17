// Dados de demonstração. Não há backend ainda: tudo aqui é estático,
// com horários calculados a partir do momento em que a página abre.

export type Game = 'CS2' | 'LoL' | 'Valorant'

/** Modalidades que o torcedor acompanha, em ordem de preferência. */
export const PREFERRED_GAMES: Game[] = ['CS2', 'LoL', 'Valorant']

/** Modalidades da FURIA que aparecem no onboarding. */
export const MODALITIES: { id: string; name: string; genre: string; logo: string }[] = [
  { id: 'CS2', name: 'CS2', genre: 'FPS tático', logo: '/img/cs2.webp' },
  { id: 'LoL', name: 'League of Legends', genre: 'MOBA', logo: '/img/lol.webp' },
  { id: 'Valorant', name: 'Valorant', genre: 'FPS tático', logo: '/img/valorant.webp' },
  { id: 'R6', name: 'Rainbow Six', genre: 'FPS tático', logo: '/img/r6.webp' },
  { id: 'Kings League', name: 'Kings League', genre: 'Futebol 7', logo: '/img/kings-league.webp' },
  { id: 'Rocket League', name: 'Rocket League', genre: 'Carros + bola', logo: '/img/rocket-league.webp' },
]

export const GAME_LOGO: Record<Game, string> = {
  CS2: '/img/cs2.webp',
  LoL: '/img/lol.webp',
  Valorant: '/img/valorant.webp',
}

export type TeamId = 'furia' | 'vitality' | 'loud' | 'mouz' | 'pain' | 'sentinels' | 'nemiga' | 'betboom'

export const TEAMS: Record<TeamId, { name: string; logo?: string }> = {
  furia: { name: 'FURIA', logo: '/img/furia-logo.webp' },
  vitality: { name: 'Vitality', logo: '/img/vitality.webp' },
  loud: { name: 'LOUD', logo: '/img/loud.webp' },
  mouz: { name: 'MOUZ' },
  pain: { name: 'paiN' },
  sentinels: { name: 'Sentinels' },
  nemiga: { name: 'Nemiga' },
  betboom: { name: 'BetBoom' },
}

/** Time conhecido (com logo local) ou vindo da PandaScore. */
export type TeamRef = TeamId | { name: string; logo?: string }
export const teamInfo = (t: TeamRef): { name: string; logo?: string } => (typeof t === 'string' ? TEAMS[t] : t)

export type MapResult = { name: string; pick: string; furia: number; opp: number; state: 'win' | 'loss' | 'live' | 'next' }

export type Match = {
  id: string
  game: Game
  event: string
  opponent: TeamRef
  format: string
  /** minutos a partir de agora (negativo = já começou), arredondado para a meia hora seguinte */
  startsIn?: number
  /** dia relativo a hoje e horário fixo (Brasília) */
  at?: { day: number; time: string }
  /** horário absoluto (partidas reais da PandaScore) */
  startAt?: number
  /** mapa e rodada só existem nos dados de demonstração (na PandaScore são do plano pago) */
  live?: { series: [number, number]; map?: string; mapNumber?: number; score?: [number, number]; round?: number }
  maps?: MapResult[]
  crowdPick?: number
  stream?: string
}

export const MATCHES: Match[] = [
  {
    id: 'major-singapura-final',
    game: 'CS2',
    event: 'Major de Singapura · Grande final',
    opponent: 'vitality',
    format: 'MD5',
    startsIn: -210,
    live: { series: [2, 2], map: 'Cache', mapNumber: 5, score: [12, 5], round: 18 },
    maps: [
      { name: 'Mirage', pick: 'pick FURIA', furia: 13, opp: 9, state: 'win' },
      { name: 'Nuke', pick: 'pick Vitality', furia: 8, opp: 13, state: 'loss' },
      { name: 'Inferno', pick: 'pick FURIA', furia: 13, opp: 10, state: 'win' },
      { name: 'Dust2', pick: 'pick Vitality', furia: 11, opp: 13, state: 'loss' },
      { name: 'Cache', pick: 'decisivo', furia: 12, opp: 5, state: 'live' },
    ],
    crowdPick: 62,
    stream: 'https://www.twitch.tv/furiatv',
  },
  { id: 'lol-loud-lta', game: 'LoL', event: 'LTA Sul · Playoffs', opponent: 'loud', format: 'MD5', startsIn: 120, crowdPick: 58 },
  { id: 'val-loud-vct', game: 'Valorant', event: 'VCT Americas · Playoffs', opponent: 'loud', format: 'MD3', at: { day: 1, time: '19:00' }, crowdPick: 55 },
  { id: 'cs-mouz-blast', game: 'CS2', event: 'BLAST Rivals · Fase de grupos', opponent: 'mouz', format: 'MD3', at: { day: 2, time: '13:00' }, crowdPick: 64 },
  { id: 'lol-pain-lta', game: 'LoL', event: 'LTA Sul · Final', opponent: 'pain', format: 'MD5', at: { day: 3, time: '16:00' }, crowdPick: 51 },
  { id: 'val-sen-vct', game: 'Valorant', event: 'VCT Americas · Final', opponent: 'sentinels', format: 'MD5', at: { day: 4, time: '20:00' }, crowdPick: 47 },
]

export type Result = { id: string; game: Game; opponent: TeamRef; score: [number, number]; event: string }

export const RESULTS: Result[] = [
  { id: 'r1', game: 'CS2', opponent: 'nemiga', score: [3, 2], event: 'PGL Masters Bucharest · Final' },
  { id: 'r2', game: 'LoL', opponent: 'loud', score: [1, 2], event: 'LTA Sul' },
  { id: 'r3', game: 'CS2', opponent: 'betboom', score: [3, 2], event: 'Thunderpick World Championship · Final' },
  { id: 'r4', game: 'Valorant', opponent: 'loud', score: [2, 0], event: 'VCT Americas' },
]

export type Product = { id: string; name: string; collection: string; price: number; images: string[]; sizes: string[]; soldOut?: string[]; description: string }

export const LEVEL_DISCOUNT = 0.2

export const PRODUCTS: Product[] = [
  { id: 'jersey-2026', name: 'Jersey Oficial 2026', collection: 'Uniforme 2026', price: 349.9, images: ['/img/camiseta-1.webp', '/img/camiseta-2.webp', '/img/camiseta-3.webp'], sizes: ['PP', 'P', 'M', 'G', 'GG', 'XG'], soldOut: ['XG'], description: 'Tecido leve e respirável, escudo bordado e a pantera em relevo nas costas. A mesma usada pelo time em 2026.' },
  { id: 'camiseta-pantera', name: 'Camiseta Pantera Flash', collection: 'Coleção Neotrad', price: 189.9, images: ['/img/camiseta-2.webp', '/img/camiseta-1.webp', '/img/camiseta-3.webp'], sizes: ['PP', 'P', 'M', 'G', 'GG'], description: 'Algodão pesado 240 g, modelagem oversized e estampa em serigrafia com a pantera em flash neotradicional.' },
  { id: 'camiseta-basica', name: 'Camiseta Essencial Preta', collection: 'Básicos', price: 129.9, images: ['/img/camiseta-3.webp', '/img/camiseta-1.webp'], sizes: ['P', 'M', 'G', 'GG'], description: 'A básica de todo torcedor: algodão macio e a pantera discreta no peito.' },
  { id: 'jersey-professor', name: 'Jersey O Professor', collection: 'Edição de despedida', price: 399.9, images: ['/img/camiseta-1.webp', '/img/camiseta-3.webp'], sizes: ['P', 'M', 'G', 'GG'], soldOut: ['P'], description: 'Edição limitada em homenagem à última temporada do FalleN, com número e assinatura nas costas.' },
  { id: 'camiseta-neotrad', name: 'Camiseta Olho Místico', collection: 'Coleção Neotrad', price: 179.9, images: ['/img/camiseta-2.webp', '/img/camiseta-3.webp'], sizes: ['P', 'M', 'G', 'GG'], description: 'Estampa do olho em flash de tatuagem, com raios dourados.' },
  { id: 'jersey-treino', name: 'Jersey de Treino', collection: 'Uniforme 2026', price: 249.9, images: ['/img/camiseta-3.webp', '/img/camiseta-2.webp'], sizes: ['PP', 'P', 'M', 'G', 'GG', 'XG'], description: 'A camisa que o time usa no bootcamp. Tecido técnico e corte atlético.' },
]

export const PRODUCT_CATEGORIES = ['Tudo', 'Uniformes', 'Neotrad', 'Básicos', 'Despedida']

export type Achievement = { id: string; name: string; img: string; how: string; unlocked: boolean; limited?: boolean; points: number }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'palpiteiro', name: 'Palpiteiro', img: '/img/palpiteiro.webp', how: 'Acerte 5 palpites de série.', unlocked: true, points: 100 },
  { id: 'madrugador', name: 'Madrugador', img: '/img/madrugador.webp', how: 'Assista a um jogo que começa depois da meia-noite.', unlocked: true, points: 50 },
  { id: 'professor', name: 'Professor', img: '/img/professor.webp', how: 'Acompanhe a história do FalleN do começo ao fim.', unlocked: true, points: 100 },
  { id: 'despedida', name: 'A despedida', img: '/img/despedida.webp', how: 'Assista à partida de despedida do FalleN ao vivo pelo app.', unlocked: false, limited: true, points: 300 },
  { id: 'na-arena', name: 'Na arena', img: '/img/olho.webp', how: 'Faça check-in em um evento presencial.', unlocked: false, points: 100 },
  { id: 'campeao', name: 'Campeão', img: '/img/trofeu.webp', how: 'Acompanhe ao vivo uma final que a FURIA venceu.', unlocked: false, points: 150 },
  { id: 'fiel', name: 'Fiel', img: '/img/coracao.webp', how: 'Abra o app em 30 dias de jogo seguidos.', unlocked: false, points: 200 },
]
export const ACHIEVEMENTS_TOTAL = 40

export const LEVELS = [
  { name: 'Gato-do-mato', min: 0 },
  { name: 'Jaguatirica', min: 200 },
  { name: 'Onça-pintada', min: 500 },
  { name: 'Pantera', min: 1000 },
]
export const USER_POINTS = 1240

export const WAYS_TO_EARN = [
  { pts: '+10', title: 'Dar palpite', sub: 'Em qualquer partida', img: '/img/raio.webp' },
  { pts: '+50', title: 'Acertar o palpite', sub: 'Vencedor e placar', img: '/img/trofeu.webp' },
  { pts: '5 pt / R$ 1', title: 'Comprar na loja', sub: 'Vale com cupom', img: '/img/coracao.webp' },
  { pts: '+100', title: 'Assistiu presencial', sub: 'Check-in pelo app na arena', img: '/img/olho.webp' },
]

export type Media = { kind: 'video' | 'materia'; meta: string; title: string; thumb?: string; url: string; sub?: string }

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`

export const STORY_MEDIA: Media[] = [
  { kind: 'video', meta: 'Documentário · theScore', title: 'The Story of FalleN: The Brazilian Godfather of CS', sub: 'A carreira do padrinho do CS brasileiro', thumb: '/img/thumb-thescore-story-of-fallen.webp', url: yt('ornJkqqb1ts') },
  { kind: 'materia', meta: 'Matéria · Sudoeste Paulista', title: 'A trajetória épica do itarareense FalleN', sub: 'Da LAN house em Itapetininga aos maiores palcos do mundo', url: 'https://sudoestepaulista.com.br/conheca-a-trajetoria-epica-de-fallen-o-itarareense-considerado-um-dos-maiores-nomes-do-esports-brasileiro-e-mundial/' },
]

export type TimelineItem =
  | { kind: 'marco'; date: string; text: string }
  | { kind: 'fase' | 'atual'; date: string; title: string; body: string; art: string; media?: Media[] }

export const TIMELINE: TimelineItem[] = [
  { kind: 'marco', date: '1991', text: 'Nasce em Itararé (SP) e cresce em Itapetininga' },
  { kind: 'marco', date: '2003', text: 'Primeiro contato com o CS, numa LAN house de Itapetininga' },
  { kind: 'marco', date: '2005', text: 'Primeiros campeonatos nacionais, no CS 1.6' },
  { kind: 'fase', date: '2010', title: 'Campeão pan-americano', body: 'Pela FireGamers, o primeiro grande troféu da carreira.', art: '/img/trofeu.webp' },
  { kind: 'fase', date: '2012', title: 'Nasce o Professor', body: 'Funda a Games Academy e passa a formar uma geração de jogadores.', art: '/img/games-academy.webp' },
  { kind: 'marco', date: 'Ago 2012', text: 'CS:GO é lançado' },
  { kind: 'marco', date: '2015', text: 'Primeiro Major: Katowice, pela Keyd Stars, até as quartas' },
  {
    kind: 'fase', date: 'Mar 2016', title: 'IEM Katowice', body: 'O 1v4 contra a NAVI virou bordão na narração: “FalleN, stop blowing my mind!”.', art: '/img/olho.webp',
    media: [{ kind: 'video', meta: 'Vídeo · HLTV', title: '“FalleN, stop blowing my mind!”', thumb: '/img/thumb-fallen-1v4-katowice.webp', url: yt('QD6rT2CVgak') }],
  },
  {
    kind: 'fase', date: 'Abr 2016', title: 'Major 1: MLG Columbus', body: 'Pela Luminosity, o primeiro Major conquistado por um time da América do Sul.', art: '/img/trofeu.webp',
    media: [
      { kind: 'video', meta: 'Vídeo · Valve', title: 'CS:GO Player Profiles: FalleN', thumb: '/img/thumb-valve-fallen-profile.webp', url: yt('_KB9P3goVic') },
      { kind: 'video', meta: 'Vídeo · MLG', title: 'Final do MLG Columbus: Luminosity x NAVI', thumb: '/img/thumb-mlg-columbus-final.webp', url: yt('7nWxZin959o') },
    ],
  },
  { kind: 'marco', date: 'Mai 2016', text: 'Games Academy se une à Gamers Club' },
  {
    kind: 'fase', date: 'Jul 2016', title: 'Major 2: ESL One Cologne', body: 'Já pela SK Gaming, o bicampeonato veio três meses depois, na Alemanha.', art: '/img/trofeu.webp',
    media: [{ kind: 'video', meta: 'Vídeo · ESL', title: 'Final da ESL One Cologne: SK x Liquid', thumb: '/img/thumb-cologne-2016-final.webp', url: yt('AK5RY8W-AcM') }],
  },
  { kind: 'marco', date: 'Dez 2016', text: 'Eleito o 2º melhor jogador do mundo pela HLTV' },
  { kind: 'fase', date: '2017', title: 'Seis troféus pela SK', body: 'ESL One Cologne, IEM Sydney, cs_summit, ECS Season 3, EPICENTER e ESL Pro League Season 6.', art: '/img/trofeu.webp' },
  { kind: 'marco', date: 'Dez 2017', text: '6º melhor jogador do mundo pela HLTV' },
  { kind: 'fase', date: '2018 – 2022', title: 'Estrada longa', body: 'MIBR, Liquid e Imperial. A Last Dance leva o Brasil de volta ao Major.', art: '' },
  { kind: 'marco', date: '2022', text: 'The Last Dance, pela Imperial, bate recorde de audiência no Brasil' },
  { kind: 'fase', date: '2023', title: 'Veste a pantera', body: 'Chega à FURIA como capitão e referência do elenco.', art: '/img/furia-logo.webp' },
  { kind: 'marco', date: 'Set 2023', text: 'CS2 é lançado' },
  { kind: 'fase', date: '2025', title: 'Quatro troféus em três meses', body: 'FISSURE Playground 2, Thunderpick World Championship, IEM Chengdu e BLAST Rivals.', art: '/img/trofeu.webp' },
  {
    kind: 'fase', date: '17 abr 2026', title: 'Anuncia a despedida', body: 'No palco da IEM Rio, sob o grito de “FalleN, we love you”, confirma que 2026 é sua última temporada.', art: '/img/coracao.webp',
    media: [
      { kind: 'video', meta: 'Vídeo · IEM Rio', title: 'O anúncio no palco da IEM Rio', thumb: '/img/thumb-anuncio-aposentadoria.webp', url: yt('r_fEG399BFQ') },
      { kind: 'materia', meta: 'Matéria · Omelete', title: 'FalleN anuncia aposentadoria', url: 'https://www.omelete.com.br/games/counter-strike-cs-brasileiro-fallen-aposentadoria' },
    ],
  },
  { kind: 'fase', date: '2026', title: 'Vice no Major e mais dois títulos', body: 'Final do Major de Cologne, bi do Thunderpick e o PGL Masters Bucharest: o 48º troféu da carreira.', art: '/img/trofeu.webp' },
  { kind: 'atual', date: '25 nov – 13 dez 2026', title: 'Major de Singapura', body: 'A Última Aula do Professor: o último campeonato da carreira.', art: '/img/despedida.webp' },
]

/** Fim da carreira do FalleN, para o contador do hero. */
export const RETIREMENT_DATE = new Date('2026-12-31T23:59:59-03:00')
