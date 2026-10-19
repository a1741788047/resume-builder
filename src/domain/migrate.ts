import { SCHEMA_VERSION } from './constants'
import { DEFAULT_THEME, createEmptyDoc } from './defaults'
import { normalizeLayout } from './layout'
import type { Block, ResumeDoc, ThemeConfig } from './types'
import { uid } from '../lib/utils'

export class DocValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DocValidationError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function sanitizeTheme(raw: unknown): ThemeConfig {
  const t = isRecord(raw) ? raw : {}
  const templateId = str(t.templateId)
  const fontFamily = str(t.fontFamily)
  const density = str(t.density)
  const VALID_TEMPLATES = [
    'classic',
    'modern',
    'compact',
    'elegant',
    'bold',
    'minimal',
    'timeline',
  ] as const
  return {
    templateId: (VALID_TEMPLATES as readonly string[]).includes(templateId)
      ? (templateId as (typeof VALID_TEMPLATES)[number])
      : DEFAULT_THEME.templateId,
    accent: /^#[0-9a-fA-F]{6}$/.test(str(t.accent)) ? str(t.accent) : DEFAULT_THEME.accent,
    fontFamily: fontFamily === 'system-serif' ? 'system-serif' : 'system-sans',
    baseFontSizePx: num(t.baseFontSizePx, DEFAULT_THEME.baseFontSizePx, 10, 18),
    lineHeight: num(t.lineHeight, DEFAULT_THEME.lineHeight, 1.2, 2),
    density:
      density === 'compact' || density === 'loose'
        ? density
        : 'normal',
    pagePaddingMm: num(t.pagePaddingMm, DEFAULT_THEME.pagePaddingMm, 8, 25),
    showIcons: typeof t.showIcons === 'boolean' ? t.showIcons : DEFAULT_THEME.showIcons,
  }
}

/**
 * 把任意来源（旧版本 / 手改坏 / 别的机器）的数据规整成当前结构的 ResumeDoc。
 * 无法识别的模块直接丢弃并记录，绝不静默产生半个模块。
 */
export function migrate(raw: unknown): ResumeDoc {
  if (!isRecord(raw)) throw new DocValidationError('文件内容不是一个简历对象')

  const base = createEmptyDoc()
  const doc: ResumeDoc = {
    ...base,
    id: str(raw.id, base.id),
    title: str(raw.title, base.title),
    updatedAt: str(raw.updatedAt, new Date().toISOString()),
    theme: sanitizeTheme(raw.theme),
  }

  const rawBlocks = isRecord(raw.blocks) ? raw.blocks : {}
  const blocks: Record<string, Block> = {}

  for (const [key, value] of Object.entries(rawBlocks)) {
    if (!isRecord(value)) continue
    const type = str(value.type)
    if (!type) continue
    const id = str(value.id, key)
    blocks[id] = {
      id,
      type,
      visible: value.visible !== false,
      data: isRecord(value.data) ? value.data : {},
    } as unknown as Block
  }

  // 兼容 v1：blocks 为数组，顺序即 main 列顺序
  if (Array.isArray(raw.blocks)) {
    const order: string[] = []
    for (const value of raw.blocks) {
      if (!isRecord(value) || !str(value.type)) continue
      const id = str(value.id, uid())
      blocks[id] = {
        id,
        type: str(value.type),
        visible: value.visible !== false,
        data: isRecord(value.data) ? value.data : {},
      } as unknown as Block
      order.push(id)
    }
    const layoutRaw = isRecord(raw.layout) ? raw.layout : {}
    doc.layout = normalizeLayout(
      {
        mode: 'single',
        sidebarWidthPct: 32,
        order: { main: order, side: [] },
      },
      blocks,
    )
    void layoutRaw
    doc.blocks = blocks
    doc.schemaVersion = SCHEMA_VERSION
    return doc
  }

  const layoutRaw = isRecord(raw.layout) ? raw.layout : {}
  const orderRaw = isRecord(layoutRaw.order) ? layoutRaw.order : {}
  const mode = str(layoutRaw.mode)

  doc.blocks = blocks
  doc.layout = normalizeLayout(
    {
      mode:
        mode === 'single' || mode === 'sidebar-right' || mode === 'sidebar-left'
          ? mode
          : base.layout.mode,
      sidebarWidthPct: num(layoutRaw.sidebarWidthPct, 32, 20, 50),
      order: {
        main: Array.isArray(orderRaw.main) ? orderRaw.main.filter((v): v is string => typeof v === 'string') : [],
        side: Array.isArray(orderRaw.side) ? orderRaw.side.filter((v): v is string => typeof v === 'string') : [],
      },
    },
    blocks,
  )
  doc.schemaVersion = SCHEMA_VERSION
  return doc
}
