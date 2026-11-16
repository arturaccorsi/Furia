import { FormEvent, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button, Sheet } from '../components'
import { TIMELINE } from '../data'
import { actions } from '../store'

const KINDS = ['Adição', 'Correção', 'Vídeo ou matéria', 'Outro'] as const

const moments = TIMELINE.map((it) => `${it.date} · ${it.kind === 'marco' ? it.text : it.title}`)

/** Aceita links colados sem "https://" (ex.: youtube.com/watch?v=…). */
function normalizeUrl(v: string): string | null {
  const t = v.trim()
  if (!t) return ''
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
    return u.hostname.includes('.') ? u.href : null
  } catch {
    return null
  }
}

export default function SuggestionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]>('Adição')
  const [moment, setMoment] = useState('')
  const [text, setText] = useState('')
  const [link, setLink] = useState('')
  const [sent, setSent] = useState(false)
  const url = normalizeUrl(link)
  const linkOk = url !== null
  const valid = text.trim().length >= 10 && linkOk

  const close = () => {
    onClose()
    setTimeout(() => {
      setSent(false)
      setText('')
      setLink('')
      setMoment('')
      setKind('Adição')
    }, 200)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    actions.addSuggestion({ kind, moment, text: text.trim(), link: url ?? '', at: new Date().toISOString() })
    setSent(true)
  }

  return (
    <Sheet open={open} onClose={close} title={sent ? 'Valeu, torcedor!' : 'Ajude a contar essa história'}>
      {sent ? (
        <div className="stack suggestion-sent">
          <CheckCircle2 size={44} color="var(--green)" />
          <p className="body">
            Sua sugestão foi registrada. A equipe revisa as sugestões antes de entrar na linha do tempo.
          </p>
          <Button full onClick={close}>Fechar</Button>
        </div>
      ) : (
        <form className="stack suggestion-form" onSubmit={submit}>
          <p className="caption muted">Viu algo errado ou sente falta de um momento? Conta pra gente.</p>

          <span className="mono-label muted">O que você quer enviar?</span>
          <div className="chips">
            {KINDS.map((k) => (
              <button type="button" key={k} className={`chip${kind === k ? ' chip--on' : ''}`} onClick={() => setKind(k)} aria-pressed={kind === k}>
                {k}
              </button>
            ))}
          </div>

          <label className="field">
            <span className="mono-label muted">Sobre qual momento? (opcional)</span>
            <select className="input" value={moment} onChange={(e) => setMoment(e.target.value)}>
              <option value="">Um momento novo / não sei</option>
              {moments.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="mono-label muted">Sua sugestão</span>
            <textarea
              className="input textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder={kind === 'Correção' ? 'O que está errado e qual é a informação certa?' : 'Conte o momento, a data e por que ele é marcante.'}
            />
            <small className="muted right">{text.length}/1000</small>
          </label>

          <label className="field">
            <span className="mono-label muted">Link (opcional)</span>
            <input
              className="input"
              type="url"
              inputMode="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://youtube.com/… ou link da matéria"
              aria-invalid={!linkOk}
            />
            {!linkOk && <small className="red">Esse link não parece válido. Confira o endereço do vídeo ou da matéria.</small>}
          </label>

          <Button full disabled={!valid}>Enviar sugestão</Button>
        </form>
      )}
    </Sheet>
  )
}
