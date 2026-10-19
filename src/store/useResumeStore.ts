import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SCHEMA_VERSION, STORAGE_KEY } from '../domain/constants'
import { createDemoDoc, createEmptyDoc } from '../domain/defaults'
import {
  columnOf,
  moveBlockInOrder,
  normalizeLayout,
  reorderInColumn,
  setLayoutMode,
} from '../domain/layout'
import { migrate } from '../domain/migrate'
import { BLOCK_REGISTRY, createBlock } from '../domain/blocks/registry'
import type {
  Block,
  BlockType,
  ColumnId,
  LayoutMode,
  ResumeDoc,
  ThemeConfig,
} from '../domain/types'
import { uid } from '../lib/utils'

interface ResumeState {
  doc: ResumeDoc
  selectedId: string | null
  zoom: number

  select: (id: string | null) => void
  setZoom: (zoom: number) => void
  setTitle: (title: string) => void

  addBlock: (type: BlockType, target?: { column?: ColumnId; index?: number }) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  toggleVisible: (id: string) => void
  patchData: (id: string, patch: Record<string, unknown>) => void

  moveBlock: (id: string, toColumn: ColumnId, toIndex: number) => void
  reorderColumn: (column: ColumnId, fromIndex: number, toIndex: number) => void
  nudgeBlock: (id: string, direction: -1 | 1) => void

  patchTheme: (patch: Partial<ThemeConfig>) => void
  setMode: (mode: LayoutMode) => void

  loadDoc: (doc: ResumeDoc) => void
  resetToBlank: () => void
  resetToDemo: () => void
}

const touch = (doc: ResumeDoc): ResumeDoc => ({ ...doc, updatedAt: new Date().toISOString() })

/** 侧栏更适合放「短信息型」模块，新增时给它一个合理默认落点 */
const SIDE_FRIENDLY: ReadonlySet<BlockType> = new Set([
  'profile',
  'skills',
  'languages',
  'certificates',
  'awards',
])

