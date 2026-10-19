import type { CSSProperties, ReactNode } from 'react'
import { useResumeStore } from '../../store/useResumeStore'

export function PageFrame({ children }: { children: ReactNode }) {
  const theme = useResumeStore((s) => s.doc.theme)
  const layout = useResumeStore((s) => s.doc.layout)
  const zoom = useResumeStore((s) => s.zoom)

  const vars = {
    '--pad': `${theme.pagePaddingMm}mm`,
    '--base': `${theme.baseFontSizePx}px`,
    '--lh': String(theme.lineHeight),
    '--accent': theme.accent,
    '--side-w': `${layout.sidebarWidthPct}%`,
    '--zoom': String(zoom),
  } as CSSProperties

  return (
    <div className="stage" style={vars}>
      <div className="stage-inner">
        <div
          className={`page-sheet tpl-${theme.templateId} font-${
            theme.fontFamily === 'system-serif' ? 'serif' : 'sans'
          } density-${theme.density}`}
        >
          <div className="page-guides" aria-hidden="true" />
          <div className="page-inner">{children}</div>
        </div>
        <div className="page-meter">A4 · 210 × 297 mm · 蓝色虚线为分页位置</div>
      </div>
    </div>
  )
}
