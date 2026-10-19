import { useState } from 'react'
import { Printer } from 'lucide-react'
import { exportPdf } from '../../lib/print'
import { useResumeStore } from '../../store/useResumeStore'
import { Button, Modal, Switch } from '../../components/ui'

const STEPS = [
  '点击下方「打开打印窗口」',
  '在打印窗口中把「目标打印机」改为「另存为 PDF」',
  '边距保持「默认」，并勾选「背景图形」，然后保存',
]

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useResumeStore((s) => s.doc.theme)
  const [ats, setAts] = useState(false)
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true)
    // 必须先关掉弹窗再唤起打印，否则弹窗本身会被印进 PDF
    onClose()
    await new Promise((resolve) => setTimeout(resolve, 180))
    try {
      await exportPdf({ paddingMm: theme.pagePaddingMm, ats })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title="导出为 PDF"
      description="使用浏览器原生打印管道，导出的是可选中、可被招聘系统解析的矢量文字。"
      onClose={onClose}
      width={480}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => void run()} disabled={busy}>
            <Printer size={14} />
            {busy ? '准备中…' : '打开打印窗口'}
          </Button>
        </>
      }
    >
      <ol className="mb-4 space-y-2">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink2">
            <span className="mt-[1px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full bg-[#f2f1ed] text-[10.5px] text-ink2">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="rounded-[10px] border border-line bg-[#fbfaf8] px-3.5 py-3">
        <Switch checked={ats} onChange={setAts} label="ATS 安全模式（单栏纯文字）" />
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink3">
          双栏排版在部分招聘系统中会打乱解析顺序。投递大型企业或使用简历筛选系统时，建议开启：强制单栏输出、去掉色块与图标，侧栏内容会排在正文之后。
        </p>
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-ink3">
        当前页边距 {theme.pagePaddingMm}mm，纸型 A4。页边距可在右侧「全局设置」里调整。
      </p>
    </Modal>
  )
}
