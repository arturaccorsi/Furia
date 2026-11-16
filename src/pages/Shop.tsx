import { ArrowUpRight, Check } from 'lucide-react'
import { Button } from '../components'

export const OFFICIAL_SHOP = 'https://shop.furia.gg/'

const BENEFITS = [
  { title: '20% off em tudo', sub: 'Desconto do nível Pantera aplicado no checkout' },
  { title: 'Acesso antecipado a drops', sub: 'Compre as coleções 24h antes do público' },
  { title: 'Frete grátis acima de R$ 250', sub: 'Para todo o Brasil' },
  { title: 'Pontos a cada compra', sub: '5 pts por real gasto para subir de nível' },
]

/** Aba Loja: sem vitrine própria; apresenta a ideia dos benefícios e leva à loja oficial. */
export function Shop() {
  return (
    <>
      <header className="page-header">
        <h1 className="display-xl">Loja</h1>
      </header>

      <article className="banner banner--ink support-hero">
        <img src="/img/camiseta-2.webp" alt="Torcedor com a camisa da FURIA" className="support-hero__photo" />
        <div className="banner__text">
          <span className="tag-yellow">Apoie a FURIA</span>
          <h2 className="display-l">Vista o manto da pantera</h2>
          <p className="caption">Cada camisa, moletom e boné ajuda a manter os times da FURIA no topo.</p>
        </div>
      </article>

      <Button full href={OFFICIAL_SHOP}>
        Ver loja oficial <ArrowUpRight size={18} strokeWidth={2.6} />
      </Button>

      <section className="section">
        <div className="row-between">
          <h2 className="ribbon">No futuro, com o seu nível</h2>
        </div>
        <p className="placeholder-note">Benefícios fictícios: uma ideia de como o nível do app poderia valer na loja. Hoje a loja oficial não aplica nenhum deles.</p>
        <div className="card support-level">
          <img src="/img/pantera-nivel.webp" alt="" />
          <span>
            <span className="mono-label muted">Seu nível</span>
            <b className="display-m">Pantera</b>
          </span>
          <span className="tag-fict">Fictício</span>
        </div>
        <div className="stack">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card benefit benefit--fict">
              <span className="benefit__ok"><Check size={16} strokeWidth={3.2} /></span>
              <span>
                <b className="body-bold">{b.title}</b>
                <small className="muted">{b.sub}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <article className="banner banner--yellow support-drop">
        <img src="/img/pantera-tattoo.webp" alt="" className="banner__art" />
        <div className="banner__text">
          <span className="tag-ink">Coleção Neotrad</span>
          <h2 className="display-l">Flash de tatuagem na pele da pantera</h2>
          <Button href={OFFICIAL_SHOP}>Ver na loja oficial ↗</Button>
        </div>
      </article>

      <small className="muted center">Você vai sair do app: a compra acontece no site oficial da FURIA, com os preços normais.</small>
    </>
  )
}
