import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { ACHIEVEMENTS, MATCHES } from '../data'
import { useMatchData } from '../live'
import { AchievementBadge, AppHeader, Button, Carousel, Divider, EmptyState, LoadingCards, MatchCard, ResultCard, Section } from '../components'
import { useMyGames, useStore } from '../store'
import { matchStart } from '../time'

export default function Home() {
  const { name } = useStore()
  const mine = useMyGames()
  // "Ao vivo e próximos" fica com os placeholders; resultados vêm da PandaScore
  const { results: RESULTS, source, retry } = useMatchData()
  const rank = (g: string) => mine.indexOf(g as never)
  const upcoming = [...MATCHES]
    .filter((m) => mine.includes(m.game))
    .sort((a, b) => Number(!!b.live) - Number(!!a.live) || matchStart(a) - matchStart(b) || rank(a.game) - rank(b.game))
  const myResults = RESULTS.filter((r) => mine.includes(r.game))
  const today = upcoming.filter((m) => new Date(matchStart(m)).toDateString() === new Date().toDateString())
  const live = upcoming.filter((m) => m.live).length

  return (
    <>
      <AppHeader />
      <div className="greeting">
        <h1 className="display-l">Hoje é dia de FURIA!</h1>
        <p className="caption muted">
          E aí, {name} · {today.length ? `${today.length} ${today.length === 1 ? 'jogo' : 'jogos'} hoje` : 'nenhum jogo hoje'}{live ? ` · ${live} ao vivo agora` : ''}
        </p>
      </div>

      <Banners />

      <Section title="Ao vivo e próximos" link={{ to: '/agenda', label: 'Ver agenda' }}>
        {upcoming.length ? (
          <>
          <p className="placeholder-note">Jogos fictícios: a agenda oficial ainda não foi divulgada.</p>
          <Carousel>
            {upcoming.slice(0, 3).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </Carousel>
          </>
        ) : (
          <EmptyState
            art={<img src="/img/furia-logo.webp" alt="" />}
            title="Ainda não há jogos marcados"
            text="A FURIA ainda não tem partidas agendadas nas suas modalidades. Volte mais tarde: a agenda atualiza assim que os campeonatos divulgam os horários."
            actions={<Button variant="secondary" to="/agenda?aba=resultados">Ver últimos resultados</Button>}
          />
        )}
      </Section>

      <Section title="Conquistas" link={{ to: '/perfil#conquistas', label: 'Ver todas' }}>
        <div className="ach-row">
          {ACHIEVEMENTS.slice(0, 4).map((a) => (
            <AchievementBadge key={a.id} a={a} />
          ))}
        </div>
      </Section>

      <Divider />

      <Section title="Resultados" link={{ to: '/agenda?aba=resultados', label: 'Ver todos' }}>
        {source === 'loading' ? (
          <LoadingCards n={3} />
        ) : source === 'error' ? (
          <EmptyState title="Não deu pra carregar" text="Os resultados não responderam agora. Tente de novo em instantes." actions={<Button variant="secondary" onClick={retry}>Tentar de novo</Button>} />
        ) : myResults.length ? (
          <Carousel>
            {myResults.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </Carousel>
        ) : (
          <EmptyState title="Sem resultados recentes" text="Quando a FURIA jogar nas suas modalidades, os placares aparecem aqui." />
        )}
      </Section>
    </>
  )
}

function Banners() {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth
    setIdx(Math.round(el.scrollLeft / (w + 12)))
  }
  return (
    <div className="banners">
      <Carousel className="carousel--snap" innerRef={ref} onScroll={onScroll}>
        <article className="banner banner--ink">
          <img src="/img/fallen.webp" alt="FalleN erguendo o troféu" className="banner__photo" />
          <div className="banner__text">
            <h2 className="display-l">A Última Aula do Professor</h2>
            <p className="caption">2x campeão de Major. Duas décadas de CS. Reviva cada fase.</p>
            <Button variant="secondary" to="/fallen">Ver a história <ArrowRight size={16} /></Button>
          </div>
        </article>
        <article className="banner banner--yellow">
          <img src="/img/pantera-tattoo.webp" alt="" className="banner__art" />
          <div className="banner__text">
            <h2 className="display-l">Coleção Neotrad chegou</h2>
            <p className="caption">12 peças em flash. Seu nível compra 24h antes.</p>
            <Button to="/loja">Ver coleção <ArrowRight size={16} /></Button>
          </div>
        </article>
      </Carousel>
      <div className="dots" aria-hidden="true">
        {[0, 1].map((i) => (
          <span key={i} className={i === idx ? 'dot dot--on' : 'dot'} />
        ))}
      </div>
    </div>
  )
}
