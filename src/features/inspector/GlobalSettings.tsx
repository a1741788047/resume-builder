import { useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { ACCENT_PRESETS, FONT_SIZE_RANGE, LINE_HEIGHT_RANGE, PAGE_PADDING_RANGE, SIDEBAR_WIDTH_RANGE } from '../../domain/constants'
import { DocValidationError, migrate } from '../../domain/migrate'
import type { LayoutMode } from '../../domain/types'
import { bytesToMb, safeFilename } from '../../lib/utils'
import { useResumeStore } from '../../store/useResumeStore'
import { Button, PanelSection, RangeField, Segmented, Switch } from '../../components/ui'
import { TemplateGrid } from './TemplateGrid'

const LAYOUTS: { value: LayoutMode; label: string; title: string }[] = [
  { value: 'single', label: '单栏', title: '全部模块竖排' },
  { value: 'sidebar-left', label: '左栏', title: '侧栏在左' },
  { value: 'sidebar-right', label: '右栏', title: '侧栏在右' },
]

export function GlobalSettings() {
  const doc = useResumeStore((s) => s.doc)
  const patchTheme = useResumeStore((s) => s.patchTheme)
  const setMode = useResumeStore((s) => s.setMode)
  const loadDoc = useResumeStore((s) => s.loadDoc)
  const resetToBlank = useResumeStore((s) => s.resetToBlank)
  const resetToDemo = useResumeStore((s) => s.resetToDemo)

  const fileRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [usage, setUsage] = useState<string | null>(null)

  useEffect(() => {
    const raw = JSON.stringify(doc)
    setUsage(bytesToMb(raw.length * 2))
  }, [doc])

  function exportJson() {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = safeFilename(doc.title, 'json')
    a.click()
    URL.revokeObjectURL(url)
    setNotice('已导出 JSON 备份')
  }

  async function importJson(file: File) {
    try {
      const text = await file.text()
      const next = migrate(JSON.parse(text))
      loadDoc(next)
      setNotice('导入成功')
    } catch (err) {
      const message =
        err instanceof DocValidationError
          ? err.message
          : err instanceof SyntaxError
            ? '文件不是合法的 JSON'
            : '导入失败，文件结构无法识别'
      setNotice(message)
    }
  }

  return (
    <aside className="panel inspector">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">全局设置</h2>
          <p className="panel-sub">选中画布中的模块可编辑其内容</p>
        </div>
      </div>

      <div className="panel-body">
        <PanelSection title="模板">
          <TemplateGrid
            value={doc.theme.templateId}
            onChange={(templateId) => patchTheme({ templateId })}
          />
          <Segmented
            options={LAYOUTS}
            value={doc.layout.mode}
            onChange={(mode) => setMode(mode)}
            className="w-full justify-between"
          />
          {doc.layout.mode !== 'single' && (
            <RangeField
              label="侧栏宽度"
              value={doc.layout.sidebarWidthPct}
              min={SIDEBAR_WIDTH_RANGE.min}
              max={SIDEBAR_WIDTH_RANGE.max}
              step={SIDEBAR_WIDTH_RANGE.step}
              display={`${doc.layout.sidebarWidthPct}%`}
              onChange={(sidebarWidthPct) => {
                const store = useResumeStore.getState()
                store.loadDoc({
                  ...store.doc,
                  layout: { ...store.doc.layout, sidebarWidthPct },
                })
              }}
            />
          )}
        </PanelSection>

        <PanelSection title="视觉">
          <div>
            <span className="mb-1.5 block text-[12.5px] text-ink2">主色</span>
            <div className="flex items-center gap-1.5">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`主色 ${color}`}
                  onClick={() => patchTheme({ accent: color })}
                  className="h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                  style={{
                    background: color,
                    outline: doc.theme.accent === color ? '2px solid #1f2023' : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
              <label className="ml-1 flex h-6 cursor-pointer items-center gap-1 rounded-[6px] border border-line2 px-1.5 text-[11.5px] text-ink2">
                自定义
                <input
                  type="color"
                  value={doc.theme.accent}
                  onChange={(e) => patchTheme({ accent: e.target.value })}
                  className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
            </div>
          </div>

          <Segmented
            options={[
              { value: 'system-sans', label: '黑体' },
              { value: 'system-serif', label: '宋体' },
            ]}
            value={doc.theme.fontFamily}
            onChange={(fontFamily) => patchTheme({ fontFamily })}
            className="w-full justify-between"
          />

          <RangeField
            label="字号"
            value={doc.theme.baseFontSizePx}
            min={FONT_SIZE_RANGE.min}
            max={FONT_SIZE_RANGE.max}
            step={FONT_SIZE_RANGE.step}
            display={`${doc.theme.baseFontSizePx}px`}
            onChange={(baseFontSizePx) => patchTheme({ baseFontSizePx })}
          />
          <RangeField
            label="行距"
            value={doc.theme.lineHeight}
            min={LINE_HEIGHT_RANGE.min}
            max={LINE_HEIGHT_RANGE.max}
            step={LINE_HEIGHT_RANGE.step}
            display={doc.theme.lineHeight.toFixed(2)}
            onChange={(lineHeight) => patchTheme({ lineHeight })}
          />
          <RangeField
            label="页边距"
            value={doc.theme.pagePaddingMm}
            min={PAGE_PADDING_RANGE.min}
            max={PAGE_PADDING_RANGE.max}
            step={PAGE_PADDING_RANGE.step}
            display={`${doc.theme.pagePaddingMm}mm`}
            onChange={(pagePaddingMm) => patchTheme({ pagePaddingMm })}
          />
          <Segmented
            options={[
              { value: 'compact', label: '紧凑' },
              { value: 'normal', label: '标准' },
              { value: 'loose', label: '宽松' },
            ]}
            value={doc.theme.density}
            onChange={(density) => patchTheme({ density })}
            className="w-full justify-between"
          />
          <Switch
            label="显示小图标"
            checked={doc.theme.showIcons}
            onChange={(showIcons) => patchTheme({ showIcons })}
          />
        </PanelSection>

        <PanelSection title="数据">
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" onClick={exportJson}>
              <Download size={13} />
              导出 JSON
            </Button>
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={13} />
              导入 JSON
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="ghost" onClick={resetToBlank}>
              <RotateCcw size={12} />
              清空重来
            </Button>
            <Button size="sm" variant="ghost" onClick={resetToDemo}>
              载入示例
            </Button>
          </div>
          <p className="text-[11.5px] leading-relaxed text-ink3">
            数据只存在这台电脑的浏览器里。当前占用约 {usage ?? '—'}，建议定期导出 JSON 备份。
          </p>
          {notice && <p className="text-[11.5px] text-brand">{notice}</p>}
        </PanelSection>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void importJson(file)
          e.target.value = ''
        }}
      />
    </aside>
  )
}