function cloneWithNewIds(block: Block): Block {
  const copy = structuredClone(block) as Block
  copy.id = uid()
  const data = copy.data as unknown as Record<string, unknown>
  if (Array.isArray(data.items)) {
    data.items = (data.items as Array<Record<string, unknown>>).map((item) => ({
      ...item,
      id: uid(),
    }))
  }
  if (Array.isArray(data.groups)) {
    data.groups = (data.groups as Array<Record<string, unknown>>).map((group) => ({
      ...group,
      id: uid(),
    }))
  }
  if (Array.isArray(data.links)) {
    data.links = (data.links as Array<Record<string, unknown>>).map((link) => ({
      ...link,
      id: uid(),
    }))
  }
  return copy
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      doc: createDemoDoc(),
      selectedId: null,
      zoom: 0.9,

      select: (id) => set({ selectedId: id }),
      setZoom: (zoom) => set({ zoom }),
      setTitle: (title) => set({ doc: touch({ ...get().doc, title }) }),

      addBlock: (type, target) => {
        const { doc } = get()
        const block = createBlock(type)
        const mode = doc.layout.mode
        const column: ColumnId =
          target?.column ?? (mode === 'single' || !SIDE_FRIENDLY.has(type) ? 'main' : 'side')

        const blocks = { ...doc.blocks, [block.id]: block }
        const list = [...doc.layout.order[column]]
        const index = target?.index ?? list.length
        list.splice(Math.max(0, Math.min(index, list.length)), 0, block.id)

        set({
          doc: touch({
            ...doc,
            blocks,
            layout: normalizeLayout({ ...doc.layout, order: { ...doc.layout.order, [column]: list } }, blocks),
          }),
          selectedId: block.id,
        })
      },

      removeBlock: (id) => {
        const { doc, selectedId } = get()
        const blocks = { ...doc.blocks }
        delete blocks[id]
        set({
          doc: touch({
            ...doc,
            blocks,
            layout: normalizeLayout(
              {
                ...doc.layout,
                order: {
                  main: doc.layout.order.main.filter((x) => x !== id),
                  side: doc.layout.order.side.filter((x) => x !== id),
                },
              },
              blocks,
            ),
          }),
          selectedId: selectedId === id ? null : selectedId,
        })
      },

      duplicateBlock: (id) => {
        const { doc } = get()
        const source = doc.blocks[id]
        if (!source) return
        const copy = cloneWithNewIds(source)
        const column = columnOf(doc, id) ?? 'main'
        const list = [...doc.layout.order[column]]
        const at = list.indexOf(id)
        list.splice(at < 0 ? list.length : at + 1, 0, copy.id)
        const blocks = { ...doc.blocks, [copy.id]: copy }
        set({
          doc: touch({
            ...doc,
            blocks,
            layout: { ...doc.layout, order: { ...doc.layout.order, [column]: list } },
          }),
          selectedId: copy.id,
        })
      },

      toggleVisible: (id) => {
        const { doc } = get()
        const block = doc.blocks[id]
        if (!block) return
        set({
          doc: touch({
            ...doc,
            blocks: { ...doc.blocks, [id]: { ...block, visible: !block.visible } },
          }),
        })
      },

      patchData: (id, patch) => {
        const { doc } = get()
        const block = doc.blocks[id]
        if (!block) return
        const next = {
          ...block,
          data: { ...(block.data as unknown as Record<string, unknown>), ...patch },
        } as unknown as Block
        set({ doc: touch({ ...doc, blocks: { ...doc.blocks, [id]: next } }) })
      },

      moveBlock: (id, toColumn, toIndex) => {
        const { doc } = get()
        if (!doc.blocks[id]) return
        if (doc.layout.mode === 'single' && toColumn === 'side') return
        const order = moveBlockInOrder(doc.layout.order, id, toColumn, toIndex)
        if (
          order.main.join() === doc.layout.order.main.join() &&
          order.side.join() === doc.layout.order.side.join()
        ) {
          return
        }
        set({ doc: touch({ ...doc, layout: { ...doc.layout, order } }) })
      },

      reorderColumn: (column, fromIndex, toIndex) => {
        const { doc } = get()
        if (fromIndex === toIndex) return
        set({
          doc: touch({
            ...doc,
            layout: { ...doc.layout, order: reorderInColumn(doc.layout.order, column, fromIndex, toIndex) },
          }),
        })
      },

      nudgeBlock: (id, direction) => {
        const { doc } = get()
        const column = columnOf(doc, id)
        if (!column) return
        const list = doc.layout.order[column]
        const from = list.indexOf(id)
        const to = from + direction
        if (from < 0 || to < 0 || to >= list.length) return
        set({
          doc: touch({
            ...doc,
            layout: {
              ...doc.layout,
              order: reorderInColumn(doc.layout.order, column, from, to),
            },
          }),
        })
      },

      patchTheme: (patch) => {
        const { doc } = get()
        set({ doc: touch({ ...doc, theme: { ...doc.theme, ...patch } }) })
      },

      setMode: (mode) => {
        const { doc } = get()
        const layout = setLayoutMode(doc, mode)
        // 单栏下 side 上的模块已被合并，选中态保持有效即可
        set({ doc: touch({ ...doc, layout }) })
      },

      loadDoc: (doc) => set({ doc, selectedId: null }),
      resetToBlank: () => set({ doc: createEmptyDoc(), selectedId: null }),
      resetToDemo: () => set({ doc: createDemoDoc(), selectedId: null }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      partialize: (state) => ({ doc: state.doc, zoom: state.zoom }),
      migrate: (persisted) => {
        const raw = persisted as { doc?: unknown; zoom?: number } | undefined
        const doc = raw?.doc ? migrate(raw.doc) : createDemoDoc()
        return { doc, zoom: typeof raw?.zoom === 'number' ? raw.zoom : 0.9 }
      },
    },
  ),
)

export const useBlock = (id: string | null): Block | null => {
  const blocks = useResumeStore((s) => s.doc.blocks)
  return id ? (blocks[id] ?? null) : null
}

export const registryFor = (type: BlockType) => BLOCK_REGISTRY[type]
