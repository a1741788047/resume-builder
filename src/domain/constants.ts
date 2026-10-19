/**
 * 全局唯一常量表。尺寸换算只允许在这里出现一次，
 * 屏幕用 px、打印用 mm，二者不得混写。
 */

export const MM_TO_PX = 96 / 25.4

export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
export const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX)
export const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX)

export const STORAGE_KEY = 'rb:doc:v1'
export const SCHEMA_VERSION = 2

export const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5] as const

export const ACCENT_PRESETS = [
  '#2563EB',
  '#0F766E',
  '#7C3AED',
  '#B45309',
  '#BE123C',
  '#334155',
] as const

export const FONT_SIZE_RANGE = { min: 11, max: 16, step: 0.5 } as const
export const LINE_HEIGHT_RANGE = { min: 1.3, max: 1.9, step: 0.05 } as const
export const PAGE_PADDING_RANGE = { min: 10, max: 22, step: 1 } as const
export const SIDEBAR_WIDTH_RANGE = { min: 26, max: 40, step: 1 } as const

/** 单份简历数据软上限（含头像），超出会提示导出备份 */
export const DATA_SOFT_LIMIT_BYTES = 4 * 1024 * 1024
