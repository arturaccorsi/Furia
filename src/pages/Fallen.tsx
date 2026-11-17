import { useState } from 'react'
import { Flag, MessageSquarePlus } from 'lucide-react'
import { RETIREMENT_DATE, STORY_MEDIA, TIMELINE } from '../data'
import { Button, Carousel, Medallion, MediaCard, NavHeader, Section } from '../components'
import { useNow } from '../time'
import SuggestionSheet from './SuggestionSheet'

export default function Fallen() {
  const now = useNow(60_000)
  const [suggest, setSuggest] = useState(false)
  const left = Math.max(0, RETIREMENT_DATE.getTime() - now)
  // dias que faltam, contando o dia de hoje (atualiza sozinho a cada minuto)
  const days = Math.ceil(left / 86_400_000)

  return (
    <>
      <NavHeader title="FalleN" />

      <section className="card fallen-hero">
        <h1 className="display-xl">A Última Aula do Professor</h1>
        <b className="body-bold">Gabriel “FalleN” Toledo</b>
        <p className="caption">Reviva a carreira que ensinou o Brasil a jogar.</p>
        <div className="fallen-hero__count">
          <span><b className="mono-2xl">{days}</b> <span className="display-l">{days === 1 ? 'dia' : 'dias'}</span></span>
          <span className="mono-label">para o Professor se aposentar</span>
        </div>
        <div className="fallen-hero__stats">
          {[
            ['20', 'anos de carreira'],
            ['2', 'Majors vencidos'],
            ['2379', 'partidas oficiais'],
          ].map(([n, l]) => (
            <span key={l}>
              <b className="mono-score">{n}</b>
              <small>{l}</small>
            </span>
          ))}
        </div>
        <img src="/img/fallen.webp" alt="FalleN com o troféu" className="fallen-hero__photo" />
      </section>

      <Section title="Conquista exclusiva">
        <div className="card exclusive">
          <div className="exclusive__row">
            <Medallion img="/img/despedida.webp" size={84} />
            <div>
              <span className="tag-ink">Edição limitada</span>
              <b className="display-m">A despedida</b>
              <small>Assista à partida de despedida ao vivo pra desbloquear. Nunca mais volta.</small>
            </div>
          </div>
          <Button full to="/partida/major-singapura-final">Ver a partida de despedida</Button>
        </div>
      </Section>

      <Section title="Conheça a história">
        <Carousel>
          {STORY_MEDIA.map((m) => (
            <MediaCard key={m.url} m={m} wide />
          ))}
        </Carousel>
      </Section>

      <Section title="Linha do tempo">
        <ol className="timeline">
          {TIMELINE.map((it, i) =>
            it.kind === 'marco' ? (
              <li key={i} className="tl tl--marco">
                <span className="tl__rail"><span className="tl__dot" /></span>
                <span className="tl__marco">
                  <b className="mono-label red">{it.date}</b>
                  <span className="caption">{it.text}</span>
                </span>
              </li>
            ) : (
              <li key={i} className={`tl tl--${it.kind}`}>
                <span className="tl__rail">
                  <Medallion img={it.art || undefined} size={48} fill={it.kind === 'atual' ? 'yellow' : 'white'}>
                    <Flag size={22} />
                  </Medallion>
                </span>
                <div className="tl__body">
                  <div className="card tl__card">
                    {it.kind === 'atual' && <span className="tag-here"><i /> Estamos aqui</span>}
                    <b className={`mono-label ${it.kind === 'atual' ? 'yellow' : 'red'}`}>{it.date}</b>
                    <b className="display-m">{it.title}</b>
                    <small>{it.body}</small>
                  </div>
                  {it.media && (
                    <Carousel className="tl__media">
                      {it.media.map((m) => (
                        <MediaCard key={m.url} m={m} />
                      ))}
                    </Carousel>
                  )}
                </div>
              </li>
            ),
          )}
        </ol>
        <div className="card suggest-cta">
          <b className="heading">Faltou algum momento?</b>
          <small className="muted">Sugira uma correção ou adição à história, com vídeo ou matéria se tiver.</small>
          <Button full variant="secondary" onClick={() => setSuggest(true)}>
            <MessageSquarePlus size={18} /> Sugerir correção ou adição
          </Button>
        </div>
      </Section>
      <SuggestionSheet open={suggest} onClose={() => setSuggest(false)} />
    </>
  )
}
