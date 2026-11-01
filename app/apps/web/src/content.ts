import program from 'virtual:content'
import type { LessonPage, ModuleRef, Playground } from '@site/content/types'

export const site = program

export const moduleByNumber = (n: number): ModuleRef | undefined => site.modules.find((m) => m.number === n)
export const lessonBySlug = (slug: string): LessonPage | undefined => site.lessons.find((l) => l.slug === slug)
export const playground = (kind: Playground['kind'], slug: string): Playground | undefined =>
  site.playgrounds.find((p) => p.kind === kind && p.slug === slug)
export const playgroundsFor = (kind: Playground['kind'], slugs: string[]): Playground[] =>
  slugs.map((s) => playground(kind, s)).filter((p): p is Playground => Boolean(p))
