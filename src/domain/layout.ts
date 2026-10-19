import type { Block, ColumnId, LayoutConfig, LayoutMode, ResumeDoc } from './types'

export const COLUMNS: ColumnId[] = ['main', 'side']

export function columnOf(doc: ResumeDoc, blockId: string): ColumnId | null {
  if (doc.layout.order.main.includes(blockId)) return 'main'
  if (doc.layout.order.side.includes(blockId)) return 'side'
  return null
}

/**
 * 把 blockId 从原列摘出并插入目标列的目标下标。
 * 纯函数：不改入参，返回新的 order。
 */
export function moveBlockInOrder(
  order: Record<ColumnId, string[]>,
  blockId: string,
  toColumn: ColumnId,
  toIndex: number,
): Record<ColumnId, string[]> {
  const next: Record<ColumnId, string[]> = {
    main: order.main.filter((id) => id !== blockId),
    side: order.side.filter((id) => id !== blockId),
  }
  const target = next[toColumn]
  const index = Math.max(0, Math.min(toIndex, target.length))
  target.splice(index, 0, blockId)
  return next
}

export function reorderInColumn(
  order: Record<ColumnId, string[]>,
  column: ColumnId,
  fromIndex: number,
  toIndex: number,
): Record<ColumnId, string[]> {
  const list = [...order[column]]
  if (fromIndex < 0 || fromIndex >= list.length) return order
  const [item] = list.splice(fromIndex, 1)
  if (!item) return order
  list.splice(Math.max(0, Math.min(toIndex, list.length)), 0, item)
  return { ...order, [column]: list }
}

/**
 * 一致性收口：去重、剔除指向已删除模块的孤儿 id；
 * 单栏模式下 side 列必须为空，否则会出现「数据在但看不见」。
 */
export function normalizeLayout(
  layout: LayoutConfig,
  blocks: Record<string, Block>,
): LayoutConfig {
  const dedupe = (ids: string[]) => ids.filter((id, i) => blocks[id] && ids.indexOf(id) === i)

  const main = dedupe(layout.order.main)
  const side = dedupe(layout.order.side)

  if (layout.mode === 'single') {
    return { ...layout, order: { main: [...main, ...side], side: [] } }
  }
  return { ...layout, order: { main, side } }
}

export function setLayoutMode(doc: ResumeDoc, mode: LayoutMode): LayoutConfig {
  const order = { main: [...doc.layout.order.main], side: [...doc.layout.order.side] }

  if (mode === 'single') {
    const merged = [...order.main, ...order.side]
    // 合栏时把「基本信息」提到最前，否则姓名会掉到简历中段
    const profileId = merged.find((id) => doc.blocks[id]?.type === 'profile')
    const ordered = profileId ? [profileId, ...merged.filter((id) => id !== profileId)] : merged
    return normalizeLayout({ ...doc.layout, mode, order: { main: ordered, side: [] } }, doc.blocks)
  }

  // 从单栏切到双栏且侧栏为空：把「天然属于侧栏」的模块搬过去
  if (order.side.length === 0) {
    const sideTypes = new Set(['profile', 'skills', 'languages', 'certificates', 'awards'])
    const moving = order.main.filter((id) => sideTypes.has(doc.blocks[id]?.type ?? ''))
    const staying = order.main.filter((id) => !sideTypes.has(doc.blocks[id]?.type ?? ''))
    if (moving.length > 0 && staying.length > 0) {
      return normalizeLayout(
        { ...doc.layout, mode, order: { main: staying, side: moving } },
        doc.blocks,
      )
    }
  }

  return normalizeLayout({ ...doc.layout, mode, order }, doc.blocks)
}

export function orderedBlocks(doc: ResumeDoc, column: ColumnId): string[] {
  return doc.layout.order[column].filter((id) => Boolean(doc.blocks[id]))
}
