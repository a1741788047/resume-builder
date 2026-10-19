import { FolderKanban } from 'lucide-react'
import type { ProjectItem, ProjectsData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import {
  AddRowButton,
  AreaField,
  ChipsField,
  LinesField,
  SubCard,
  TextField,
  moveItem,
} from '../../components/fields'
import { uid } from '../../lib/utils'
import { Bullets, ItemHead, SectionTitle } from '../shared'
import { removeAt, updateAt } from '../helpers'

function ProjectsRenderer({ data, theme }: { data: ProjectsData; theme: ThemeConfig }) {
  const items = data.items.filter((item) => item.name.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <FolderKanban size={11} strokeWidth={2} /> : undefined}>
        项目经历
      </SectionTitle>
      <div className="rlist">
        {items.map((item) => (
          <article className="ritem" key={item.id}>
            <ItemHead title={item.name} sub={item.role} right={item.period} />
            {item.description.trim() ? <div className="ritem-note">{item.description}</div> : null}
            {item.tech.length > 0 ? (
              <div className="rtech">
                {item.tech.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
            <Bullets items={item.highlights} />
          </article>
        ))}
      </div>
    </section>
  )
}

function ProjectsEditor({
  data,
  patch,
}: {
  data: ProjectsData
  patch: (patch: Partial<ProjectsData>) => void
}) {
  const setItems = (items: ProjectItem[]) => patch({ items })

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
            label="项目名称"
            value={item.name}
            onChange={(name) => setItems(updateAt(data.items, index, { name }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="担任角色"
              value={item.role}
              onChange={(role) => setItems(updateAt(data.items, index, { role }))}
            />
            <TextField
              label="时间"
              value={item.period}
              placeholder="2024.03 — 2024.09"
              onChange={(period) => setItems(updateAt(data.items, index, { period }))}
            />
          </div>
          <AreaField
            label="项目一句话说明"
            value={item.description}
            rows={2}
            onChange={(description) => setItems(updateAt(data.items, index, { description }))}
          />
          <ChipsField
            label="技术栈"
            value={item.tech}
            placeholder="React，TypeScript，Vite"
            onChange={(tech) => setItems(updateAt(data.items, index, { tech }))}
          />
          <LinesField
            label="亮点与结果（一行一条）"
            value={item.highlights}
            rows={3}
            onChange={(highlights) => setItems(updateAt(data.items, index, { highlights }))}
          />
        </SubCard>
      ))}
      <AddRowButton
        onClick={() =>
          setItems([
            ...data.items,
            {
              id: uid(),
              name: '',
              role: '',
              period: '',
              description: '',
              tech: [],
              highlights: [],
            },
          ])
        }
      >
        添加项目
      </AddRowButton>
    </div>
  )
}

export const projectsModule: BlockModule<ProjectsData> = {
  type: 'projects',
  label: '项目经历',
  description: '代表作与技术细节',
  icon: FolderKanban,
  createData: () => ({ items: [] }),
  Renderer: ProjectsRenderer,
  Editor: ProjectsEditor,
  isEmpty: (data) => data.items.length === 0,
}
