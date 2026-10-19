import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { IconButton } from './ui'

const inputBase =
  'w-full rounded-[7px] border border-line2 bg-panel px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink3 ' +
  'transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15'

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-[12px] text-ink2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] leading-relaxed text-ink3">{hint}</span>}
    </label>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'month'
  hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      />
    </Field>
  )
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  rows?: number
  hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, 'resize-y leading-relaxed')}
      />
    </Field>
  )
}

/** 一行一条 ⇄ string[]，简历场景里这比逐条加输入框快得多 */
export function LinesField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  rows?: number
  hint?: string
  placeholder?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value.join('\n')}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value.split('\n').map((line) => line.replace(/^\s*[-·•]\s*/, '')))
        }
        className={cn(inputBase, 'resize-y leading-relaxed')}
      />
    </Field>
  )
}

/** 逗号 / 顿号分隔 ⇄ string[] */
export function ChipsField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        value={value.join('，')}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(/[,，、]/)
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className={inputBase}
      />
    </Field>
  )
}

export function SubCard({
  title,
  index,
  total,
  onRemove,
  onMove,
  children,
}: {
  title: string
  index: number
  total: number
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  children: ReactNode
}) {
  return (
    <div className="rounded-[10px] border border-line bg-[#fbfaf8]">
      <div className="flex items-center gap-1 border-b border-line px-2.5 py-1.5">
        <span className="mr-auto truncate text-[12px] font-medium text-ink2">
          {index + 1}. {title || '未命名条目'}
        </span>
        <IconButton label="上移" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp size={13} />
        </IconButton>
        <IconButton label="下移" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ArrowDown size={13} />
        </IconButton>
        <IconButton label="删除这一条" onClick={onRemove} className="hover:text-[#b42318]">
          <Trash2 size={13} />
        </IconButton>
      </div>
      <div className="space-y-2.5 p-2.5">{children}</div>
    </div>
  )
}

export function AddRowButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-line2 py-2',
        'text-[12.5px] text-ink2 transition-colors hover:border-brand/45 hover:bg-[#f5f8ff] hover:text-brand',
        'disabled:pointer-events-none disabled:opacity-40',
      )}
    >
      <Plus size={13} />
      {children}
    </button>
  )
}

export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}
