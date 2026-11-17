import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { actions } from '../store'
import { MODALITIES, PREFERRED_GAMES } from '../data'
import { Button, FanDisclaimer, ModalityGrid } from '../components'

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
      <FanDisclaimer />

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

      <ModalityGrid selected={games} onToggle={toggle} />

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
