import { useSyncExternalStore } from 'react'
import { Game, PREFERRED_GAMES } from './data'

// Estado do torcedor guardado só neste navegador (sem login real por enquanto).

export type CartItem = { productId: string; size: string }
export type Palpite = { winner: 'furia' | 'opp'; score: string }

type State = {
  name: string | null
  /** modalidades marcadas no onboarding */
  games: string[]
  cart: CartItem[]
  palpites: Record<string, Palpite>
  reminders: string[]
  checkins: string[]
}

const KEY = 'furia-torcida:v1'
const empty: State = { name: null, games: ['CS2', 'LoL', 'Valorant'], cart: [], palpites: {}, reminders: [], checkins: [] }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
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
  logout: () => set({ ...empty }),
  addToCart: (item: CartItem) => set({ cart: [...state.cart, item] }),
  removeFromCart: (index: number) => set({ cart: state.cart.filter((_, i) => i !== index) }),
  setPalpite: (matchId: string, p: Palpite) => set({ palpites: { ...state.palpites, [matchId]: p } }),
  toggleReminder: (matchId: string) =>
    set({
      reminders: state.reminders.includes(matchId)
        ? state.reminders.filter((m) => m !== matchId)
        : [...state.reminders, matchId],
    }),
  checkin: (matchId: string) => set({ checkins: [...new Set([...state.checkins, matchId])] }),
}

/** Modalidades com jogos no app, na ordem de preferência, filtradas pelo que o torcedor marcou. */
export function useMyGames(): Game[] {
  const { games } = useStore()
  const mine = PREFERRED_GAMES.filter((g) => games.includes(g))
  return mine.length ? mine : PREFERRED_GAMES
}
