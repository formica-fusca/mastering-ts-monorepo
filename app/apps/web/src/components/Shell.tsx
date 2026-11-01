import type { ReactNode } from 'react'
import type { ModuleRef } from '@site/content/types'
import { Stepper } from './Stepper'
import { Tree } from './Tree'
import { moduleTree, type Focus } from '../tree'

/** The reading column, with the module's stepper on the right edge (and an inline tree on phones). */
export function Shell({ module: m, focus = {}, path, wide = false, children }: { module?: ModuleRef; focus?: Focus; path?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="shell">
      {m && (
        <details className="module-inline">
          <summary>In this module</summary>
          <Tree root={`courses/${m.dir ?? ''}`} nodes={moduleTree(m, focus, { expandPlaygrounds: true })} compact />
        </details>
      )}
      <div className={`reading ${wide ? 'has-playground' : ''}`}>
        {path && <p className="path">{path}</p>}
        {children}
      </div>
      {m && <Stepper module={m} focus={focus} />}
    </div>
  )
}
