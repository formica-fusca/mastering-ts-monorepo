import type { ReactNode } from 'react'
import type { ModuleRef } from '@site/content/types'
import { ProgramStepper, Stepper } from './Stepper'
import { PageToc } from './PageToc'
import { Tree } from './Tree'
import { PathCrumbs } from './PathCrumbs'
import { moduleTree, programTree, type Focus } from '../tree'

/** What the left edge lists: the siblings of the current page, or nothing. */
export type Nav = 'program' | 'module' | 'none'

/**
 * The reading column. Siblings of the page on the left edge, the page's own table of
 * contents on the right edge; on phones the left edge gives way to an inline tree.
 */
export function Shell({ module: m, focus = {}, nav = m ? 'module' : 'none', path, title, wide = false, children }: { module?: ModuleRef; focus?: Focus; nav?: Nav; path?: string; title?: string; wide?: boolean; children: ReactNode }) {
  const inline = nav === 'program' && m
    ? { summary: 'In this program', root: 'modules/', nodes: programTree(m.number, { unfolded: m.number }) }
    : nav === 'module' && m
      ? { summary: 'In this module', root: `modules/${m.dir ?? ''}`, nodes: moduleTree(m, focus, { collapsePlaygrounds: true }) }
      : null
  return (
    <div className="shell">
      {inline && (
        <details className="module-inline">
          <summary>{inline.summary}</summary>
          <Tree root={inline.root} nodes={inline.nodes} compact />
        </details>
      )}
      <div className={`reading ${wide ? 'has-playground' : ''}`}>
        {path && <PathCrumbs path={path} />}
        {children}
      </div>
      {nav === 'program' && m && <ProgramStepper current={m.number} />}
      {nav === 'module' && m && <Stepper module={m} focus={focus} />}
      {title && <PageToc title={title} />}
    </div>
  )
}
