import { useEffect, useState } from 'react'
import { Game, MATCHES, Match, RESULTS, Result } from './data'

// Busca as partidas reais em /api/partidas (função da Vercel com a PandaScore).
// Se a função não existir (rodando local) ou falhar, usa os dados de demonstração.

type ApiMatch = {
  id: string
  game: Game
  event: string
  opponent: { name: string; logo?: string }
  format: string
  startAt: number | null
  status: string
  series: [number, number]
  stream?: string
}
type Api = { upcoming: ApiMatch[]; results: ApiMatch[]; errors?: string[] }

export type Source = 'loading' | 'pandascore' | 'demo'
type Data = { matches: Match[]; results: Result[]; source: Source }

const demo: Data = { matches: MATCHES, results: RESULTS, source: 'demo' }
let cache: Data | null = null
let pending: Promise<Data> | null = null

function fromApi(a: Api): Data {
  const matches: Match[] = a.upcoming
    .filter((m) => m.startAt)
    .map((m) => ({
      id: m.id,
      game: m.game,
      event: m.event,
      opponent: m.opponent,
      format: m.format,
      startAt: m.startAt!,
      live: m.status === 'running' ? { series: m.series } : undefined,
      stream: m.stream,
    }))
  const results: Result[] = a.results.map((m) => ({ id: m.id, game: m.game, opponent: m.opponent, score: m.series, event: m.event }))
  return { matches, results, source: 'pandascore' }
}

function load(): Promise<Data> {
  pending ??= fetch('/api/partidas')
    .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? (r.json() as Promise<Api>) : Promise.reject(r.status)))
    .then((a) => {
      if (a.errors?.length) console.warn('PandaScore:', a.errors)
      const d = fromApi(a)
      return d.matches.length || d.results.length ? d : demo
    })
    .catch(() => demo)
    .then((d) => (cache = d))
  return pending
}

export function useMatchData(): Data {
  const [data, setData] = useState<Data>(cache ?? { ...demo, source: 'loading' })
  useEffect(() => {
    if (!cache) load().then(setData)
  }, [])
  return data
}
