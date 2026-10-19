import { Award } from 'lucide-react'
import type { AwardItem, AwardsData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AddRowButton, SubCard, TextField, moveItem } from '../../components/fields'
import { formatMonth, uid } from '../../lib/utils'
import { SectionTitle } from '../shared'
import { removeAt, updateAt } from '../helpers'

function AwardsRenderer({ data, theme }: { data: AwardsData; theme: ThemeConfig }) {
  const items = data.items.filter((item) => item.title.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <Award size={11} strokeWidth={2} /> : undefined}>
        荣誉奖项
      </SectionTitle>
      <ul className="rrows">
        {items.map((item) => (
          <li key={item.id}>
            <div className="rrow-main">
              <span className="rrow-title">{item.title}</span>
              {item.issuer.trim() ? <span className="rrow-sub">{item.issuer}</span> : null}
            </div>
            {item.date.trim() ? <span className="rrow-date">{formatMonth(item.date)}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function AwardsEditor({ data, patch }: { data: AwardsData; patch: (patch: Partial<AwardsData>) => void }) {
  const setItems = (items: AwardItem[]) => patch({ items })

  return (
    <div className="space-y-2.5">
      {data.items.map((item, index) => (
        <SubCard
          key={item.id}
          title={item.title}
          index={index}
          total={data.items.length}
          onRemove={() => setItems(removeAt(data.items, index))}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
        >
          <TextField
            label="奖项名称"
            value={item.title}
            onChange={(title) => setItems(updateAt(data.items, index, { title }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="颁发方"
              value={item.issuer}
              onChange={(issuer) => setItems(updateAt(data.items, index, { issuer }))}
            />
            <TextField
              label="时间"
              type="month"
              value={item.date}
              onChange={(date) => setItems(updateAt(data.items, index, { date }))}
            />
          </div>
        </SubCard>
      ))}
      <AddRowButton
        onClick={() => setItems([...data.items, { id: uid(), title: '', date: '', issuer: '' }])}
      >
        添加奖项
      </AddRowButton>
    </div>
  )
}

export const awardsModule: BlockModule<AwardsData> = {
  type: 'awards',
  label: '荣誉奖项',
  description: '获奖与荣誉记录',
  icon: Award,
  createData: () => ({ items: [] }),
  Renderer: AwardsRenderer,
  Editor: AwardsEditor,
  isEmpty: (data) => data.items.length === 0,
}
