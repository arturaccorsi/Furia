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

/**
 * - pandascore: a função respondeu (mesmo que vazia)
 * - demo: não há função (rodando local) → dados de demonstração
 * - error: a função existe mas falhou
 */
export type Source = 'loading' | 'pandascore' | 'demo' | 'error'
type Data = { matches: Match[]; results: Result[]; source: Source }

const demo: Data = { matches: MATCHES, results: RESULTS, source: 'demo' }
const failed: Data = { matches: [], results: [], source: 'error' }
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
    .then(async (r) => {
      const isJson = r.headers.get('content-type')?.includes('json')
      if (!isJson) return demo // sem a função (dev local / preview estático)
      if (!r.ok) return failed
      const a = (await r.json()) as Api
      if (a.errors?.length) console.warn('PandaScore:', a.errors)
      return fromApi(a)
    })
    .catch(() => failed)
    .then((d) => (cache = d))
  return pending
}

/** Dados da PandaScore (ou demonstração quando não há função). */
export function useMatchData(): Data & { retry: () => void } {
  const [data, setData] = useState<Data>(cache ?? { matches: [], results: [], source: 'loading' })
  useEffect(() => {
    if (!cache) load().then(setData)
  }, [])
  const retry = () => {
    cache = null
    pending = null
    setData({ matches: [], results: [], source: 'loading' })
    load().then(setData)
  }
  return { ...data, retry }
}

/**
 * Quando a PandaScore responde sem nenhum jogo marcado:
 * true = mostra a agenda de exemplo; false = mostra "Ainda não há jogos marcados".
 */
export const USE_PLACEHOLDER_WHEN_EMPTY = true

/** Partidas para a agenda: reais quando houver, senão os placeholders (ou vazio). */
export function agendaMatches(d: Data): { list: Match[]; placeholder: boolean } {
  if (d.source === 'pandascore' && d.matches.length) return { list: d.matches, placeholder: false }
  if (d.source === 'pandascore' && !USE_PLACEHOLDER_WHEN_EMPTY) return { list: [], placeholder: false }
  return { list: MATCHES, placeholder: true }
}
