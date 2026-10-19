import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-white border border-brand hover:bg-[#1d4ed8] active:bg-[#1a45c8] shadow-[0_1px_2px_rgba(16,24,40,.12)]',
  outline: 'bg-panel text-ink border border-line2 hover:bg-[#f7f6f3] active:bg-[#efeee9]',
  ghost: 'bg-transparent text-ink2 border border-transparent hover:bg-[#efeee9] hover:text-ink',
  danger: 'bg-transparent text-[#b42318] border border-transparent hover:bg-[#fef3f2]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[12.5px] gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
}

export function Button({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-[8px] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function IconButton({
  label,
  active,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-ink2 transition-colors',
        'hover:bg-[#efeee9] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35',
        active && 'bg-[#e8eefc] text-brand hover:bg-[#dfe8fb] hover:text-brand',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; title?: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-[8px] border border-line bg-[#f7f6f3] p-0.5',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title ?? opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-7 rounded-[6px] px-2.5 text-[12.5px] font-medium transition-colors',
            value === opt.value
              ? 'bg-panel text-ink shadow-[0_1px_2px_rgba(16,24,40,.10)]'
              : 'text-ink2 hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-[13px] text-ink"
    >
      <span>{label}</span>
      <span
        className={cn(
          'relative h-[20px] w-[34px] shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-[#d8d6ce]',
        )}
      >
        <span
          className={cn(
            'absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-[left]',
            checked ? 'left-[16px]' : 'left-[2px]',
          )}
        />
      </span>
    </button>
  )
}

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (next: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[12.5px] text-ink2">
        <span>{label}</span>
        <span className="font-mono text-[11.5px] tabular-nums text-ink3">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#e7e5df] accent-[#2563eb]"
      />
    </label>
  )
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = 460,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="app-modal-root fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-[#1f2023]/35"
        onClick={onClose}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className="relative z-10 max-h-[86vh] overflow-auto rounded-[14px] border border-line bg-panel shadow-[0_18px_50px_rgba(16,24,40,.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[14.5px] font-medium text-ink">{title}</h2>
            {description && <p className="mt-1 text-[12.5px] leading-relaxed text-ink2">{description}</p>}
          </div>
          <IconButton label="关闭" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  )
}

export function PanelSection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="border-b border-line px-4 py-4 last:border-b-0">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-[11.5px] font-medium tracking-wide text-ink3">{title}</h3>
        {action}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
