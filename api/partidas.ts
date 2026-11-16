// Função da Vercel (Edge) que consulta a PandaScore com o token secreto
// PANDASCORE_TOKEN e devolve ao site só as partidas da FURIA, já normalizadas.
// O token nunca vai para o navegador.

export const config = { runtime: 'edge' }

const API = 'https://api.pandascore.co'
// slug da PandaScore -> nome usado no site
const GAMES: Record<string, 'CS2' | 'LoL' | 'Valorant'> = { csgo: 'CS2', lol: 'LoL', valorant: 'Valorant' }

type PSTeam = { id: number; name: string; acronym?: string | null; image_url?: string | null }
type PSMatch = {
  id: number
  name: string
  status: string
  begin_at: string | null
  scheduled_at: string | null
  number_of_games: number
  opponents: { opponent: PSTeam }[]
  results: { team_id: number; score: number }[]
  league?: { name?: string } | null
  serie?: { full_name?: string; name?: string | null } | null
  tournament?: { name?: string } | null
  streams_list?: { raw_url: string; main?: boolean; language?: string }[]
}

async function ps<T>(path: string, token: string): Promise<T> {
  const r = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  if (!r.ok) throw new Error(`PandaScore ${r.status} em ${path.split('?')[0]}`)
  return r.json() as Promise<T>
}

/** Acha o time principal da FURIA no jogo (ignora academy, feminino etc.). */
async function furiaId(slug: string, token: string): Promise<number | null> {
  const teams = await ps<PSTeam[]>(`/${slug}/teams?search[name]=FURIA&per_page=20`, token)
  const exact = teams.find((t) => t.name.trim().toUpperCase() === 'FURIA') ?? teams.find((t) => /^furia( esports)?$/i.test(t.name.trim()))
  return exact?.id ?? null
}

function normalize(m: PSMatch, game: string, furia: number) {
  const opp = m.opponents.map((o) => o.opponent).find((t) => t.id !== furia)
  const score = (id?: number) => m.results.find((r) => r.team_id === id)?.score ?? 0
  const stream = m.streams_list?.find((s) => s.main)?.raw_url ?? m.streams_list?.[0]?.raw_url
  const event = [m.league?.name, m.serie?.full_name || m.serie?.name, m.tournament?.name].filter(Boolean).join(' · ')
  return {
    id: `ps-${m.id}`,
    game,
    event,
    opponent: { name: opp?.name || opp?.acronym || 'A definir', logo: opp?.image_url ?? undefined },
    format: `MD${m.number_of_games}`,
    startAt: Date.parse(m.begin_at ?? m.scheduled_at ?? '') || null,
    status: m.status,
    series: [score(furia), score(opp?.id)] as [number, number],
    stream,
  }
}

export default async function handler() {
  const token = process.env.PANDASCORE_TOKEN
  if (!token) return json({ error: 'PANDASCORE_TOKEN não configurado' }, 503)

  const upcoming: ReturnType<typeof normalize>[] = []
  const results: ReturnType<typeof normalize>[] = []
  const errors: string[] = []

  await Promise.all(
    Object.entries(GAMES).map(async ([slug, game]) => {
      try {
        const id = await furiaId(slug, token)
        if (!id) return errors.push(`FURIA não encontrada em ${game}`)
        const q = `filter[opponent_id]=${id}`
        const [running, next, past] = await Promise.all([
          ps<PSMatch[]>(`/${slug}/matches/running?${q}&per_page=5`, token),
          ps<PSMatch[]>(`/${slug}/matches/upcoming?${q}&per_page=10&sort=begin_at`, token),
          ps<PSMatch[]>(`/${slug}/matches/past?${q}&per_page=6&sort=-begin_at`, token),
        ])
        upcoming.push(...[...running, ...next].map((m) => normalize(m, game, id)))
        results.push(...past.filter((m) => m.status === 'finished').map((m) => normalize(m, game, id)))
      } catch (e) {
        errors.push(String((e as Error).message))
      }
    }),
  )

  upcoming.sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0))
  results.sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0))
  return json({ updatedAt: new Date().toISOString(), upcoming, results, errors }, 200)
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // guarda na borda da Vercel por 1 dia (e serve a versão antiga por mais 1 dia enquanto atualiza)
      'cache-control': 'public, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
