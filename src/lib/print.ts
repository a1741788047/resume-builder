import { A4_HEIGHT_MM, A4_WIDTH_MM } from '../domain/constants'

const STYLE_ID = 'rb-print-page'

/**
 * @page 的 margin 无法使用 CSS 变量，所以按当前页边距动态注入。
 * 这样多页打印时每一页都有相同留白，而不是只有第一页有 padding。
 */
function applyPageRule(paddingMm: number) {
  let el = document.getElementById(STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = `@page { size: ${A4_WIDTH_MM}mm ${A4_HEIGHT_MM}mm; margin: ${paddingMm}mm; }`
}

export interface ExportOptions {
  paddingMm: number
  ats: boolean
}

export async function exportPdf({ paddingMm, ats }: ExportOptions): Promise<void> {
  applyPageRule(paddingMm)
  document.body.classList.toggle('print-ats', ats)

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* 字体加载失败不阻塞打印 */
    }
  }

  // 等两帧，确保样式与图片落地后再唤起打印
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

  const cleanup = () => {
    document.body.classList.remove('print-ats')
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)

  window.print()
  // Safari 不一定触发 afterprint，兜底清掉
  window.setTimeout(cleanup, 1200)
}
