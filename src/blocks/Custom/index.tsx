import { SquarePen } from 'lucide-react'
import type { CustomData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { LinesField, TextField } from '../../components/fields'
import { uid } from '../../lib/utils'
import { Bullets, SectionTitle } from '../shared'

function CustomRenderer({ data, theme }: { data: CustomData; theme: ThemeConfig }) {
  const items = data.items.map((item) => item.text).filter((text) => text.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <SquarePen size={11} strokeWidth={2} /> : undefined}>
        {data.title.trim() || '自定义模块'}
      </SectionTitle>
      <Bullets items={items} />
    </section>
  )
}

function CustomEditor({ data, patch }: { data: CustomData; patch: (patch: Partial<CustomData>) => void }) {
  return (
    <div className="space-y-3">
      <TextField
        label="模块标题"
        value={data.title}
        placeholder="如：开源贡献 / 出版物 / 社会实践"
        onChange={(title) => patch({ title })}
      />
      <LinesField
        label="内容（一行一条）"
        value={data.items.map((item) => item.text)}
        rows={7}
        placeholder="每行会渲染成一个要点"
        onChange={(lines) => patch({ items: lines.map((text) => ({ id: uid(), text })) })}
      />
    </div>
  )
}

export const customModule: BlockModule<CustomData> = {
  type: 'custom',
  label: '自定义模块',
  description: '任意标题 + 要点列表',
  icon: SquarePen,
  createData: () => ({ title: '自定义模块', items: [] }),
  Renderer: CustomRenderer,
  Editor: CustomEditor,
  isEmpty: (data) => data.items.every((item) => !item.text.trim()),
}
