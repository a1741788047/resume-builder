import { Sparkles } from 'lucide-react'
import type { TagsData, TagsGroup, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AddRowButton, ChipsField, SubCard, TextField, moveItem } from '../../components/fields'
import { uid } from '../../lib/utils'
import { SectionTitle } from '../shared'
import { removeAt, updateAt } from '../helpers'

function SkillsRenderer({ data, theme }: { data: TagsData; theme: ThemeConfig }) {
  const groups = data.groups.filter((group) => group.items.length > 0)
  if (groups.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <Sparkles size={11} strokeWidth={2} /> : undefined}>
        专业技能
      </SectionTitle>
      <div className="rskills">
        {groups.map((group) => (
          <div className="rskill-group" key={group.id}>
            {group.label.trim() ? <div className="rskill-label">{group.label}</div> : null}
            <div className="rtags">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SkillsEditor({ data, patch }: { data: TagsData; patch: (patch: Partial<TagsData>) => void }) {
  const setGroups = (groups: TagsGroup[]) => patch({ groups })

  return (
    <div className="space-y-2.5">
      {data.groups.map((group, index) => (
        <SubCard
          key={group.id}
          title={group.label}
          index={index}
          total={data.groups.length}
          onRemove={() => setGroups(removeAt(data.groups, index))}
          onMove={(direction) => setGroups(moveItem(data.groups, index, direction))}
        >
          <TextField
            label="分组名"
            value={group.label}
            placeholder="语言 / 框架 / 工具"
            onChange={(label) => setGroups(updateAt(data.groups, index, { label }))}
          />
          <ChipsField
            label="技能项"
            value={group.items}
            placeholder="React，Vue 3，Node.js"
            hint="用逗号或顿号分隔"
            onChange={(items) => setGroups(updateAt(data.groups, index, { items }))}
          />
        </SubCard>
      ))}
      <AddRowButton
        onClick={() => setGroups([...data.groups, { id: uid(), label: '', items: [] }])}
      >
        添加技能分组
      </AddRowButton>
    </div>
  )
}

export const skillsModule: BlockModule<TagsData> = {
  type: 'skills',
  label: '专业技能',
  description: '按分组罗列技能标签',
  icon: Sparkles,
  createData: () => ({ groups: [{ id: uid(), label: '', items: [] }] }),
  Renderer: SkillsRenderer,
  Editor: SkillsEditor,
  isEmpty: (data) => data.groups.every((group) => group.items.length === 0),
}
