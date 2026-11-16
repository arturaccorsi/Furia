import { useEffect, useState } from 'react'

/** Momento em que a página abriu: os horários de demonstração partem daqui. */
export const OPENED_AT = Date.now()

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export function matchStart(m: { startsIn?: number; at?: { day: number; time: string } }) {
  if (m.at) {
    const d = new Date(OPENED_AT)
    const [h, min] = m.at.time.split(':').map(Number)
    d.setDate(d.getDate() + m.at.day)
    d.setHours(h, min, 0, 0)
    return d.getTime()
  }
  const t = OPENED_AT + (m.startsIn ?? 0) * 60_000
  // jogos futuros caem em horário "redondo" (próxima meia hora)
  return (m.startsIn ?? 0) > 0 ? Math.ceil(t / 1_800_000) * 1_800_000 : t
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Divide a diferença até `target` nas três maiores unidades úteis. */
export function countdown(target: number, now: number): [string, string][] {
  let s = Math.max(0, Math.floor((target - now) / 1000))
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  return d > 0
    ? [[String(d), 'd'], [pad(h), 'h'], [pad(m), 'min']]
    : [[pad(h), 'h'], [pad(m), 'min'], [pad(s), 's']]
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export const fmtTime = (t: number) => {
  const d = new Date(t)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fmtDay(t: number) {
  const d = new Date(t)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  const base = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
  if (same(d, today)) return `Hoje · ${base}`
  if (same(d, tomorrow)) return `Amanhã · ${base}`
  return base.charAt(0).toUpperCase() + base.slice(1)
}

export const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
