import { GripVertical, Plus } from 'lucide-react'
import { BLOCK_REGISTRY, PALETTE_TYPES } from '../../domain/blocks/registry'
import { columnOf } from '../../domain/layout'
import type { BlockType, ColumnId } from '../../domain/types'
import { useResumeStore } from '../../store/useResumeStore'

export function BlockPalette() {
  const doc = useResumeStore((s) => s.doc)
  const selectedId = useResumeStore((s) => s.selectedId)
  const addBlock = useResumeStore((s) => s.addBlock)

  const selected = selectedId ? doc.blocks[selectedId] : null

  function target(): { column: ColumnId; index: number } | undefined {
    if (!selected) return undefined
    const column = columnOf(doc, selected.id)
    if (!column) return undefined
    return { column, index: doc.layout.order[column].indexOf(selected.id) + 1 }
  }

  function countOf(type: BlockType): number {
    return Object.values(doc.blocks).filter((block) => block.type === type).length
  }

  return (
    <aside className="panel palette">
      <div className="panel-head">
        <h2 className="panel-title">模块仓库</h2>
        <span className="panel-note">点击添加</span>
      </div>

      <div className="panel-body">
        <ul className="palette-list">
          {PALETTE_TYPES.map((type) => {
            const mod = BLOCK_REGISTRY[type]
            const Icon = mod.icon
            const count = countOf(type)
            return (
              <li key={type}>
                <button
                  type="button"
                  className="palette-item"
                  onClick={() => addBlock(type, target())}
                  title={`添加「${mod.label}」`}
                >
                  <span className="palette-icon">
                    <Icon size={14} strokeWidth={1.9} />
                  </span>
                  <span className="palette-text">
                    <span className="palette-label">{mod.label}</span>
                    <span className="palette-desc">{mod.description}</span>
                  </span>
                  {count > 0 ? <span className="palette-count">{count}</span> : <Plus size={13} className="palette-plus" />}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="palette-tip">
          <GripVertical size={12} />
          <span>画布中按住模块左上角把手可拖动排序，双栏模式下可跨栏搬移</span>
        </div>
      </div>
    </aside>
  )
}
