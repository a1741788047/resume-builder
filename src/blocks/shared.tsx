import type { ReactNode } from 'react'

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h2 className="rsec-title">
      {icon ? <span className="rsec-icon">{icon}</span> : null}
      <span>{children}</span>
    </h2>
  )
}

export function Prose({ text }: { text: string }) {
  const paragraphs = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (paragraphs.length === 0) return null
  return (
    <div className="rprose">
      {paragraphs.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  )
}

export function Bullets({ items }: { items: string[] }) {
  const clean = items.map((s) => s.trim()).filter(Boolean)
  if (clean.length === 0) return null
  return (
    <ul className="rbullets">
      {clean.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  )
}

export function ItemHead({
  title,
  sub,
  meta,
  right,
}: {
  title: string
  sub?: string
  meta?: string
  right?: string
}) {
  return (
    <div className="ritem-head">
      <div className="ritem-lead">
        <span className="ritem-title">{title}</span>
        {sub ? <span className="ritem-sub">{sub}</span> : null}
        {meta ? <span className="ritem-meta">{meta}</span> : null}
      </div>
      {right ? <span className="ritem-date">{right}</span> : null}
    </div>
  )
}
