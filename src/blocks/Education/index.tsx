import { GraduationCap } from 'lucide-react'
import type { EducationData, EducationItem, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AddRowButton, AreaField, SubCard, TextField, moveItem } from '../../components/fields'
import { dateRange, uid } from '../../lib/utils'
import { ItemHead, SectionTitle } from '../shared'
import { removeAt, updateAt } from '../helpers'

function EducationRenderer({ data, theme }: { data: EducationData; theme: ThemeConfig }) {
  const items = data.items.filter((item) => item.school.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <GraduationCap size={11} strokeWidth={2} /> : undefined}>
        教育背景
      </SectionTitle>
      <div className="rlist">
        {items.map((item) => (
          <article className="ritem" key={item.id}>
            <ItemHead
              title={item.school}
              sub={item.degree}
              meta={item.major}
              right={dateRange(item.start, item.end, false)}
            />
            {item.detail.trim() ? <div className="ritem-note">{item.detail}</div> : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function EducationEditor({
  data,
  patch,
}: {
  data: EducationData
  patch: (patch: Partial<EducationData>) => void
}) {
  const setItems = (items: EducationItem[]) => patch({ items })

  return (
    <div className="space-y-2.5">
      {data.items.map((item, index) => (
        <SubCard
          key={item.id}
          title={item.school}
          index={index}
          total={data.items.length}
          onRemove={() => setItems(removeAt(data.items, index))}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
        >
          <TextField
            label="学校"
            value={item.school}
            onChange={(school) => setItems(updateAt(data.items, index, { school }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="学历"
              value={item.degree}
              placeholder="本科 / 硕士"
              onChange={(degree) => setItems(updateAt(data.items, index, { degree }))}
            />
            <TextField
              label="专业"
              value={item.major}
              onChange={(major) => setItems(updateAt(data.items, index, { major }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="入学"
              type="month"
              value={item.start}
              onChange={(start) => setItems(updateAt(data.items, index, { start }))}
            />
            <TextField
              label="毕业"
              type="month"
              value={item.end}
              onChange={(end) => setItems(updateAt(data.items, index, { end }))}
            />
          </div>
          <AreaField
            label="补充说明"
            value={item.detail}
            rows={2}
            placeholder="GPA、排名、奖学金、主修课程等"
            onChange={(detail) => setItems(updateAt(data.items, index, { detail }))}
          />
        </SubCard>
      ))}
      <AddRowButton
        onClick={() =>
          setItems([
            ...data.items,
            { id: uid(), school: '', degree: '', major: '', start: '', end: '', detail: '' },
          ])
        }
      >
        添加教育经历
      </AddRowButton>
    </div>
  )
}

export const educationModule: BlockModule<EducationData> = {
  type: 'education',
  label: '教育背景',
  description: '学校、专业与学历',
  icon: GraduationCap,
  createData: () => ({ items: [] }),
  Renderer: EducationRenderer,
  Editor: EducationEditor,
  isEmpty: (data) => data.items.length === 0,
}
