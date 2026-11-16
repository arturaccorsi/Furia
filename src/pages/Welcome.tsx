import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { actions } from '../store'
import { GAME_LOGO, PREFERRED_GAMES } from '../data'
import { Button } from '../components'

export default function Welcome() {
  const [name, setName] = useState('')
  const nav = useNavigate()
  const valid = name.trim().length >= 2

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    actions.setName(name)
    nav('/', { replace: true })
  }

  return (
    <form className="welcome" onSubmit={submit}>
      <img src="/img/furia-horizontal.webp" alt="FURIA" className="welcome__logo" />
      <div className="welcome__hero">
        <img src="/img/pantera-tattoo.webp" alt="" />
      </div>
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

      <div className="card welcome__games">
        <span className="mono-label muted">Você acompanha, nesta ordem</span>
        <ol>
          {PREFERRED_GAMES.map((g, i) => (
            <li key={g}>
              <b className="mono-m">{i + 1}</b>
              <img src={GAME_LOGO[g]} alt="" />
              <span className="heading">{g}</span>
            </li>
          ))}
        </ol>
        <small className="muted">Dá pra mudar depois no Perfil.</small>
      </div>

      <div className="welcome__cta">
        <Button full disabled={!valid}>Entrar →</Button>
      </div>
    </form>
  )
}
