import { BadgeCheck } from 'lucide-react'
import type { CertificateItem, CertificatesData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AddRowButton, SubCard, TextField, moveItem } from '../../components/fields'
import { formatMonth, uid } from '../../lib/utils'
import { SectionTitle } from '../shared'
import { removeAt, updateAt } from '../helpers'

function CertificatesRenderer({ data, theme }: { data: CertificatesData; theme: ThemeConfig }) {
  const items = data.items.filter((item) => item.name.trim())
  if (items.length === 0) return null

  return (
    <section className="rblock">
      <SectionTitle icon={theme.showIcons ? <BadgeCheck size={11} strokeWidth={2} /> : undefined}>
        证书资质
      </SectionTitle>
      <ul className="rrows">
        {items.map((item) => (
          <li key={item.id}>
            <div className="rrow-main">
              <span className="rrow-title">{item.name}</span>
              {item.issuer.trim() ? <span className="rrow-sub">{item.issuer}</span> : null}
            </div>
            {item.date.trim() ? <span className="rrow-date">{formatMonth(item.date)}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

function CertificatesEditor({
  data,
  patch,
}: {
  data: CertificatesData
  patch: (patch: Partial<CertificatesData>) => void
}) {
  const setItems = (items: CertificateItem[]) => patch({ items })

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
            label="证书名称"
            value={item.name}
            onChange={(name) => setItems(updateAt(data.items, index, { name }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="颁发机构"
              value={item.issuer}
              onChange={(issuer) => setItems(updateAt(data.items, index, { issuer }))}
            />
            <TextField
              label="获得时间"
              type="month"
              value={item.date}
              onChange={(date) => setItems(updateAt(data.items, index, { date }))}
            />
          </div>
        </SubCard>
      ))}
      <AddRowButton
        onClick={() => setItems([...data.items, { id: uid(), name: '', date: '', issuer: '' }])}
      >
        添加证书
      </AddRowButton>
    </div>
  )
}

export const certificatesModule: BlockModule<CertificatesData> = {
  type: 'certificates',
  label: '证书资质',
  description: '职业资格与认证',
  icon: BadgeCheck,
  createData: () => ({ items: [] }),
  Renderer: CertificatesRenderer,
  Editor: CertificatesEditor,
  isEmpty: (data) => data.items.length === 0,
}
