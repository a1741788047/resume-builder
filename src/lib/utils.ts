import { nanoid } from 'nanoid'

/** 10 位短 id，够用且不会在 URL/日志里难看 */
export function uid(): string {
  return nanoid(10)
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 'YYYY-MM' → '2023.06'，用于简历上的时间展示 */
export function formatMonth(value: string): string {
  if (!value) return ''
  const [y, m] = value.split('-')
  if (!m) return y ?? ''
  return `${y}.${m}`
}

export function dateRange(start: string, end: string, current: boolean): string {
  const left = formatMonth(start)
  const right = current ? '至今' : formatMonth(end)
  if (!left && !right) return ''
  if (!left) return right
  if (!right) return left
  return `${left} — ${right}`
}

export function todayStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

export function safeFilename(name: string, suffix: string): string {
  const base = (name || '简历').replace(/[\\/:*?"<>|]/g, '').trim() || '简历'
  return `${base}-${todayStamp()}.${suffix}`
}

export function bytesToMb(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
