import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, CircleHelp, Gamepad2, Lock, LogOut, Pencil } from 'lucide-react'
import { ACHIEVEMENTS, ACHIEVEMENTS_TOTAL, PREFERRED_GAMES, WAYS_TO_EARN } from '../data'
import { AchievementBadge, Button, LevelCard, Section, Sheet } from '../components'
import { actions, useStore } from '../store'

const BENEFITS = [
  { title: '20% off na loja', sub: 'Desconto aplicado direto no checkout' },
  { title: 'Acesso antecipado a drops', sub: '24h antes do público' },
  { title: 'Meet & greet com os times', sub: 'Sorteios mensais entre Panteras' },
]

export default function Profile() {
  const { name } = useStore()
  const [help, setHelp] = useState(false)
  const [all, setAll] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name ?? '')
  const nav = useNavigate()
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length

  return (
    <>
      <header className="page-header">
        <h1 className="display-xl">Perfil</h1>
        <button className="icon-btn" aria-label="Como ganhar pontos" onClick={() => setHelp(true)}>
          <CircleHelp size={20} strokeWidth={2.4} />
        </button>
      </header>
      <p className="caption muted profile-hello">Olá, {name}!</p>

      <Section title="Meu nível">
        <LevelCard />
      </Section>

      <Section title="Benefícios ativos">
        <div className="stack">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card benefit">
              <span className="benefit__ok">✓</span>
              <span>
                <b className="body-bold">{b.title}</b>
                <small className="muted">{b.sub}</small>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Conquistas" id="conquistas">
        <div className="ach-grid">
          {(all ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)).map((a) => (
            <AchievementBadge key={a.id} a={a} />
          ))}
        </div>
        <div className="row-between">
          <span className="progress"><span style={{ width: `${(12 / ACHIEVEMENTS_TOTAL) * 100}%` }} /></span>
          <b className="mono-m">12/{ACHIEVEMENTS_TOTAL}</b>
        </div>
        <Button full variant="secondary" onClick={() => setAll(!all)}>{all ? 'Ver menos' : 'Ver mais'}</Button>
        <small className="muted">{unlocked} desbloqueadas aqui no protótipo.</small>
      </Section>

      <Section title="Configurações">
        <div className="card settings">
          <button className="settings__row" onClick={() => setEditing(true)}>
            <Pencil size={20} />
            <span><b className="body-bold">Nome</b><small className="muted">{name}</small></span>
            <ChevronRight size={18} />
          </button>
          <div className="settings__row">
            <Gamepad2 size={20} />
            <span><b className="body-bold">Modalidades favoritas</b><small className="muted">{PREFERRED_GAMES.join(' · ')}</small></span>
            <Lock size={16} className="muted" />
          </div>
          <div className="settings__row">
            <Bell size={20} />
            <span><b className="body-bold">Notificações</b><small className="muted">Jogos, palpites e drops</small></span>
            <ChevronRight size={18} />
          </div>
          <button
            className="settings__row"
            onClick={() => {
              actions.logout()
              nav('/bem-vindo', { replace: true })
            }}
          >
            <LogOut size={20} />
            <span><b className="body-bold">Sair</b><small className="muted">Apaga seu nome e seus dados deste navegador</small></span>
            <ChevronRight size={18} />
          </button>
        </div>
      </Section>

      <Sheet open={help} onClose={() => setHelp(false)} title="Como ganhar pontos">
        <p className="body muted">Os pontos sobem seu nível e liberam benefícios.</p>
        <div className="grid-2">
          {WAYS_TO_EARN.map((w) => (
            <div key={w.title} className="card earn">
              <div className="row-between">
                {w.img ? <img src={w.img} alt="" className="earn__img" /> : <span className="earn__img" />}
                <span className="pts-tag">{w.pts}</span>
              </div>
              <b className="body-bold">{w.title}</b>
              <small className="muted">{w.sub}</small>
            </div>
          ))}
        </div>
        <Button full onClick={() => setHelp(false)}>Entendi</Button>
      </Sheet>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Seu nome">
        <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={24} autoFocus />
        <Button
          full
          disabled={draft.trim().length < 2}
          onClick={() => {
            actions.setName(draft)
            setEditing(false)
          }}
        >
          Salvar
        </Button>
      </Sheet>
    </>
  )
}
