import type { ModuleRef, Playground } from '@site/content/types'
import { playgroundsFor, site } from './content'
import type { TreeNode } from './components/Tree'

export interface Focus {
  lessonSlug?: string
  playground?: { kind: Playground['kind']; slug: string }
}

/** The module as it sits on disk: lesson files, then demos/ and exercises/. */
export function moduleTree(m: ModuleRef, focus: Focus = {}, opts: { expandPlaygrounds?: boolean; titles?: boolean } = {}): TreeNode[] {
  const nodes: TreeNode[] = []
  for (const l of m.lessons) {
    if (l.files.length === 0) {
      nodes.push({ label: `${l.id}`, title: l.title, dim: true })
      continue
    }
    for (const f of l.files) {
      nodes.push({ label: `${f}.md`, title: opts.titles === false ? undefined : l.title, to: `/lessons/${f}`, current: focus.lessonSlug === f })
    }
  }
  const group = (kind: Playground['kind'], slugs: string[]) => {
    if (slugs.length === 0) return
    const dir = kind === 'demo' ? 'demos/' : 'exercises/'
    const expanded = opts.expandPlaygrounds || focus.playground?.kind === kind
    nodes.push({
      label: dir,
      to: m.dir ? `/modules/${m.number}#${kind}s` : undefined,
      note: expanded ? undefined : String(slugs.length),
      children: expanded
        ? playgroundsFor(kind, slugs).map((p) => ({
            label: `${p.slug}/`, to: `/${kind}s/${p.slug}`,
            current: focus.playground?.kind === kind && focus.playground.slug === p.slug,
          }))
        : undefined,
    })
  }
  group('demo', m.demos)
  group('exercise', m.exercises)
  return nodes
}

/** The whole program as the courses/ directory. */
export function programTree(): TreeNode[] {
  return site.modules.map((m) => ({
    label: m.dir ? `${m.dir}/` : `${m.number}-${slugify(m.title)}/`,
    title: m.title,
    to: m.delivered > 0 ? `/modules/${m.number}` : undefined,
    dim: m.delivered === 0,
    note: m.delivered === 0 ? 'not started' : `${m.delivered} of ${m.lessons.length} lessons`,
    children: moduleTree(m, {}, { titles: true }),
  }))
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
