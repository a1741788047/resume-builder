import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus } from 'lucide-react'
import { BLOCK_REGISTRY } from '../../domain/blocks/registry'
import { columnOf } from '../../domain/layout'
import type { Block, ColumnId } from '../../domain/types'
import { cn } from '../../lib/utils'
import { useResumeStore } from '../../store/useResumeStore'
import { BlockShell } from './BlockShell'

const COLUMN_PREFIX = 'col:'

/**
 * 跨列拖拽必须优先用「指针命中」而不是「最近四角」：
 * 被拖动的模块本身尺寸较大，closestCorners 会一直选中它原来所在列的邻居，
 * 导致模块永远拖不进另一栏。指针落空时再退回 closestCorners 兜底。
 */
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  return hits.length > 0 ? hits : closestCorners(args)
}

function isColumnId(id: string): id is `col:${ColumnId}` {
  return id.startsWith(COLUMN_PREFIX)
}

function columnFromDroppable(id: string): ColumnId | null {
  if (!isColumnId(id)) return null
  return id.slice(COLUMN_PREFIX.length) as ColumnId
}

function SortableBlock({ id }: { id: string }) {
  const block = useResumeStore((s) => s.doc.blocks[id])
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  if (!block) return null

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <BlockShell
        block={block}
        attributes={attributes}
        listeners={listeners}
        dragging={isDragging}
      />
    </div>
  )
}

function Column({ column }: { column: ColumnId }) {
  const ids = useResumeStore((s) => s.doc.layout.order[column])
  const totalBlocks = useResumeStore(
    (s) => s.doc.layout.order.main.length + s.doc.layout.order.side.length,
  )
  const addBlock = useResumeStore((s) => s.addBlock)
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${column}` })

  return (
    <div
      ref={setNodeRef}
      className={cn('pcol', column === 'main' ? 'pcol-main' : 'pcol-side', isOver && 'is-over')}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {ids.map((id) => (
          <SortableBlock key={id} id={id} />
        ))}
      </SortableContext>

      {ids.length === 0 && totalBlocks === 0 ? null : ids.length === 0 ? (
        <button
          type="button"
          className="pcol-empty"
          onClick={(e) => {
            e.stopPropagation()
            addBlock(column === 'side' ? 'skills' : 'summary', { column })
          }}
        >
          <Plus size={13} />
          这一栏还是空的
        </button>
      ) : (
        <button
          type="button"
          className="pcol-add"
          onClick={(e) => {
            e.stopPropagation()
            addBlock('custom', { column })
          }}
          title="在末尾添加自定义模块"
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  )
}

function DragPreview({ block }: { block: Block }) {
  const theme = useResumeStore((s) => s.doc.theme)
  const mod = BLOCK_REGISTRY[block.type]
  const Renderer = mod.Renderer
  return (
    <div className="blk blk-overlay">
      <div className="blk-content">
        <Renderer data={block.data} theme={theme} />
      </div>
    </div>
  )
}

export function ColumnCanvas() {
  const doc = useResumeStore((s) => s.doc)
  const moveBlock = useResumeStore((s) => s.moveBlock)
  const reorderColumn = useResumeStore((s) => s.reorderColumn)
  const select = useResumeStore((s) => s.select)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeBlock = activeId ? doc.blocks[activeId] : null
  const twoColumn = doc.layout.mode !== 'single'

  function onDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveId(id)
    select(id)
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    const from = columnOf(doc, activeIdStr)
    const to = columnOf(doc, overIdStr) ?? columnFromDroppable(overIdStr)
    if (!from || !to || from === to) return

    const order = doc.layout.order
    const overIndex = order[to].indexOf(overIdStr)
    moveBlock(activeIdStr, to, overIndex >= 0 ? overIndex : order[to].length)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)
    if (activeIdStr === overIdStr) return

    const column = columnOf(doc, activeIdStr)
    if (!column) return
    if (columnOf(doc, overIdStr) !== column) return

    const list = doc.layout.order[column]
    const from = list.indexOf(activeIdStr)
    const to = list.indexOf(overIdStr)
    if (from < 0 || to < 0) return
    reorderColumn(column, from, to)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div
        className={cn(
          'page-columns',
          `mode-${doc.layout.mode}`,
          `tpl-${doc.theme.templateId}`,
        )}
        onClick={() => select(null)}
      >
        {doc.layout.mode === 'sidebar-right' ? (
          <>
            <Column column="main" />
            {twoColumn && <Column column="side" />}
          </>
        ) : (
          <>
            {twoColumn && <Column column="side" />}
            <Column column="main" />
          </>
        )}
      </div>

      {doc.layout.order.main.length === 0 && doc.layout.order.side.length === 0 ? (
        <div className="page-empty" onClick={() => select(null)}>
          <p className="page-empty-title">这张纸还是空的</p>
          <p className="page-empty-hint">从左侧「模块仓库」点一个模块开始，内容会实时出现在这里。</p>
        </div>
      ) : null}

      <DragOverlay dropAnimation={null}>
        {activeBlock ? <DragPreview block={activeBlock} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
