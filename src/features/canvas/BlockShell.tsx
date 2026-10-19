import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { Copy, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react'
import { BLOCK_REGISTRY, blockIsEmpty } from '../../domain/blocks/registry'
import type { Block } from '../../domain/types'
import { cn } from '../../lib/utils'
import { useResumeStore } from '../../store/useResumeStore'

interface Props {
  block: Block
  listeners?: DraggableSyntheticListeners
  attributes?: DraggableAttributes
  dragging?: boolean
}

export function BlockShell({ block, listeners, attributes, dragging }: Props) {
  const selectedId = useResumeStore((s) => s.selectedId)
  const select = useResumeStore((s) => s.select)
  const removeBlock = useResumeStore((s) => s.removeBlock)
  const duplicateBlock = useResumeStore((s) => s.duplicateBlock)
  const toggleVisible = useResumeStore((s) => s.toggleVisible)
  const patchData = useResumeStore((s) => s.patchData)
  const theme = useResumeStore((s) => s.doc.theme)

  const mod = BLOCK_REGISTRY[block.type]
  const empty = blockIsEmpty(block)
  const selected = selectedId === block.id
  const Renderer = mod.Renderer
  const Action = mod.CanvasAction

  return (
    <div
      data-block-id={block.id}
      className={cn(
        'blk',
        selected && 'is-selected',
        !block.visible && 'is-hidden',
        empty && 'is-empty',
        dragging && 'is-dragging',
      )}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        select(block.id)
      }}
    >
      <div
        className="blk-tools"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="blk-handle" aria-hidden="true" title="按住模块任意位置即可拖动">
          <GripVertical size={13} />
        </span>
        {Action ? (
          <Action data={block.data} patch={(patch) => patchData(block.id, patch)} />
        ) : null}
        <button
          type="button"
          className="blk-tool"
          title={block.visible ? '隐藏（不打印）' : '显示'}
          aria-label={block.visible ? '隐藏模块' : '显示模块'}
          onClick={(e) => {
            e.stopPropagation()
            toggleVisible(block.id)
          }}
        >
          {block.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          type="button"
          className="blk-tool"
          title="复制"
          aria-label="复制模块"
          onClick={(e) => {
            e.stopPropagation()
            duplicateBlock(block.id)
          }}
        >
          <Copy size={13} />
        </button>
        <button
          type="button"
          className="blk-tool blk-tool-danger"
          title="删除"
          aria-label="删除模块"
          onClick={(e) => {
            e.stopPropagation()
            removeBlock(block.id)
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className={cn('blk-content', block.type === 'profile' && 'blk-content-profile')}>
        {empty ? (
          <div className="blk-placeholder">
            <span className="blk-placeholder-tag">{mod.label}</span>
            <span className="blk-placeholder-text">还没有内容，点击这里开始填写</span>
          </div>
        ) : (
          <Renderer data={block.data} theme={theme} />
        )}
      </div>
    </div>
  )
}
