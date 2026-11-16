import { ReactNode, RefObject, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Bell, Check, CalendarDays, ChevronLeft, Play, ShoppingBag, User, X } from 'lucide-react'
import { Achievement, GAME_LOGO, MODALITIES, Game, Match, Media, Result, TEAMS, TeamId } from './data'
import { countdown, fmtDay, fmtTime, matchStart, useNow } from './time'
import { actions, useStore } from './store'

/** Chama de "ao vivo" (arte enviada pelo time de design). */
export function LiveFlame({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d="M8 0.8C8 0.8 13 5 13 9.8C13 12.9 10.8 15.2 8 15.2C5.2 15.2 3 12.9 3 9.8C3 7.6 4.1 5.9 5.3 4.8C5.4 6.4 6.1 7.4 7 7.8C6.7 5.4 7.1 2.9 8 0.8ZM8 9.2C9.3 10.3 10.1 11.5 10.1 12.5C10.1 13.8 9.2 14.6 8 14.6C6.8 14.6 5.9 13.8 5.9 12.5C5.9 11.4 6.7 10.3 8 9.2Z"
      />
    </svg>
  )
}

export function AppHeader() {
  return (
    <header className="app-header">
      <Link to="/" aria-label="FURIA, início">
        <img src="/img/furia-horizontal.webp" alt="FURIA" className="app-header__logo" />
      </Link>
      <div className="app-header__actions">
        <Link to="/perfil" className="level-pill">
          <img src="/img/pantera-nivel.webp" alt="" />
          <span>Nível 4/4</span>
        </Link>
        <button className="icon-btn" aria-label="Notificações, 3 novas">
          <Bell size={20} strokeWidth={2.4} />
          <span className="icon-btn__count">3</span>
        </button>
      </div>
    </header>
  )
}

export function NavHeader({ title, right }: { title: string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="nav-header">
      <button className="icon-btn" aria-label="Voltar" onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}>
        <ChevronLeft size={22} strokeWidth={2.6} />
      </button>
      <h1 className="nav-header__title">{title}</h1>
      <div className="nav-header__right">{right}</div>
    </header>
  )
}

export function SectionHeader({ title, link }: { title: string; link?: { to: string; label: string } }) {
  return (
    <div className="section-header">
      <h2 className="ribbon">{title}</h2>
      {link && (
        <Link to={link.to} className="section-header__link">
          {link.label} <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      )}
    </div>
  )
}

export function Section({ title, link, children, id }: { title: string; link?: { to: string; label: string }; children: ReactNode; id?: string }) {
  return (
    <section className="section" id={id}>
      <SectionHeader title={title} link={link} />
      {children}
    </section>
  )
}

type BtnProps = { children: ReactNode; variant?: 'primary' | 'secondary' | 'red'; to?: string; href?: string; onClick?: () => void; full?: boolean; disabled?: boolean }
export function Button({ children, variant = 'primary', to, href, onClick, full, disabled }: BtnProps) {
  const cls = `btn btn--${variant}${full ? ' btn--full' : ''}`
  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{children}</a>
  return <button className={cls} onClick={onClick} disabled={disabled}>{children}</button>
}

export function TeamCrest({ team, size = 64 }: { team: TeamId; size?: number }) {
  const t = TEAMS[team]
  return (
    <span className="crest" style={{ width: size, height: size }}>
      {t.logo ? <img src={t.logo} alt="" /> : <span className="crest__initials" style={{ fontSize: size * 0.28 }}>{t.name.slice(0, 2).toUpperCase()}</span>}
    </span>
  )
}

export function TeamLogo({ team, size = 24 }: { team: TeamId; size?: number }) {
  const t = TEAMS[team]
  return t.logo ? (
    <img src={t.logo} alt={t.name} style={{ width: size, height: size, objectFit: 'contain' }} />
  ) : (
    <span className="mini-initials" style={{ width: size, height: size }}>{t.name.slice(0, 2).toUpperCase()}</span>
  )
}

export function GameLogo({ game, size = 18 }: { game: Game; size?: number }) {
  return <img src={GAME_LOGO[game]} alt="" className="game-logo" style={{ width: size, height: size }} />
}

