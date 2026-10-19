import { Languages as LanguagesIcon } from 'lucide-react'
import type { LanguageItem, LanguagesData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AddRowButton, SubCard, TextField, moveItem } from '../../components/fields'
import { uid } from '../../lib/utils'
import { SectionTitle } from '../shared'
import { removeAt, updateAt } from '../helpers'

function LanguagesRenderer({ data, theme }: { data: LanguagesData; theme: ThemeConfig }) {
  const items = data.items.filter((item) => item.name.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle
        icon={theme.showIcons ? <LanguagesIcon size={11} strokeWidth={2} /> : undefined}
      >
        语言能力
      </SectionTitle>
      <ul className="rrows">
        {items.map((item) => (
          <li key={item.id}>
            <div className="rrow-main">
              <span className="rrow-title">{item.name}</span>
              {item.level.trim() ? <span className="rrow-sub">{item.level}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function LanguagesEditor({
  data,
  patch,
}: {
  data: LanguagesData
  patch: (patch: Partial<LanguagesData>) => void
}) {
  const setItems = (items: LanguageItem[]) => patch({ items })

  return (
    <div className="space-y-2.5">
      {data.items.map((item, index) => (
        <SubCard
          key={item.id}
          title={item.name}
          index={index}
          total={data.items.length}
          onRemove={() => setItems(removeAt(data.items, index))}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
        >
          <TextField
            label="语言"
            value={item.name}
            placeholder="英语"
            onChange={(name) => setItems(updateAt(data.items, index, { name }))}
          />
          <TextField
            label="水平"
            value={item.level}
            placeholder="CET-6 · 可流畅读写技术文档"
            onChange={(level) => setItems(updateAt(data.items, index, { level }))}
          />
        </SubCard>
      ))}
      <AddRowButton onClick={() => setItems([...data.items, { id: uid(), name: '', level: '' }])}>
        添加语言
      </AddRowButton>
    </div>
  )
}

export const languagesModule: BlockModule<LanguagesData> = {
  type: 'languages',
  label: '语言能力',
  description: '外语水平与证书',
  icon: LanguagesIcon,
  createData: () => ({ items: [] }),
  Renderer: LanguagesRenderer,
  Editor: LanguagesEditor,
  isEmpty: (data) => data.items.length === 0,
}
