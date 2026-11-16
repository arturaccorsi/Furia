import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { MATCHES, PREFERRED_GAMES, RESULTS, TEAMS, Game } from '../data'
import { GameLogo, LiveFlame, NavHeader, ResultCard } from '../components'
import { fmtDay, fmtTime, matchStart } from '../time'

export default function Agenda() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('aba') === 'resultados' ? 'resultados' : 'proximos'
  const game = (params.get('jogo') as Game | null) ?? null
  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const matches = MATCHES.filter((m) => PREFERRED_GAMES.includes(m.game) && (!game || m.game === game)).sort((a, b) => matchStart(a) - matchStart(b))
  const days = new Map<string, typeof matches>()
  for (const m of matches) {
    const key = m.live ? 'Agora' : fmtDay(matchStart(m))
    days.set(key, [...(days.get(key) ?? []), m])
  }
  const results = RESULTS.filter((r) => !game || r.game === game)

  return (
    <>
      <NavHeader title="Agenda" />
      <div className="segmented" role="tablist">
        {[['proximos', 'Próximos'], ['resultados', 'Resultados']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => set('aba', k === 'proximos' ? null : k)} aria-pressed={tab === k}>
            {l}
          </button>
        ))}
      </div>
      <div className="chips chips--scroll">
        <button className={`chip${!game ? ' chip--on' : ''}`} onClick={() => set('jogo', null)}>Todos</button>
        {PREFERRED_GAMES.map((g) => (
          <button key={g} className={`chip chip--logo${game === g ? ' chip--on' : ''}`} onClick={() => set('jogo', g)}>
            <GameLogo game={g} size={16} /> {g}
          </button>
        ))}
      </div>

      {tab === 'proximos' ? (
        [...days.entries()].map(([day, list]) => (
          <div key={day} className="stack">
            <span className="mono-label muted">{day}</span>
            {list.map((m) => (
              <Link key={m.id} to={`/partida/${m.id}`} className={`card agenda-row${m.live ? ' agenda-row--live' : ''}`}>
                <b className="mono-m">{m.live ? <LiveFlame size={18} color="var(--red)" /> : fmtTime(matchStart(m))}</b>
                <span className="agenda-row__bar" />
                <span className="agenda-row__info">
                  <b className="body-bold">FURIA vs {TEAMS[m.opponent].name}</b>
                  <small className="muted">{m.live ? 'Ao vivo · ' : ''}{m.game} · {m.event}</small>
                </span>
                <ChevronRight size={20} />
              </Link>
            ))}
          </div>
        ))
      ) : (
        <div className="grid-2">
          {results.map((r) => (
            <ResultCard key={r.id} result={r} />
          ))}
        </div>
      )}
      {tab === 'proximos' && matches.length === 0 && <p className="empty">Nenhum jogo marcado nessa modalidade.</p>}
    </>
  )
}
