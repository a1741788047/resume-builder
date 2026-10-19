import { Link2, Mail, MapPin, Phone, Trash2, UserRound } from 'lucide-react'
import type { ProfileData, ThemeConfig } from '../../domain/types'
import type { BlockModule } from '../../domain/blocks/registry'
import { AvatarUploader } from '../../components/AvatarUploader'
import { AvatarQuickAction } from '../../components/AvatarQuickAction'
import { AddRowButton, TextField } from '../../components/fields'
import { IconButton } from '../../components/ui'
import { uid } from '../../lib/utils'
import { updateAt, removeAt } from '../helpers'

function ProfileRenderer({ data, theme }: { data: ProfileData; theme: ThemeConfig }) {
  const contact = [
    { icon: Mail, value: data.email },
    { icon: Phone, value: data.phone },
    { icon: MapPin, value: data.location },
  ].filter((row) => row.value.trim() !== '')

  const links = data.links.filter((link) => link.label.trim() || link.url.trim())

  return (
    <div className="rprofile">
      {data.avatarUrl ? <img className="ravatar" src={data.avatarUrl} alt={data.name} /> : null}
      <div className="rprofile-body">
        <div className="rname">{data.name || '你的姓名'}</div>
        {data.headline.trim() ? <div className="rheadline">{data.headline}</div> : null}
        <ul className="rcontact">
          {contact.map((row) => (
            <li key={row.value}>
              {theme.showIcons ? <row.icon className="ricon" size={10} strokeWidth={1.9} /> : null}
              <span>{row.value}</span>
            </li>
          ))}
          {links.map((link) => (
            <li key={link.id}>
              {theme.showIcons ? <Link2 className="ricon" size={10} strokeWidth={1.9} /> : null}
              <span>
                {link.label.trim() ? `${link.label}：` : ''}
                {link.url}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ProfileEditor({
  data,
  patch,
}: {
  data: ProfileData
  patch: (patch: Partial<ProfileData>) => void
}) {
  return (
    <div className="space-y-3">
      <AvatarUploader value={data.avatarUrl} onChange={(avatarUrl) => patch({ avatarUrl })} />
      <TextField label="姓名" value={data.name} onChange={(name) => patch({ name })} placeholder="张三" />
      <TextField
        label="一句话定位"
        value={data.headline}
        onChange={(headline) => patch({ headline })}
        placeholder="前端工程师 · 4 年经验"
      />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="邮箱" type="email" value={data.email} onChange={(email) => patch({ email })} />
        <TextField label="电话" type="tel" value={data.phone} onChange={(phone) => patch({ phone })} />
      </div>
      <TextField label="城市" value={data.location} onChange={(location) => patch({ location })} />

      <div>
        <span className="mb-1 block text-[12px] text-ink2">个人链接</span>
        <div className="space-y-2">
          {data.links.map((link, index) => (
            <div key={link.id} className="flex items-center gap-1.5">
              <input
                value={link.label}
                placeholder="GitHub"
                onChange={(e) => patch({ links: updateAt(data.links, index, { label: e.target.value }) })}
                className="w-[74px] shrink-0 rounded-[7px] border border-line2 px-2 py-1.5 text-[12.5px] focus:border-brand focus:outline-none"
              />
              <input
                value={link.url}
                placeholder="github.com/you"
                onChange={(e) => patch({ links: updateAt(data.links, index, { url: e.target.value }) })}
                className="min-w-0 flex-1 rounded-[7px] border border-line2 px-2 py-1.5 text-[12.5px] focus:border-brand focus:outline-none"
              />
              <IconButton
                label="删除链接"
                onClick={() => patch({ links: removeAt(data.links, index) })}
                className="hover:text-[#b42318]"
              >
                <Trash2 size={13} />
              </IconButton>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <AddRowButton
            disabled={data.links.length >= 4}
            onClick={() => patch({ links: [...data.links, { id: uid(), label: '', url: '' }] })}
          >
            添加链接
          </AddRowButton>
        </div>
      </div>
    </div>
  )
}

function ProfileCanvasAction({
  data,
  patch,
}: {
  data: ProfileData
  patch: (patch: Partial<ProfileData>) => void
}) {
  return <AvatarQuickAction value={data.avatarUrl} onChange={(avatarUrl) => patch({ avatarUrl })} />
}

export const profileModule: BlockModule<ProfileData> = {
  type: 'profile',
  label: '基本信息',
  description: '姓名、头像与联系方式',
  icon: UserRound,
  createData: () => ({
    name: '',
    headline: '',
    avatarUrl: null,
    email: '',
    phone: '',
    location: '',
    links: [],
  }),
  Renderer: ProfileRenderer,
  Editor: ProfileEditor,
  CanvasAction: ProfileCanvasAction,
  isEmpty: (data) => !data.name.trim() && !data.headline.trim() && !data.email.trim(),
}
