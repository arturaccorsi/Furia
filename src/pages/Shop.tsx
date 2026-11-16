import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, ShoppingBag, Trash2 } from 'lucide-react'
import { LEVEL_DISCOUNT, PRODUCTS, PRODUCT_CATEGORIES, Product as P } from '../data'
import { Button, NavHeader } from '../components'
import { actions, useStore } from '../store'
import { money } from '../time'

const levelPrice = (p: P) => p.price * (1 - LEVEL_DISCOUNT)

const categoryOf = (p: P) =>
  p.collection.includes('Neotrad') ? 'Neotrad' : p.collection.includes('Uniforme') ? 'Uniformes' : p.collection.includes('despedida') ? 'Despedida' : 'Básicos'

function CartButton() {
  const { cart } = useStore()
  return (
    <Link to="/carrinho" className="icon-btn" aria-label={`Carrinho, ${cart.length} itens`}>
      <ShoppingBag size={20} strokeWidth={2.4} />
      {cart.length > 0 && <span className="icon-btn__count">{cart.length}</span>}
    </Link>
  )
}

export function Shop() {
  const [cat, setCat] = useState('Tudo')
  const list = PRODUCTS.filter((p) => cat === 'Tudo' || categoryOf(p) === cat)
  return (
    <>
      <header className="page-header">
        <h1 className="display-xl">Loja</h1>
        <CartButton />
      </header>

      <div className="card level-strip">
        <img src="/img/pantera-nivel.webp" alt="" />
        <span>
          <b className="body-bold">Pantera · 20% off em tudo</b>
          <small className="muted">Desconto do seu nível aplicado direto no checkout</small>
        </span>
      </div>

      <article className="banner banner--ink banner--shop">
        <img src="/img/pantera-tattoo.webp" alt="" className="banner__art" />
        <div className="banner__text">
          <span className="tag-yellow">Drop novo · 12 peças</span>
          <h2 className="display-l">Coleção Neotrad</h2>
          <p className="caption">Flash de tatuagem brasileira na pele da pantera.</p>
          <Button variant="secondary" onClick={() => setCat('Neotrad')}>Ver coleção →</Button>
        </div>
      </article>

      <div className="chips chips--scroll" role="tablist">
        {PRODUCT_CATEGORIES.map((c) => (
          <button key={c} className={`chip${cat === c ? ' chip--on' : ''}`} onClick={() => setCat(c)} aria-pressed={cat === c}>
            {c}
          </button>
        ))}
      </div>
      <span className="mono-label muted">{list.length} produtos</span>

      <div className="grid-2">
        {list.map((p) => (
          <Link key={p.id} to={`/produto/${p.id}`} className="card product-card">
            <span className="product-card__img" style={{ backgroundImage: `url(${p.images[0]})` }} />
            <span className="mono-label muted">{p.collection}</span>
            <b className="heading">{p.name}</b>
            <s className="caption muted">{money(p.price)}</s>
            <b className="mono-score">{money(levelPrice(p))}</b>
          </Link>
        ))}
      </div>
    </>
  )
}

