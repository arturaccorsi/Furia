import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Lock, MapPin } from 'lucide-react'
import { MATCHES, Match as M, TEAMS } from '../data'
import { Button, Countdown, LiveFlame, LiveTag, NavHeader, Section, TeamCrest } from '../components'
import { actions, useStore } from '../store'
import { fmtDay, fmtTime, matchStart } from '../time'

export default function Match() {
  const { id } = useParams()
  const match = MATCHES.find((m) => m.id === id)
  if (!match) {
    return (
      <>
        <NavHeader title="Partida" />
        <p className="empty">Partida não encontrada. <Link to="/agenda">Ver agenda</Link></p>
      </>
    )
  }
  const start = matchStart(match)
  const opp = TEAMS[match.opponent]
  return (
    <>
      <NavHeader title="Partida" />
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
              <small>Mapa {match.live.mapNumber} · {match.live.map} · em andamento</small>
              <b className="score-xl">{match.live.score[0]} : {match.live.score[1]}</b>
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
        {match.maps ? (
          <div className="stack">
            {match.maps.map((m, i) => (
              <div key={m.name} className={`card map-row${m.state === 'live' ? ' map-row--live' : ''}`}>
                <span className={`map-row__result map-row__result--${m.state}`}>
                  {m.state === 'win' ? 'V' : m.state === 'loss' ? 'D' : <LiveFlame size={16} color="#fff" />}
                </span>
                <span className="map-row__info">
                  <b className="heading">{m.name}</b>
                  <small className="muted">Mapa {i + 1} · {m.state === 'live' ? `Ao vivo · rodada ${match.live?.round}` : m.pick}</small>
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

const scoreOptions = (m: M) => (m.format === 'MD5' ? ['3 – 0', '3 – 1', '3 – 2'] : ['2 – 0', '2 – 1'])

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
            <b>{p.winner === 'furia' ? 'FURIA' : TEAMS[match.opponent].name} vence por {p.score}</b>
          </span>
          <span className="pts-tag pts-tag--dashed">+50 pts</span>
        </div>
      ) : (
        <p className="muted caption">Você não deu palpite nesta série.</p>
      )}
      <small className="muted">{match.crowdPick}% da torcida foi de FURIA.</small>
      <p className="note note--dashed caption muted">
        <Lock size={16} /> Os palpites fecham antes do início da série. Com a partida ao vivo, não dá mais pra alterar.
      </p>
    </div>
  )
}

function OpenBet({ match }: { match: M }) {
  const { palpites } = useStore()
  const saved = palpites[match.id]
  const [winner, setWinner] = useState<'furia' | 'opp'>(saved?.winner ?? 'furia')
  const [score, setScore] = useState(saved?.score ?? scoreOptions(match)[1])
  const [editing, setEditing] = useState(!saved)
  const opp = TEAMS[match.opponent]

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
      <small className="muted">{match.crowdPick}% da torcida vai de FURIA. Os palpites fecham no início da série.</small>
      <Button
        full
        onClick={() => {
          actions.setPalpite(match.id, { winner, score })
          setEditing(false)
        }}
      >
        Confirmar palpite
      </Button>
    </div>
  )
}
