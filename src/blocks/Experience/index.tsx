import { Briefcase } from 'lucide-react'
import type { ExperienceData, ExperienceItem, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AddRowButton, LinesField, SubCard, TextField } from '../../components/fields'
import { dateRange, uid } from '../../lib/utils'
import { Bullets, ItemHead, SectionTitle } from '../shared'
import { moveItem } from '../../components/fields'
import { removeAt, updateAt } from '../helpers'

function ExperienceRenderer({ data, theme }: { data: ExperienceData; theme: ThemeConfig }) {
  const items = data.items.filter((item) => item.company.trim() || item.role.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <Briefcase size={11} strokeWidth={2} /> : undefined}>
        工作经历
      </SectionTitle>
      <div className="rlist">
        {items.map((item) => {
          const right = [dateRange(item.start, item.end, item.current), item.location]
            .filter(Boolean)
            .join(' · ')
          return (
            <article className="ritem" key={item.id}>
              <ItemHead title={item.company} sub={item.role} right={right} />
              <Bullets items={item.bullets} />
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ExperienceEditor({
  data,
  patch,
}: {
  data: ExperienceData
  patch: (patch: Partial<ExperienceData>) => void
}) {
  const setItems = (items: ExperienceItem[]) => patch({ items })

  function add() {
    setItems([
      ...data.items,
      {
        id: uid(),
        company: '',
        role: '',
        location: '',
        start: '',
        end: '',
        current: true,
        bullets: [''],
      },
    ])
  }

  return (
    <div className="space-y-2.5">
      {data.items.map((item, index) => (
        <SubCard
          key={item.id}
          title={item.company || item.role}
          index={index}
          total={data.items.length}
          onRemove={() => setItems(removeAt(data.items, index))}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
        >
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="公司"
              value={item.company}
              onChange={(company) => setItems(updateAt(data.items, index, { company }))}
            />
            <TextField
              label="职位"
              value={item.role}
              onChange={(role) => setItems(updateAt(data.items, index, { role }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <TextField
              label="开始"
              type="month"
              value={item.start}
              onChange={(start) => setItems(updateAt(data.items, index, { start }))}
            />
            <TextField
              label="结束"
              type="month"
              value={item.end}
              onChange={(end) => setItems(updateAt(data.items, index, { end }))}
            />
            <TextField
              label="城市"
              value={item.location}
              onChange={(location) => setItems(updateAt(data.items, index, { location }))}
            />
          </div>
          <label className="flex items-center gap-2 text-[12.5px] text-ink2">
            <input
              type="checkbox"
              checked={item.current}
              onChange={(e) => setItems(updateAt(data.items, index, { current: e.target.checked }))}
              className="h-3.5 w-3.5 accent-[#2563eb]"
            />
            至今在职
          </label>
          <LinesField
            label="工作内容与成果（一行一条）"
            value={item.bullets}
            rows={4}
            placeholder="用「动词 + 做了什么 + 量化结果」的句式，例如：主导首屏性能专项，LCP 从 3.2s 降至 1.1s"
            onChange={(bullets) => setItems(updateAt(data.items, index, { bullets }))}
          />
        </SubCard>
      ))}
      <AddRowButton onClick={add}>添加一段工作经历</AddRowButton>
    </div>
  )
}

export const experienceModule: BlockModule<ExperienceData> = {
  type: 'experience',
  label: '工作经历',
  description: '公司、职位、职责与成果',
  icon: Briefcase,
  createData: () => ({ items: [] }),
  Renderer: ExperienceRenderer,
  Editor: ExperienceEditor,
  isEmpty: (data) => data.items.length === 0,
}