export function Product() {
  const { id } = useParams()
  const p = PRODUCTS.find((x) => x.id === id)
  const [img, setImg] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  if (!p) return <><NavHeader title="Produto" /><p className="empty">Produto não encontrado. <Link to="/loja">Voltar à loja</Link></p></>
  const price = levelPrice(p)

  return (
    <>
      <NavHeader title="Produto" right={<CartButton />} />
      <div className="gallery">
        <span className="gallery__main" style={{ backgroundImage: `url(${p.images[img]})` }}>
          <span className="gallery__count mono-label">{img + 1}/{p.images.length}</span>
        </span>
        <div className="gallery__thumbs">
          {p.images.map((src, i) => (
            <button key={i} className={`gallery__thumb${i === img ? ' gallery__thumb--on' : ''}`} style={{ backgroundImage: `url(${src})` }} onClick={() => setImg(i)} aria-label={`Foto ${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="product-info">
        <span className="mono-label muted">{p.collection}</span>
        <h1 className="display-l">{p.name}</h1>
        <div className="product-info__price">
          <b className="mono-score">{money(price)}</b>
          <s className="muted">{money(p.price)}</s>
        </div>
        <small className="muted">ou 3x de {money(price / 3)} sem juros</small>
      </div>

      <div className="card level-benefit">
        <img src="/img/pantera-nivel.webp" alt="" />
        <span>
          <span className="mono-label">Seu nível: Pantera</span>
          <b className="body-bold">20% off + frete grátis acima de R$ 250</b>
          <small>Você já está no nível máximo.</small>
        </span>
      </div>

      <div className="stack">
        <div className="row-between">
          <b className="heading">Tamanho</b>
          <span className="caption underline">Guia de medidas</span>
        </div>
        <div className="sizes">
          {p.sizes.map((s) => {
            const off = p.soldOut?.includes(s)
            return (
              <button key={s} disabled={off} className={`size${size === s ? ' size--on' : ''}${off ? ' size--off' : ''}`} onClick={() => setSize(s)}>
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div className="stack">
        <b className="heading">Sobre a peça</b>
        <p className="body">{p.description}</p>
        {['Troca grátis em até 30 dias', 'Envio para todo o Brasil'].map((t) => (
          <span key={t} className="caption check-line"><Check size={16} color="var(--green)" strokeWidth={3} /> {t}</span>
        ))}
      </div>

      <div className="buy-bar">
        <div className="row-between">
          <span>
            <span className="mono-label muted">Preço do seu nível</span>
            <s className="caption muted">{money(p.price)}</s>
          </span>
          <b className="mono-score">{money(price)}</b>
        </div>
        <Button
          full
          disabled={!size}
          onClick={() => {
            if (!size) return
            actions.addToCart({ productId: p.id, size })
            setAdded(true)
            setTimeout(() => setAdded(false), 1800)
          }}
        >
          {added ? 'Adicionado ✓' : size ? 'Adicionar ao carrinho' : 'Escolha um tamanho'}
        </Button>
      </div>
    </>
  )
}

export function Cart() {
  const { cart } = useStore()
  const nav = useNavigate()
  const items = cart.map((c, i) => ({ ...c, i, p: PRODUCTS.find((p) => p.id === c.productId)! })).filter((x) => x.p)
  const full = items.reduce((s, x) => s + x.p.price, 0)
  const total = items.reduce((s, x) => s + levelPrice(x.p), 0)
  return (
    <>
      <NavHeader title="Carrinho" />
      {items.length === 0 ? (
        <div className="empty">
          <p>Seu carrinho está vazio.</p>
          <Button to="/loja">Ir para a loja</Button>
        </div>
      ) : (
        <>
          <div className="stack">
            {items.map((x) => (
              <div key={x.i} className="card cart-row">
                <span className="cart-row__img" style={{ backgroundImage: `url(${x.p.images[0]})` }} />
                <span className="cart-row__info">
                  <b className="body-bold">{x.p.name}</b>
                  <small className="muted">Tamanho {x.size}</small>
                  <b className="mono-m">{money(levelPrice(x.p))}</b>
                </span>
                <button className="icon-btn" aria-label="Remover" onClick={() => actions.removeFromCart(x.i)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="card totals">
            <div className="row-between"><span>Subtotal</span><span>{money(full)}</span></div>
            <div className="row-between"><span>Desconto Pantera (20%)</span><span className="green">−{money(full - total)}</span></div>
            <div className="row-between"><span>Frete</span><span>{total >= 250 ? 'Grátis' : money(19.9)}</span></div>
            <div className="row-between total"><b>Total</b><b className="mono-score">{money(total + (total >= 250 ? 0 : 19.9))}</b></div>
          </div>
          <Button full onClick={() => nav('/loja')}>Finalizar na loja FURIA</Button>
          <small className="muted center">Protótipo: o checkout real abre na loja oficial, com o cupom do seu nível.</small>
        </>
      )}
    </>
  )
}