export function LiveTag() {
  return (
    <span className="tag-live">
      <LiveFlame size={13} color="#fff" /> Ao vivo
    </span>
  )
}

export function Countdown({ target }: { target: number }) {
  const now = useNow()
  return (
    <div className="timer">
      {countdown(target, now).map(([n, u]) => (
        <span key={u} className="timer__unit">
          <b>{n}</b>
          <small>{u}</small>
        </span>
      ))}
    </div>
  )
}

export function MatchCard({ match }: { match: Match }) {
  const { reminders } = useStore()
  const start = matchStart(match)
  const isToday = new Date(start).toDateString() === new Date().toDateString()
  const opp = TEAMS[match.opponent]
  return (
    <article className="card match-card">
      {match.live ? <LiveTag /> : isToday ? <span className="sticker">Hoje!</span> : null}
      <div className="match-card__meta">
        <b>{match.game}</b>
        <span>· {match.event}</span>
      </div>
      <div className="match-card__teams">
        <div className="team">
          <TeamCrest team="furia" />
          <span>FURIA</span>
        </div>
        <div className="match-card__mid">
          {match.live ? <b className="mono-m">{match.live.series[0]} : {match.live.series[1]}</b> : <b className="vs">vs</b>}
          <small>{match.live ? `Série · ${match.format}` : match.format}</small>
        </div>
        <div className="team">
          <TeamCrest team={match.opponent} />
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
            <small>{fmtDay(start)} · {fmtTime(start)} · começa em</small>
            <Countdown target={start} />
          </>
        )}
      </div>
      <div className="match-card__actions">
        {match.live ? (
          <>
            <Button variant="secondary" to={`/partida/${match.id}`}>Ver detalhes</Button>
            <Button href={match.stream}>Assistir</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => actions.toggleReminder(match.id)}>
              {reminders.includes(match.id) ? 'Lembrete ✓' : 'Lembrar'}
            </Button>
            <Button to={`/partida/${match.id}`}>Dar palpite</Button>
          </>
        )}
      </div>
    </article>
  )
}
export function ResultCard({ result }: { result: Result }) {
  const win = result.score[0] > result.score[1]
  return (
    <article className="card result-card">
      <div className="result-card__top">
        <span className="mono-label muted">{result.game}</span>
        <span className={`badge ${win ? 'badge--win' : 'badge--loss'}`}>{win ? 'V' : 'D'}</span>
      </div>
      <div className="result-card__logos">
        <TeamLogo team="furia" />
        <small>vs</small>
        <TeamLogo team={result.opponent} />
      </div>
      <b className="heading">vs {TEAMS[result.opponent].name}</b>
      <b className="mono-score">{result.score[0]} : {result.score[1]}</b>
      <small className="muted">{result.event}</small>
    </article>
  )
}

export function Medallion({ img, size = 48, fill = 'white', children }: { img?: string; size?: number; fill?: string; children?: ReactNode }) {
  return (
    <span className="medallion" style={{ width: size, height: size, background: `var(--${fill})` }}>
      {img ? <img src={img} alt="" /> : children}
    </span>
  )
}

export function AchievementBadge({ a }: { a: Achievement }) {
  return (
    <Link to={`/conquista/${a.id}`} className="ach">
      <span className={`ach__medal${a.unlocked ? '' : ' ach__medal--locked'}`}>
        {a.unlocked ? <img src={a.img} alt="" /> : <span>?</span>}
      </span>
      <span className={a.unlocked ? '' : 'muted'}>{a.unlocked ? a.name : 'Bloqueada'}</span>
    </Link>
  )
}

export function MediaCard({ m, wide }: { m: Media; wide?: boolean }) {
  return (
    <a href={m.url} target="_blank" rel="noreferrer" className={`card media-card${wide ? ' media-card--wide' : ''}`}>
      <span className={`media-card__thumb${m.thumb ? '' : ' media-card__thumb--blank'}`} style={m.thumb ? { backgroundImage: `url(${m.thumb})` } : undefined}>
        <span className={`media-card__pill media-card__pill--${m.kind}`}>
          {m.kind === 'video' ? <Play size={14} fill="currentColor" /> : <ArrowUpRight size={16} strokeWidth={2.6} />}
        </span>
      </span>
      <span className="mono-label red">{m.meta}</span>
      <b className="media-card__title">{m.title}</b>
      {m.sub && <small className="muted">{m.sub}</small>}
    </a>
  )
}

