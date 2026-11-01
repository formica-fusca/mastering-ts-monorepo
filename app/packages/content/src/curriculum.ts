import type { LessonRef, ModuleRef } from './types.js'

/** Parses references/curriculum.md into module and lesson titles. */
export function parseCurriculum(markdown: string): Pick<ModuleRef, 'number' | 'title' | 'lessons'>[] {
  const modules: Pick<ModuleRef, 'number' | 'title' | 'lessons'>[] = []
  let current: Pick<ModuleRef, 'number' | 'title' | 'lessons'> | null = null
  for (const raw of markdown.split('\n')) {
    const line = raw.trim()
    const mod = /^## Module (\d+)\s+[—-]+\s+(.+)$/.exec(line)
    if (mod) {
      current = { number: Number(mod[1]), title: mod[2].trim(), lessons: [] }
      modules.push(current)
      continue
    }
    if (line.startsWith('## ')) { current = null; continue }
    const lesson = /^(\d+\.\d+)\s+(.+)$/.exec(line)
    if (lesson && current) {
      const ref: LessonRef = { id: lesson[1], title: lesson[2].trim(), files: [] }
      current.lessons.push(ref)
    }
  }
  return modules
}
