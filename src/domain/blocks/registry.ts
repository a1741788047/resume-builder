import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Block, BlockType, ThemeConfig } from '../types'
import { uid } from '../../lib/utils'
import { profileModule } from '../../blocks/Profile'
import { summaryModule } from '../../blocks/Summary'
import { experienceModule } from '../../blocks/Experience'
import { educationModule } from '../../blocks/Education'
import { projectsModule } from '../../blocks/Projects'
import { skillsModule } from '../../blocks/Skills'
import { awardsModule } from '../../blocks/Awards'
import { certificatesModule } from '../../blocks/Certificates'
import { languagesModule } from '../../blocks/Languages'
import { customModule } from '../../blocks/Custom'

/**
 * 模块契约。新增一个简历模块 = 新建 blocks/Xxx/index.tsx + 在下方注册表加一行。
 * 画布、仓库、检查器、打印输出全部只认这张表，任何地方不得出现 switch(type)。
 */
export interface BlockModule<D = any> {
  type: BlockType
  label: string
  description: string
  icon: LucideIcon
  createData: () => D
  Renderer: ComponentType<{ data: D; theme: ThemeConfig }>
  Editor: ComponentType<{ data: D; patch: (patch: Partial<D>) => void }>
  /** 可选：画布模块工具条里的额外快捷操作（如「上传头像」），只在编辑器里出现 */
  CanvasAction?: ComponentType<{ data: D; patch: (patch: Partial<D>) => void }>
  isEmpty: (data: D) => boolean
}

export const BLOCK_REGISTRY: Record<BlockType, BlockModule<any>> = {
  profile: profileModule,
  summary: summaryModule,
  experience: experienceModule,
  education: educationModule,
  projects: projectsModule,
  skills: skillsModule,
  certificates: certificatesModule,
  awards: awardsModule,
  languages: languagesModule,
  custom: customModule,
}

export const PALETTE_TYPES: BlockType[] = [
  'profile',
  'summary',
  'experience',
  'projects',
  'education',
  'skills',
  'certificates',
  'awards',
  'languages',
  'custom',
]

export function createBlock(type: BlockType): Block {
  return {
    id: uid(),
    type,
    visible: true,
    data: BLOCK_REGISTRY[type].createData(),
  } as Block
}

export function blockLabel(type: BlockType): string {
  return BLOCK_REGISTRY[type].label
}

export function blockIsEmpty(block: Block): boolean {
  const mod = BLOCK_REGISTRY[block.type]
  try {
    return mod.isEmpty(block.data)
  } catch {
    return false
  }
}
