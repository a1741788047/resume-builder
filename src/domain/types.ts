/**
 * 领域层：简历文档的完整类型定义
 * 约束：本文件不得 import React / DOM 相关模块，保证规则与类型可独立单测。
 */

export type BlockType =
  | 'profile'
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'awards'
  | 'certificates'
  | 'languages'
  | 'custom'

export type ColumnId = 'main' | 'side'

export type LayoutMode = 'single' | 'sidebar-left' | 'sidebar-right'

export type TemplateId =
  | 'classic'
  | 'modern'
  | 'compact'
  | 'elegant'
  | 'bold'
  | 'minimal'
  | 'timeline'

export interface ThemeConfig {
  templateId: TemplateId
  accent: string
  fontFamily: 'system-sans' | 'system-serif'
  baseFontSizePx: number
  lineHeight: number
  density: 'compact' | 'normal' | 'loose'
  pagePaddingMm: number
  showIcons: boolean
}

export interface LayoutConfig {
  mode: LayoutMode
  sidebarWidthPct: number
  order: Record<ColumnId, string[]>
}

export interface ResumeDoc {
  schemaVersion: number
  id: string
  title: string
  updatedAt: string
  theme: ThemeConfig
  layout: LayoutConfig
  blocks: Record<string, Block>
}

export interface ProfileLink {
  id: string
  label: string
  url: string
}

export interface ProfileData {
  name: string
  headline: string
  avatarUrl: string | null
  email: string
  phone: string
  location: string
  links: ProfileLink[]
}

export interface SummaryData {
  text: string
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  location: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface ExperienceData {
  items: ExperienceItem[]
}

export interface EducationItem {
  id: string
  school: string
  degree: string
  major: string
  start: string
  end: string
  detail: string
}

export interface EducationData {
  items: EducationItem[]
}

export interface ProjectItem {
  id: string
  name: string
  role: string
  period: string
  description: string
  tech: string[]
  highlights: string[]
}

export interface ProjectsData {
  items: ProjectItem[]
}

export interface TagsGroup {
  id: string
  label: string
  items: string[]
}

export interface TagsData {
  groups: TagsGroup[]
}

export interface AwardItem {
  id: string
  title: string
  date: string
  issuer: string
}

export interface AwardsData {
  items: AwardItem[]
}

export interface CertificateItem {
  id: string
  name: string
  date: string
  issuer: string
}

export interface CertificatesData {
  items: CertificateItem[]
}

export interface LanguageItem {
  id: string
  name: string
  level: string
}

export interface LanguagesData {
  items: LanguageItem[]
}

export interface CustomItem {
  id: string
  text: string
}

export interface CustomData {
  title: string
  items: CustomItem[]
}

interface BlockBase<T extends BlockType, D> {
  id: string
  type: T
  /** false = 保留数据、编辑区半透明显示、不参与打印 */
  visible: boolean
  data: D
}

export type ProfileBlock = BlockBase<'profile', ProfileData>
export type SummaryBlock = BlockBase<'summary', SummaryData>
export type ExperienceBlock = BlockBase<'experience', ExperienceData>
export type EducationBlock = BlockBase<'education', EducationData>
export type ProjectsBlock = BlockBase<'projects', ProjectsData>
export type SkillsBlock = BlockBase<'skills', TagsData>
export type AwardsBlock = BlockBase<'awards', AwardsData>
export type CertificatesBlock = BlockBase<'certificates', CertificatesData>
export type LanguagesBlock = BlockBase<'languages', LanguagesData>
export type CustomBlock = BlockBase<'custom', CustomData>

export type Block =
  | ProfileBlock
  | SummaryBlock
  | ExperienceBlock
  | EducationBlock
  | ProjectsBlock
  | SkillsBlock
  | AwardsBlock
  | CertificatesBlock
  | LanguagesBlock
  | CustomBlock

export type BlockDataMap = {
  profile: ProfileData
  summary: SummaryData
  experience: ExperienceData
  education: EducationData
  projects: ProjectsData
  skills: TagsData
  awards: AwardsData
  certificates: CertificatesData
  languages: LanguagesData
  custom: CustomData
}

export type DataOf<T extends BlockType> = BlockDataMap[T]
