import { useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { AVATAR_ACCEPTED, AVATAR_MAX_INPUT_BYTES, processAvatar } from '../lib/imagePipeline'
import { bytesToMb } from '../lib/utils'

/**
 * 画布上的快捷头像入口：直接挂在模块工具条里，
 * 选中「基本信息」就能看到相机按钮，不用去右侧面板找。
 */
export function AvatarQuickAction({
  value,
  onChange,
}: {
  value: string | null
  onChange: (next: string | null) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!AVATAR_ACCEPTED.includes(file.type)) {
      setError('只支持 PNG / JPG / WebP')
      window.alert('只支持 PNG / JPG / WebP 图片')
      return
    }
    if (file.size > AVATAR_MAX_INPUT_BYTES) {
      window.alert(`图片太大（${bytesToMb(file.size)}），请小于 ${bytesToMb(AVATAR_MAX_INPUT_BYTES)}`)
      return
    }
    setBusy(true)
    try {
      onChange(await processAvatar(file))
    } catch {
      window.alert('这张图处理失败，换一张试试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <label
      className="blk-tool"
      title={value ? '更换头像' : '上传头像'}
      aria-label={value ? '更换头像' : '上传头像'}
      data-error={error ?? undefined}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
      <input
        type="file"
        accept={AVATAR_ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          void handle(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </label>
  )
}
