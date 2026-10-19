import { Minus, Plus, Printer } from 'lucide-react'
import { ZOOM_STEPS } from '../../domain/constants'
import { clamp } from '../../lib/utils'
import { useResumeStore } from '../../store/useResumeStore'
import { Button } from '../../components/ui'

export function Toolbar({ onExport }: { onExport: () => void }) {
  const doc = useResumeStore((s) => s.doc)
  const setTitle = useResumeStore((s) => s.setTitle)
  const zoom = useResumeStore((s) => s.zoom)
  const setZoom = useResumeStore((s) => s.setZoom)

  const index = ZOOM_STEPS.findIndex((step) => Math.abs(step - zoom) < 0.001)
  const current = index >= 0 ? index : ZOOM_STEPS.length - 1

  const step = (direction: -1 | 1) => {
    const next = clamp(current + direction, 0, ZOOM_STEPS.length - 1)
    setZoom(ZOOM_STEPS[next])
  }

  const savedAt = new Date(doc.updatedAt).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">简</span>
        <span className="brand-name">简历工坊</span>
      </div>

      <input
        className="doc-title"
        value={doc.title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="给这份简历起个名字"
        aria-label="简历名称"
      />

      <span className="header-meta">已自动保存 · {savedAt}</span>

      <span className="header-spacer" />

      <div className="zoom-group">
        <button
          type="button"
          className="zoom-btn"
          onClick={() => step(-1)}
          aria-label="缩小"
          disabled={current === 0}
        >
          <Minus size={13} />
        </button>
        <button
          type="button"
          className="zoom-value"
          onClick={() => setZoom(1)}
          title="点击恢复 100%"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="zoom-btn"
          onClick={() => step(1)}
          aria-label="放大"
          disabled={current === ZOOM_STEPS.length - 1}
        >
          <Plus size={13} />
        </button>
      </div>

      <Button variant="primary" onClick={onExport}>
        <Printer size={14} />
        导出 PDF
      </Button>
    </header>
  )
}
