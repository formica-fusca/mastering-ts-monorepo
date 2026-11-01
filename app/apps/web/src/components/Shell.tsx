import type { ReactNode } from 'react'
import type { ModuleRef } from '@site/content/types'
import { Stepper } from './Stepper'
import { PageToc } from './PageToc'
import { Tree } from './Tree'
import { moduleTree, type Focus } from '../tree'

/**
 * The reading column. Module stepper on the left edge, the page's own table of
 * contents on the right edge; on phones both give way to an inline module tree.
 */
export function Shell({ module: m, focus = {}, path, title, wide = false, children }: { module?: ModuleRef; focus?: Focus; path?: string; title?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="shell">
      {m && (
        <details className="module-inline">
          <summary>In this module</summary>
          <Tree root={`courses/${m.dir ?? ''}`} nodes={moduleTree(m, focus, { collapsePlaygrounds: true })} compact />
        </details>
      )}
      <div className={`reading ${wide ? 'has-playground' : ''}`}>
        {path && <p className="path">{path}</p>}
        {children}
      </div>
      {m && <Stepper module={m} focus={focus} />}
      {title && <PageToc title={title} />}
    </div>
  )
}
