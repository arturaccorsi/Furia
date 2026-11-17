// Função da Vercel (Edge) que consulta a PandaScore com o token secreto
// PANDASCORE_TOKEN e devolve ao site só as partidas da FURIA, já normalizadas.
// O token nunca vai para o navegador.

export const config = { runtime: 'edge' }

const API = 'https://api.pandascore.co'
// jogo do site -> slug da PandaScore. Pela documentação, o CS2 usa o prefixo
// /csgo/ ("All Counter-Strike endpoints use the /csgo/ prefix for legacy reasons").
const GAMES: Record<'CS2' | 'LoL' | 'Valorant', string> = { CS2: 'csgo', LoL: 'lol', Valorant: 'valorant' }

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

const NOT_MAIN = /academy|fe\b|female|women|feminino|youth|junior|\bjr\b|\b2\b/i

/**
 * Acha o time principal da FURIA no jogo. A PandaScore pode ter mais de um
 * cadastro com o nome (times antigos, academy, feminino): entre os candidatos,
 * fica com o que jogou mais recentemente.
 */
const isMain = (t: PSTeam) => /^furia/i.test(t.name.trim()) && !NOT_MAIN.test(t.name)

async function furiaTeam(slug: string, token: string): Promise<{ team: PSTeam | null; candidates: PSTeam[] }> {
  const teams = await ps<PSTeam[]>(`/${slug}/teams?search[name]=FURIA&per_page=50`, token)
  const candidates = teams.filter(isMain)
  if (candidates.length <= 1) return { team: candidates[0] ?? null, candidates }
  const latest = await Promise.all(
    candidates.map(async (t) => {
      const [m] = await ps<PSMatch[]>(`/${slug}/matches/past?filter[opponent_id]=${t.id}&per_page=1&sort=-begin_at`, token)
      return { t, at: Date.parse(m?.begin_at ?? '') || 0 }
    }),
  )
  latest.sort((a, b) => b.at - a.at)
  return { team: latest[0].t, candidates }
}

/** Reserva: acha a FURIA pelas partidas recentes com "FURIA" no nome (ex.: "FURIA vs Vitality"). */
async function furiaFromMatches(slug: string, token: string): Promise<PSTeam | null> {
  const ms = await ps<PSMatch[]>(`/${slug}/matches/past?search[name]=FURIA&per_page=50&sort=-begin_at`, token)
  const count = new Map<number, { t: PSTeam; n: number }>()
  for (const m of ms) for (const { opponent: t } of m.opponents) if (isMain(t)) count.set(t.id, { t, n: (count.get(t.id)?.n ?? 0) + 1 })
  return [...count.values()].sort((a, b) => b.n - a.n)[0]?.t ?? null
}

/** Nome curto para caber no card: "Team Falcons" -> "Falcons", "paiN Gaming" -> "paiN". */
export function shortTeamName(name: string) {
  const short = name
    .replace(/^team\s+/i, '')
    .replace(/\s+(esports?|e-sports|gaming|club|gg)$/i, '')
    .trim()
  return short || name
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
    opponent: { name: opp?.name ? shortTeamName(opp.name) : opp?.acronym || 'A definir', logo: opp?.image_url ?? undefined },
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
  const teams: Record<string, { id: number; name: string; source: string; candidates: string[] } | null> = {}
  const debug: Record<string, unknown> = {}

  await Promise.all(
    (Object.entries(GAMES) as [keyof typeof GAMES, string][]).map(async ([game, slug]) => {
      try {
        const found = await furiaTeam(slug, token)
        let team = found.team
        let source = 'teams'
        const pastOf = (id: number) => ps<PSMatch[]>(`/${slug}/matches/past?filter[opponent_id]=${id}&per_page=6&sort=-begin_at`, token)
        let past = team ? await pastOf(team.id) : []
        // Se o cadastro achado não tem partidas, tenta descobrir o time pelas partidas recentes.
        if (!past.length) {
          const alt = await furiaFromMatches(slug, token)
          if (alt && alt.id !== team?.id) {
            team = alt
            source = 'matches'
            past = await pastOf(alt.id)
          }
        }
        teams[game] = team && { id: team.id, name: team.name, source, candidates: found.candidates.map((c) => `${c.name} #${c.id}`) }
        if (!team) return errors.push(`FURIA não encontrada em ${game}`)
        const id = team.id
        const q = `filter[opponent_id]=${id}`
        const [running, next] = await Promise.all([
          ps<PSMatch[]>(`/${slug}/matches/running?${q}&per_page=5`, token),
          ps<PSMatch[]>(`/${slug}/matches/upcoming?${q}&per_page=10&sort=begin_at`, token),
        ])
        upcoming.push(...[...running, ...next].map((m) => normalize(m, game, id)))
        const finished = (m: PSMatch) => m.status === 'finished' || m.results.some((r) => r.score > 0)
        let done = past.filter(finished)
        let via = 'filter[opponent_id]'
        // Reserva: partidas com "FURIA" no nome, ficando só com as que têm este time.
        if (!done.length) {
          const byName = await ps<PSMatch[]>(`/${slug}/matches/past?search[name]=FURIA&per_page=50&sort=-begin_at`, token)
          done = byName.filter((m) => m.opponents.some((o) => o.opponent.id === id) && finished(m)).slice(0, 6)
          via = 'search[name]'
          debug[game] = {
            filterCount: past.length,
            filterStatuses: [...new Set(past.map((m) => m.status))],
            searchCount: byName.length,
            searchOpponents: [...new Set(byName.flatMap((m) => m.opponents.map((o) => `${o.opponent.name} #${o.opponent.id}`)))].filter((n) => /furia/i.test(n)),
          }
        }
        if (!done.length) errors.push(`Sem resultados de ${game} para o time ${team.name} (#${team.id}) via ${via}`)
        results.push(...done.map((m) => normalize(m, game, id)))
      } catch (e) {
        errors.push(String((e as Error).message))
      }
    }),
  )

  upcoming.sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0))
  results.sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0))
  return json({ updatedAt: new Date().toISOString(), teams, upcoming, results, errors, debug }, 200)
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
