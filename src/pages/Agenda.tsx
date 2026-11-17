import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { GAME_LOGO, Game, RESULTS_DAYS, Result, teamInfo } from '../data'
import { agendaMatches, useMatchData } from '../live'
import { useMyGames } from '../store'
import { Button, EmptyState, GameLogo, LiveFlame, LoadingCards, NavHeader, ResultCard, splitEvent } from '../components'
import { fmtDay, fmtTime, matchStart } from '../time'

function groupByEvent(results: Result[]) {
  const groups = new Map<string, { r: Result; stage: string }[]>()
  for (const r of results) {
    const [event, stage] = splitEvent(r.event)
    groups.set(event, [...(groups.get(event) ?? []), { r, stage }])
  }
  return [...groups.entries()]
}

export default function Agenda() {
  const [params, setParams] = useSearchParams()
  const mine = useMyGames()
  const data = useMatchData()
  const { list: MATCHES, placeholder } = agendaMatches(data)
  const RESULTS = data.results
  const tab = params.get('aba') === 'resultados' ? 'resultados' : 'proximos'
  const game = (params.get('jogo') as Game | null) ?? null
  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const matches = MATCHES.filter((m) => mine.includes(m.game) && (!game || m.game === game)).sort((a, b) => matchStart(a) - matchStart(b))
  const days = new Map<string, typeof matches>()
  for (const m of matches) {
    const key = m.live ? 'Agora' : fmtDay(matchStart(m))
    days.set(key, [...(days.get(key) ?? []), m])
  }
  const results = RESULTS.filter((r) => mine.includes(r.game) && (!game || r.game === game))

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
        {mine.map((g) => (
          <button key={g} className={`chip chip--logo${game === g ? ' chip--on' : ''}`} onClick={() => set('jogo', g)}>
            <GameLogo game={g} size={16} /> {g}
          </button>
        ))}
      </div>

      {tab === 'proximos' ? (
        matches.length === 0 ? (
          <EmptyState
            art={<img src={game ? GAME_LOGO[game] : '/img/furia-logo.webp'} alt="" />}
            title={game ? `Sem jogos de ${game} marcados` : 'Ainda não há jogos marcados'}
            text={game ? `Assim que a FURIA tiver partida de ${game}, ela aparece aqui.` : 'A FURIA ainda não tem partidas agendadas nas suas modalidades. Volte mais tarde: a agenda atualiza assim que os campeonatos divulgam os horários.'}
            actions={
              <>
                <Button variant="secondary" onClick={() => set('aba', 'resultados')}>{game ? `Ver resultados de ${game}` : 'Ver resultados'}</Button>
                {game && <Button onClick={() => set('jogo', null)}>Ver todos os jogos</Button>}
              </>
            }
          />
        ) : (
          <>
            {placeholder && <p className="placeholder-note">Jogos fictícios: a agenda oficial ainda não foi divulgada.</p>}
            {[...days.entries()].map(([day, list]) => (
              <div key={day} className="stack">
                <span className="mono-label muted">{day}</span>
                {list.map((m) => (
                  <Link key={m.id} to={`/partida/${m.id}`} className={`card agenda-row${m.live ? ' agenda-row--live' : ''}`}>
                    <b className="mono-m">{m.live ? <LiveFlame size={18} color="var(--red)" /> : fmtTime(matchStart(m))}</b>
                    <span className="agenda-row__bar" />
                    <span className="agenda-row__info">
                      <b className="body-bold">FURIA vs {teamInfo(m.opponent).name}</b>
                      <small className="muted">{m.live ? 'Ao vivo · ' : ''}{m.game} · {m.event}</small>
                    </span>
                    <ChevronRight size={20} />
                  </Link>
                ))}
              </div>
            ))}
          </>
        )
      ) : data.source === 'loading' ? (
        <LoadingCards n={2} />
      ) : data.source === 'error' ? (
        <EmptyState
          title="Não deu pra carregar"
          text="Os resultados não responderam agora. Tente de novo em instantes."
          actions={<Button variant="secondary" onClick={data.retry}>Tentar de novo</Button>}
        />
      ) : results.length === 0 ? (
        <EmptyState
          art={game ? <img src={GAME_LOGO[game]} alt="" /> : undefined}
          title={game ? `Sem resultados de ${game}` : 'Sem resultados recentes'}
          text={`A FURIA não jogou ${game ? `${game} ` : ''}nos últimos ${RESULTS_DAYS} dias. Os placares aparecem aqui assim que as partidas terminam.`}
          actions={<Button variant="secondary" onClick={() => set('aba', null)}>{game ? `Ver próximos jogos de ${game}` : 'Ver próximos jogos'}</Button>}
        />
      ) : (
        <>
        <p className="section-note">Partidas dos últimos {RESULTS_DAYS} dias, da mais recente para a mais antiga.</p>
        {game ? (
          // Com um jogo filtrado, agrupa por campeonato: o nome vira subtítulo e o card mostra só a fase.
          groupByEvent(results).map(([event, list]) => (
            <div key={event} className="stack result-group">
              <h3 className="result-group__title">{event}</h3>
              <div className="grid-2">
                {list.map(({ r, stage }) => (
                  <ResultCard key={r.id} result={r} sub={stage || ' '} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid-2">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        )}
        </>
      )}
    </>
  )
}
