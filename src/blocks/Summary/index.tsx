import { AlignLeft } from 'lucide-react'
import type { SummaryData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AreaField } from '../../components/fields'
import { Prose, SectionTitle } from '../shared'

function SummaryRenderer({ data, theme }: { data: SummaryData; theme: ThemeConfig }) {
  if (!data.text.trim()) return null
  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <AlignLeft size={11} strokeWidth={2} /> : undefined}>
        个人简介
      </SectionTitle>
      <Prose text={data.text} />
    </section>
  )
}

function SummaryEditor({
  data,
  patch,
}: {
  data: SummaryData
  patch: (patch: Partial<SummaryData>) => void
}) {
  return (
    <AreaField
      label="简介正文"
      value={data.text}
      rows={6}
      placeholder="用 2–3 句话讲清楚：你是谁、做过什么、最拿得出手的成果。"
      hint="换行即分段。建议控制在 60–120 字。"
      onChange={(text) => patch({ text })}
    />
  )
}

export const summaryModule: BlockModule<SummaryData> = {
  type: 'summary',
  label: '个人简介',
  description: '一段话概括你的价值',
  icon: AlignLeft,
  createData: () => ({ text: '' }),
  Renderer: SummaryRenderer,
  Editor: SummaryEditor,
  isEmpty: (data) => !data.text.trim(),
}
