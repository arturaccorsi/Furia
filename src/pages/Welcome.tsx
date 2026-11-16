import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { actions } from '../store'
import { MODALITIES, PREFERRED_GAMES } from '../data'
import { Button } from '../components'

export default function Welcome() {
  const [name, setName] = useState('')
  const [games, setGames] = useState<string[]>([...PREFERRED_GAMES])
  const nav = useNavigate()
  const valid = name.trim().length >= 2 && games.length > 0

  const toggle = (id: string) => setGames((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    actions.setName(name)
    actions.setGames(games)
    nav('/', { replace: true })
  }

  return (
    <form className="welcome" onSubmit={submit}>
      <img src="/img/furia-horizontal.webp" alt="FURIA" className="welcome__logo" />
      <h1 className="display-xl">Bem-vindo, torcedor!</h1>
      <p className="muted">Acompanhe a FURIA, dê palpites e suba de nível. É de graça.</p>

      <label className="field">
        <span className="mono-label muted">Como a gente te chama?</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome ou apelido"
          maxLength={24}
          autoFocus
          autoComplete="nickname"
        />
      </label>

      <div className="stack">
        <h2 className="display-l">Quais times da FURIA você acompanha?</h2>
        <p className="caption muted">A gente monta sua agenda e só te avisa do que importa. Dá pra mudar depois no Perfil.</p>
      </div>

      <div className="grid-2 modalities">
        {MODALITIES.map((m) => {
          const on = games.includes(m.id)
          return (
            <button type="button" key={m.id} className={`card modality${on ? ' modality--on' : ''}`} onClick={() => toggle(m.id)} aria-pressed={on}>
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

      <div className="welcome__cta">
        <span>
          <span className="mono-label muted">Selecionadas</span>
          <b className="mono-m">{games.length} de {MODALITIES.length}</b>
        </span>
        <Button disabled={!valid}>Entrar →</Button>
      </div>
    </form>
  )
}
