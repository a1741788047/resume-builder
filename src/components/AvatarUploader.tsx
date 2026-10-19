import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { processAvatar, AVATAR_ACCEPTED, AVATAR_MAX_INPUT_BYTES } from '../lib/imagePipeline'
import { bytesToMb } from '../lib/utils'
import { Button } from './ui'

export function AvatarUploader({
  value,
  onChange,
}: {
  value: string | null
  onChange: (next: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!AVATAR_ACCEPTED.includes(file.type)) {
      setError('只支持 PNG / JPG / WebP 图片')
      return
    }
    if (file.size > AVATAR_MAX_INPUT_BYTES) {
      setError(`图片太大（${bytesToMb(file.size)}），请小于 ${bytesToMb(AVATAR_MAX_INPUT_BYTES)}`)
      return
    }
    setBusy(true)
    try {
      const dataUrl = await processAvatar(file)
      onChange(dataUrl)
    } catch {
      setError('这张图处理失败，换一张试试')
    } finally {
      setBusy(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    void handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <span className="mb-1 block text-[12px] text-ink2">头像</span>
      <div className="flex items-center gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          className={[
            'relative flex h-[68px] w-[68px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full',
            'border border-dashed transition-colors',
            dragging ? 'border-brand bg-[#eef4ff]' : 'border-line2 bg-[#f7f6f3] hover:border-brand/50',
          ].join(' ')}
        >
          {value ? (
            <img src={value} alt="头像预览" className="h-full w-full object-cover" />
          ) : busy ? (
            <Loader2 size={18} className="animate-spin text-ink3" />
          ) : (
            <ImagePlus size={18} className="text-ink3" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {value ? '替换图片' : '上传图片'}
            </Button>
            {value && (
              <Button size="sm" variant="ghost" onClick={() => onChange(null)} disabled={busy}>
                <Trash2 size={12} />
                移除
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink3">
            点击或拖入图片，自动裁成方形并压缩
          </p>
        </div>
      </div>

      {error && <p className="mt-1.5 text-[11.5px] text-[#b42318]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
