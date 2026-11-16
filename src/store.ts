import { useSyncExternalStore } from 'react'
import { Game, PREFERRED_GAMES } from './data'

// Estado do torcedor guardado só neste navegador (sem login real por enquanto).

export type CartItem = { productId: string; size: string }
export type Palpite = { winner: 'furia' | 'opp'; score: string }
export type Suggestion = { kind: string; moment: string; text: string; link: string; at: string }

type State = {
  name: string | null
  /** id aleatório deste navegador, usado para salvar palpites sem login */
  deviceId: string
  /** modalidades marcadas no onboarding */
  games: string[]
  cart: CartItem[]
  palpites: Record<string, Palpite>
  reminders: string[]
  checkins: string[]
  /** sugestões para a história do FalleN (sem backend ainda: ficam só aqui) */
  suggestions: Suggestion[]
}

const KEY = 'furia-torcida:v1'
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(16)}-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`)
const empty: State = { name: null, deviceId: '', games: ['CS2', 'LoL', 'Valorant'], cart: [], palpites: {}, reminders: [], checkins: [], suggestions: [] }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    const st: State = raw ? { ...empty, ...JSON.parse(raw) } : { ...empty }
    return st.deviceId ? st : { ...st, deviceId: newId() }
  } catch {
    return { ...empty, deviceId: newId() }
  }
}

let state = load()
const listeners = new Set<() => void>()

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // sem storage (aba anônima): segue só em memória
  }
  listeners.forEach((l) => l())
}

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export const actions = {
  setName: (name: string) => set({ name: name.trim() }),
  setGames: (games: string[]) => set({ games }),
  logout: () => set({ ...empty, deviceId: newId() }),
  addToCart: (item: CartItem) => set({ cart: [...state.cart, item] }),
  removeFromCart: (index: number) => set({ cart: state.cart.filter((_, i) => i !== index) }),
  setPalpite: (matchId: string, p: Palpite) => set({ palpites: { ...state.palpites, [matchId]: p } }),
  toggleReminder: (matchId: string) =>
    set({
      reminders: state.reminders.includes(matchId)
        ? state.reminders.filter((m) => m !== matchId)
        : [...state.reminders, matchId],
    }),
  addSuggestion: (s: Suggestion) => set({ suggestions: [...state.suggestions, s] }),
  checkin: (matchId: string) => set({ checkins: [...new Set([...state.checkins, matchId])] }),
}

/** Modalidades com jogos no app, na ordem de preferência, filtradas pelo que o torcedor marcou. */
export function useMyGames(): Game[] {
  const { games } = useStore()
  const mine = PREFERRED_GAMES.filter((g) => games.includes(g))
  return mine.length ? mine : PREFERRED_GAMES
}
