import { useEffect, useState } from 'react'
import { BlockPalette } from './features/palette/BlockPalette'
import { PageFrame } from './features/canvas/PageFrame'
import { ColumnCanvas } from './features/canvas/ColumnCanvas'
import { Inspector } from './features/inspector/Inspector'
import { Toolbar } from './features/toolbar/Toolbar'
import { ExportDialog } from './features/export/ExportDialog'
import { useResumeStore } from './store/useResumeStore'

export default function App() {
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        !!target &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)

      const state = useResumeStore.getState()

      if (e.key === 'Escape' && !typing) {
        state.select(null)
        return
      }
      if (typing) return

      if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (!state.selectedId) return
        e.preventDefault()
        state.nudgeBlock(state.selectedId, e.key === 'ArrowUp' ? -1 : 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app">
      <Toolbar onExport={() => setExportOpen(true)} />

      <div className="workspace">
        <BlockPalette />
        <PageFrame>
          <ColumnCanvas />
        </PageFrame>
        <Inspector />
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}
