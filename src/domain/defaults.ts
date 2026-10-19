import { SCHEMA_VERSION } from './constants'
import { normalizeLayout } from './layout'
import type { Block, BlockType, ResumeDoc, ThemeConfig } from './types'
import { uid } from '../lib/utils'

export const DEFAULT_THEME: ThemeConfig = {
  templateId: 'modern',
  accent: '#2563EB',
  fontFamily: 'system-sans',
  baseFontSizePx: 13.5,
  lineHeight: 1.62,
  density: 'normal',
  pagePaddingMm: 15,
  showIcons: true,
}

export function createEmptyDoc(): ResumeDoc {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uid(),
    title: '我的简历',
    updatedAt: new Date().toISOString(),
    theme: { ...DEFAULT_THEME },
    layout: { mode: 'single', sidebarWidthPct: 32, order: { main: [], side: [] } },
    blocks: {},
  }
}

interface Seed {
  type: BlockType
  column: 'main' | 'side'
  data: Record<string, unknown>
}

const SEED_BLOCKS: Seed[] = [
  {
    type: 'profile',
    column: 'side',
    data: {
      name: '陈亦舟',
      headline: '前端工程师 · 4 年经验',
      avatarUrl: null,
      email: 'chenyizhou@example.com',
      phone: '138 0000 0000',
      location: '深圳',
      links: [
        { id: uid(), label: 'GitHub', url: 'github.com/chenyizhou' },
        { id: uid(), label: '博客', url: 'chenyizhou.dev' },
      ],
    },
  },
  {
    type: 'summary',
    column: 'main',
    data: {
      text: '4 年前端开发经验，主导过 3 个百万级 DAU 产品的性能重构，把首屏时间从 3.2s 降到 1.1s。擅长复杂交互与工程化体系建设，习惯用数据验证每一次优化。',
    },
  },
  {
    type: 'experience',
    column: 'main',
    data: {
      items: [
        {
          id: uid(),
          company: '深圳市云帆科技有限公司',
          role: '高级前端工程师',
          location: '深圳',
          start: '2023-04',
          end: '',
          current: true,
          bullets: [
            '负责商家后台 12 个业务模块的架构升级，抽象出统一的表单引擎，新页面开发周期从 5 天缩短到 1.5 天。',
            '主导首屏性能专项：路由级预加载 + 资源分包 + 关键 CSS 内联，LCP 由 3.2s 降至 1.1s，跳出率下降 18%。',
            '搭建前端监控与错误上报体系，线上 JS 错误率由 1.4‰ 降至 0.2‰，平均定位耗时从 40 分钟降到 8 分钟。',
          ],
        },
        {
          id: uid(),
          company: '广州拾光网络科技',
          role: '前端工程师',
          location: '广州',
          start: '2021-07',
          end: '2023-03',
          current: false,
          bullets: [
            '独立完成移动端 H5 商城从 0 到 1 的搭建，日订单峰值 2.4 万单，页面可用性 99.95%。',
            '沉淀 30+ 通用业务组件并输出文档，团队重复代码量下降约 35%。',
          ],
        },
      ],
    },
  },
  {
    type: 'projects',
    column: 'main',
    data: {
      items: [
        {
          id: uid(),
          name: '可视化低代码搭建平台',
          role: '前端负责人',
          period: '2024.03 — 2024.09',
          description: '面向运营的活动页可视化搭建系统，支持拖拽编排、实时预览与一键发布。',
          tech: ['React', 'TypeScript', 'dnd-kit', 'Canvas'],
          highlights: [
            '设计基于 schema 的页面协议，实现编辑态与渲染态同源，发布包体积减少 40%。',
            '上线后承接全公司 70% 的运营活动页，平均搭建耗时从 2 天降至 40 分钟。',
          ],
        },
      ],
    },
  },
  {
    type: 'education',
    column: 'side',
    data: {
      items: [
        {
          id: uid(),
          school: '华南理工大学',
          degree: '本科',
          major: '软件工程',
          start: '2017-09',
          end: '2021-06',
          detail: 'GPA 3.6 / 4.0，校级奖学金两次',
        },
      ],
    },
  },
  {
    type: 'skills',
    column: 'side',
    data: {
      groups: [
        { id: uid(), label: '语言', items: ['TypeScript', 'JavaScript', 'HTML/CSS'] },
        { id: uid(), label: '框架', items: ['React', 'Vue 3', 'Node.js'] },
        { id: uid(), label: '工程化', items: ['Vite', 'Webpack', 'CI/CD'] },
      ],
    },
  },
  {
    type: 'certificates',
    column: 'side',
    data: {
      items: [{ id: uid(), name: '软件设计师（中级）', date: '2022-11', issuer: '工信部' }],
    },
  },
  {
    type: 'languages',
    column: 'side',
    data: { items: [{ id: uid(), name: '英语', level: 'CET-6 · 可流畅读写技术文档' }] },
  },
]

export function createDemoDoc(): ResumeDoc {
  const doc = createEmptyDoc()
  doc.title = '陈亦舟-前端工程师'
  doc.theme = { ...DEFAULT_THEME, templateId: 'modern' }
  doc.layout.mode = 'sidebar-right'

  const blocks: Record<string, Block> = {}
  const order = { main: [] as string[], side: [] as string[] }

  for (const seed of SEED_BLOCKS) {
    const id = uid()
    blocks[id] = { id, type: seed.type, visible: true, data: seed.data } as unknown as Block
    order[seed.column].push(id)
  }

  doc.blocks = blocks
  doc.layout.order = order
  doc.layout = normalizeLayout(doc.layout, doc.blocks)
  return doc
}