/**
 * Arrastar com o mouse (no celular o toque já rola nativamente).
 * Depois de arrastar, o clique é cancelado para não abrir o card sem querer.
 */
export function useDragScroll(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let startX = 0
    let startLeft = 0
    let dragging = false
    let moved = false
    let snap = ''

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      dragging = true
      moved = false
      startX = e.clientX
      startLeft = el.scrollLeft
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      if (!moved && Math.abs(dx) > 4) {
        moved = true
        snap = el.style.scrollSnapType
        el.style.scrollSnapType = 'none'
        el.style.scrollBehavior = 'auto'
        el.classList.add('carousel--dragging')
      }
      if (moved) el.scrollLeft = startLeft - dx
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      if (!moved) return
      el.classList.remove('carousel--dragging')
      el.style.scrollSnapType = snap
      el.style.scrollBehavior = ''
      // reencaixa no card mais próximo quando o carrossel usa snap
      const first = el.firstElementChild as HTMLElement | null
      if (first && getComputedStyle(el).scrollSnapType !== 'none') {
        const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0')
        el.scrollTo({ left: Math.round(el.scrollLeft / step) * step, behavior: 'smooth' })
      }
    }
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    const noDrag = (e: DragEvent) => e.preventDefault()

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('click', click, true)
    el.addEventListener('dragstart', noDrag)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('click', click, true)
      el.removeEventListener('dragstart', noDrag)
    }
  }, [ref])
}

export function Carousel({ children, className = '', onScroll, innerRef }: { children: ReactNode; className?: string; onScroll?: () => void; innerRef?: RefObject<HTMLDivElement> }) {
  const own = useRef<HTMLDivElement>(null)
  const ref = innerRef ?? own
  useDragScroll(ref)
  return (
    <div className={`carousel ${className}`} ref={ref} onScroll={onScroll}>
      {children}
    </div>
  )
}

export function TabBar() {
  const tabs = [
    { to: '/', label: 'Jogos', Icon: CalendarDays, end: true },
    { to: '/loja', label: 'Loja', Icon: ShoppingBag },
    { to: '/perfil', label: 'Perfil', Icon: User },
  ]
  return (
    <nav className="tabbar" aria-label="Navegação principal">
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab${isActive ? ' tab--active' : ''}`}>
          <span className="tab__icon">
            <Icon size={22} strokeWidth={2.2} />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="sheet__handle" />
        <div className="sheet__head">
          <h2 className="display-l">{title}</h2>
          <button className="icon-btn" aria-label="Fechar" onClick={onClose}>
            <X size={20} strokeWidth={2.6} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function LevelCard() {
  return (
    <div className="card level-card">
      <Medallion img="/img/pantera-nivel.webp" size={72} fill="yellow" />
      <div className="level-card__text">
        <span className="mono-label muted">Nível 4 de 4</span>
        <b className="display-m">Pantera</b>
        <span className="progress"><span style={{ width: '100%' }} /></span>
        <small className="muted">1.240 pts · nível máximo</small>
      </div>
    </div>
  )
}

export function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span />
      <img src="/img/olho.webp" alt="" />
      <span />
    </div>
  )
}

/** Grade de modalidades do onboarding (também usada no Perfil). */
export function ModalityGrid({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="grid-2 modalities">
      {MODALITIES.map((m) => {
        const on = selected.includes(m.id)
        return (
          <button type="button" key={m.id} className={`card modality${on ? ' modality--on' : ''}`} onClick={() => onToggle(m.id)} aria-pressed={on}>
            <span className="modality__top">
              <span className="modality__logo"><img src={m.logo} alt="" /></span>
              <span className="modality__check">{on && <Check size={15} strokeWidth={3.5} />}</span>
            </span>
            <b className="heading">{m.name}</b>
            <small className={on ? '' : 'muted'}>{m.genre}</small>
          </button>
        )
      })}
    </div>
  )
}
