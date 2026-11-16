import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/** Grava o palpite no Supabase (quando configurado). Retorna erro legível ou null. */
export async function savePalpiteRemote(p: { deviceId: string; matchId: string; winner: 'furia' | 'opp'; score: string; nome: string | null }) {
  if (!supabase) return null
  const { error } = await supabase.rpc('salvar_palpite', {
    p_device: p.deviceId,
    p_match: p.matchId,
    p_winner: p.winner,
    p_score: p.score,
    p_nome: p.nome ?? '',
  })
  return error ? 'Seu palpite ficou salvo só neste aparelho; não conseguimos enviar agora.' : null
}

/** % real da torcida que foi de FURIA. null = sem dados (usa o número de exemplo). */
export function useCrowd(matchId: string, refreshKey: unknown) {
  const [pct, setPct] = useState<{ furia: number; total: number } | null>(null)
  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.rpc('resumo_palpites', { p_match: matchId }).then(({ data, error }) => {
      if (!alive || error || !data) return
      const d = data as { total: number; furia: number }
      setPct(d.total > 0 ? { furia: Math.round((d.furia / d.total) * 100), total: d.total } : null)
    })
    return () => {
      alive = false
    }
  }, [matchId, refreshKey])
  return pct
}
