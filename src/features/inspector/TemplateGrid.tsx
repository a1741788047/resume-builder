import type { TemplateId } from '../../domain/types'
import { cn } from '../../lib/utils'

export const TEMPLATE_LIST: { value: TemplateId; label: string; note: string }[] = [
  { value: 'modern', label: '现代', note: '主色竖条标题，适合双栏' },
  { value: 'classic', label: '经典', note: '下划线标题，最保守稳妥' },
  { value: 'compact', label: '紧凑', note: '信息密度高，一页塞满' },
  { value: 'elegant', label: '雅致', note: '姓名居中，宽字距细线' },
  { value: 'bold', label: '醒目', note: '实色标题条，视觉冲击' },
  { value: 'minimal', label: '极简', note: '无图标无底色，纯文字' },
  { value: 'timeline', label: '时间线', note: '主栏带轴线与节点' },
]

export function TemplateGrid({
  value,
  onChange,
}: {
  value: TemplateId
  onChange: (next: TemplateId) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {TEMPLATE_LIST.map((tpl) => (
        <button
          key={tpl.value}
          type="button"
          onClick={() => onChange(tpl.value)}
          title={tpl.note}
          className={cn(
            'group flex items-center gap-2 rounded-[8px] border px-2 py-1.5 text-left transition-colors',
            value === tpl.value
              ? 'border-brand bg-[#f4f8ff]'
              : 'border-line bg-panel hover:border-line2 hover:bg-[#faf9f6]',
          )}
        >
          <span className="mini" data-tpl={tpl.value} aria-hidden="true">
            <span className="mini-bar" />
            <span className="mini-bar" />
            <span className="mini-bar" />
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                'block text-[12px] font-medium',
                value === tpl.value ? 'text-brand' : 'text-ink',
              )}
            >
              {tpl.label}
            </span>
            <span className="block truncate text-[10.5px] text-ink3">{tpl.note}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
