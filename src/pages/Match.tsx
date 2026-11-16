import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Lock, MapPin } from 'lucide-react'
import { MATCHES, Match as M, teamInfo } from '../data'
import { savePalpiteRemote, useCrowd } from '../palpites'
import { useMatchData } from '../live'
import { Button, Countdown, LiveFlame, LiveTag, NavHeader, Section, TeamCrest } from '../components'
import { actions, useStore } from '../store'
import { fmtDay, fmtTime, matchStart } from '../time'

export default function Match() {
  const { id } = useParams()
  const { matches, source } = useMatchData()
  const match = MATCHES.find((m) => m.id === id) ?? matches.find((m) => m.id === id)
  if (!match && source === 'loading') return <NavHeader title="Partida" />
  if (!match) {
    return (
      <>
        <NavHeader title="Partida" />
        <p className="empty">Partida não encontrada. <Link to="/agenda">Ver agenda</Link></p>
      </>
    )
  }
  const start = matchStart(match)
  const opp = teamInfo(match.opponent)
  return (
    <>
      <NavHeader title="Partida" />
      {!match.id.startsWith('ps-') && <p className="placeholder-note">Partida fictícia, só para exemplo.</p>}
      <article className="card match-card match-card--detail">
        {match.live ? <LiveTag /> : null}
        <div className="match-card__meta">
          <b>{match.game}</b>
          <span>· {match.event}</span>
        </div>
        <div className="match-card__teams">
          <div className="team">
            <span className="crest-ring"><TeamCrest team="furia" /></span>
            <span>FURIA</span>
          </div>
          <div className="match-card__mid">
            {match.live ? <b className="mono-m">{match.live.series[0]} : {match.live.series[1]}</b> : <b className="vs">vs</b>}
            <small>{match.live ? `Série · ${match.format}` : match.format}</small>
          </div>
          <div className="team">
            <span className="crest-ring"><TeamCrest team={match.opponent} /></span>
            <span>{opp.name}</span>
          </div>
        </div>
        <div className="match-card__center">
          {match.live ? (
            <>
              {match.live.score ? (
                <>
                  <small>Mapa {match.live.mapNumber} · {match.live.map} · em andamento</small>
                  <b className="score-xl">{match.live.score[0]} : {match.live.score[1]}</b>
                </>
              ) : (
                <>
                  <small>Série em andamento</small>
                  <b className="score-xl">{match.live.series[0]} : {match.live.series[1]}</b>
                </>
              )}
            </>
          ) : (
            <>
              <small>{fmtDay(start)} · {fmtTime(start)} (Brasília) · começa em</small>
              <Countdown target={start} />
            </>
          )}
        </div>
        {match.live ? (
          <Button full href={match.stream}>Assistir ao vivo</Button>
        ) : (
          <ReminderButton id={match.id} />
        )}
      </article>

      <CheckinCard match={match} />

      <Section title="Mapas">
        {match.maps || match.live ? (
          <div className="stack">
            {!match.maps && <p className="placeholder-note">Exemplo: o placar mapa a mapa ainda não está disponível para esta partida.</p>}
            {(match.maps ?? EXAMPLE_MAPS).map((m, i) => (
              <div key={m.name} className={`card map-row${m.state === 'live' ? ' map-row--live' : ''}`}>
                <span className={`map-row__result map-row__result--${m.state}`}>
                  {m.state === 'win' ? 'V' : m.state === 'loss' ? 'D' : <LiveFlame size={16} color="#fff" />}
                </span>
                <span className="map-row__info">
                  <b className="heading">{m.name}</b>
                  <small className="muted">Mapa {i + 1} · {m.state === 'live' ? `Ao vivo · rodada ${match.live?.round ?? 18}` : m.pick}</small>
                </span>
                <span className="map-row__score mono-score">
                  <span>{m.furia}</span>
                  <span>:</span>
                  <span>{m.opp}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="card note">Os mapas saem no veto, cerca de 30 min antes da partida. A gente te avisa.</p>
        )}
      </Section>

      <Section title="Seu palpite">
        {match.live ? <ClosedBet match={match} /> : <OpenBet match={match} />}
      </Section>
    </>
  )
}

function ReminderButton({ id }: { id: string }) {
  const { reminders } = useStore()
  const on = reminders.includes(id)
  return (
    <Button full variant={on ? 'secondary' : 'primary'} onClick={() => actions.toggleReminder(id)}>
      {on ? 'Lembrete ativado ✓' : 'Lembrar do jogo'}
    </Button>
  )
}

function CheckinCard({ match }: { match: M }) {
  const { checkins } = useStore()
  const [status, setStatus] = useState<'idle' | 'checking'>('idle')
  const done = checkins.includes(match.id)
  const open = !!match.live || matchStart(match) - Date.now() <= 3_600_000

  // Protótipo: simula a confirmação da localização, sem pedir permissão ao navegador.
  const checkin = () => {
    setStatus('checking')
    setTimeout(() => {
      actions.checkin(match.id)
      setStatus('idle')
    }, 1200)
  }

  return (
    <div className="card checkin">
      <div className="checkin__row">
        <img src="/img/olho.webp" alt="" className="checkin__art" />
        <div className="checkin__text">
          <b className="heading">{done ? 'Check-in feito!' : 'Assistindo na arena?'}</b>
          <small className="muted">
            {done
              ? 'Os pontos já estão no seu perfil.'
              : open
                ? 'Faça check-in por localização e ganhe pontos.'
                : 'O check-in por localização abre 1h antes da partida.'}
          </small>
        </div>
        <span className="pts-tag">{done ? <Check size={14} strokeWidth={3} /> : null}+100 pts</span>
      </div>
      {open && !done && (
        <>
          <Button full variant="secondary" onClick={checkin} disabled={status === 'checking'}>
            <MapPin size={16} /> {status === 'checking' ? 'Confirmando…' : 'Estou na arena'}
          </Button>
          <small className="muted">
            Usamos sua localização só neste momento, pra confirmar que você está no local do jogo.
          </small>
        </>
      )}
    </div>
  )
}

const EXAMPLE_MAPS = MATCHES.find((m) => m.maps)!.maps!

const scoreOptions = (m: M) => {
  const n = Number(m.format.replace(/\D/g, '')) || 3
  const win = Math.ceil(n / 2)
  return n === 1 ? ['1 – 0'] : Array.from({ length: win }, (_, i) => `${win} – ${i}`)
}

function CrowdLine({ match, refreshKey, suffix = '' }: { match: M; refreshKey?: unknown; suffix?: string }) {
  const crowd = useCrowd(match.id, refreshKey)
  const pct = crowd?.furia ?? match.crowdPick
  if (pct == null) return suffix ? <small className="muted">{suffix}</small> : null
  return (
    <small className="muted">
      {pct}% da torcida {match.live ? 'foi' : 'vai'} de FURIA{crowd ? ` (${crowd.total} ${crowd.total === 1 ? 'palpite' : 'palpites'})` : ''}. {suffix}
    </small>
  )
}

function ClosedBet({ match }: { match: M }) {
  const { palpites } = useStore()
  const p = palpites[match.id]
  return (
    <div className="card bet">
      <div className="bet__head">
        <b className="heading">Quem leva a série?</b>
        <span className="tag-closed"><Lock size={12} strokeWidth={3} /> Palpite fechado</span>
      </div>
      {p ? (
        <div className="bet__mine">
          <TeamCrest team={p.winner === 'furia' ? 'furia' : match.opponent} size={40} />
          <span>
            <span className="mono-label">Você apostou em</span>
            <b>{p.winner === 'furia' ? 'FURIA' : teamInfo(match.opponent).name} vence por {p.score}</b>
          </span>
          <span className="pts-tag pts-tag--dashed">+50 pts</span>
        </div>
      ) : (
        <p className="muted caption">Você não deu palpite nesta série.</p>
      )}
      <CrowdLine match={match} />
      <p className="note note--dashed caption muted">
        <Lock size={16} /> Os palpites fecham antes do início da série. Com a partida ao vivo, não dá mais pra alterar.
      </p>
    </div>
  )
}

function OpenBet({ match }: { match: M }) {
  const { palpites, deviceId, name } = useStore()
  const saved = palpites[match.id]
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [winner, setWinner] = useState<'furia' | 'opp'>(saved?.winner ?? 'furia')
  const [score, setScore] = useState(saved?.score ?? scoreOptions(match)[1])
  const [editing, setEditing] = useState(!saved)
  const opp = teamInfo(match.opponent)

  if (saved && !editing) {
    return (
      <div className="card bet">
        <div className="bet__head">
          <b className="heading">Palpite registrado</b>
          <span className="pts-tag pts-tag--dashed">+50 pts</span>
        </div>
        <div className="bet__mine">
          <TeamCrest team={saved.winner === 'furia' ? 'furia' : match.opponent} size={40} />
          <span>
            <span className="mono-label">Seu palpite</span>
            <b>{saved.winner === 'furia' ? 'FURIA' : opp.name} vence por {saved.score}</b>
          </span>
        </div>
        <CrowdLine match={match} refreshKey={saved} />
        {error && <small className="red">{error}</small>}
        <Button full variant="secondary" onClick={() => setEditing(true)}>Alterar palpite</Button>
      </div>
    )
  }

  return (
    <div className="card bet">
      <div className="bet__head">
        <b className="heading">Quem leva a série?</b>
        <span className="pts-tag pts-tag--dashed">+50 pts</span>
      </div>
      <div className="bet__options">
        {(['furia', 'opp'] as const).map((w) => (
          <button key={w} className={`bet__opt${winner === w ? ' bet__opt--on' : ''}`} onClick={() => setWinner(w)} aria-pressed={winner === w}>
            <TeamCrest team={w === 'furia' ? 'furia' : match.opponent} size={30} />
            {w === 'furia' ? 'FURIA' : opp.name}
          </button>
        ))}
      </div>
      <span className="mono-label muted">Placar da série</span>
      <div className="chips">
        {scoreOptions(match).map((s) => (
          <button key={s} className={`chip${score === s ? ' chip--on' : ''}`} onClick={() => setScore(s)} aria-pressed={score === s}>
            {s}
          </button>
        ))}
      </div>
      <CrowdLine match={match} suffix="Os palpites fecham no início da série." />
      <Button
        full
        disabled={sending}
        onClick={async () => {
          setSending(true)
          actions.setPalpite(match.id, { winner, score })
          setError(await savePalpiteRemote({ deviceId, matchId: match.id, winner, score, nome: name }))
          setSending(false)
          setEditing(false)
        }}
      >
        {sending ? 'Enviando…' : 'Confirmar palpite'}
      </Button>
    </div>
  )
}
