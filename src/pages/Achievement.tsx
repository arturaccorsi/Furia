import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ACHIEVEMENTS } from '../data'
import { Button } from '../components'
import { useStore } from '../store'

export default function Achievement() {
  const { id } = useParams()
  const a = ACHIEVEMENTS.find((x) => x.id === id) ?? ACHIEVEMENTS[0]
  const { name } = useStore()
  const nav = useNavigate()
  const [msg, setMsg] = useState<string | null>(null)
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  const share = async () => {
    const text = `Desbloqueei a conquista “${a.name}” no app da FURIA!`
    try {
      if (navigator.share) await navigator.share({ title: 'FURIA', text, url: location.href })
      else {
        await navigator.clipboard.writeText(`${text} ${location.href}`)
        setMsg('Link copiado!')
      }
    } catch {
      // compartilhamento cancelado
    }
  }

  return (
    <div className="unlock">
      <div className="unlock__top">
        <button className="icon-btn" aria-label="Fechar" onClick={() => nav(-1)}>
          <X size={22} strokeWidth={2.6} />
        </button>
      </div>
      <article className={`card unlock__card${a.unlocked ? '' : ' unlock__card--locked'}`}>
        <span className="sticker sticker--static">{a.unlocked ? 'Conquista desbloqueada!' : 'Conquista bloqueada'}</span>
        <span className="unlock__medal">
          <img src={a.img} alt="" />
        </span>
        <h1 className="display-xl">{a.name}</h1>
        <p className="body">{a.how}</p>
        <div className="row-center">
          <span className="tag-red">+{a.points} pts</span>
          {a.limited && <span className="tag-cream">Edição limitada</span>}
        </div>
        {a.unlocked && <span className="mono-label bone">{name} · Torcedor FURIA · {date}</span>}
      </article>
      <div className="unlock__actions">
        {a.unlocked ? <Button full onClick={share}>Compartilhar no story</Button> : null}
        <Button full variant="secondary" to="/perfil#conquistas">Ver coleção</Button>
        {msg && <small className="center">{msg}</small>}
      </div>
    </div>
  )
}
