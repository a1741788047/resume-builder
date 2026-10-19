import { ChevronRight } from 'lucide-react'
import { BLOCK_REGISTRY, blockIsEmpty } from '../../domain/blocks/registry'
import { useResumeStore } from '../../store/useResumeStore'
import { GlobalSettings } from './GlobalSettings'

export function Inspector() {
  const selectedId = useResumeStore((s) => s.selectedId)
  const block = useResumeStore((s) => (s.selectedId ? s.doc.blocks[s.selectedId] : null))
  const patchData = useResumeStore((s) => s.patchData)
  const select = useResumeStore((s) => s.select)
  const removeBlock = useResumeStore((s) => s.removeBlock)

  if (!block || !selectedId) return <GlobalSettings />

  const mod = BLOCK_REGISTRY[block.type]
  const Editor = mod.Editor
  const empty = blockIsEmpty(block)

  return (
    <aside className="panel inspector">
      <div className="panel-head">
        <div className="min-w-0">
          <h2 className="panel-title">
            {mod.label}
            {empty ? <span className="panel-badge">空</span> : null}
          </h2>
          <p className="panel-sub">{mod.description}</p>
        </div>
        <button
          type="button"
          className="panel-collapse"
          onClick={() => select(null)}
          title="收起，回到全局设置"
          aria-label="收起模块设置"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="panel-body">
        <Editor data={block.data} patch={(patch) => patchData(block.id, patch)} />
      </div>

      <div className="inspector-foot">
        <button type="button" className="text-btn danger" onClick={() => removeBlock(block.id)}>
          删除这个模块
        </button>
      </div>
    </aside>
  )
}
