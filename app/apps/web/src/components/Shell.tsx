import type { ReactNode } from 'react'
import { Tree, type TreeNode } from './Tree'

/** Two columns: the module's tree on the left as the place marker, the reading column on the right. */
export function Shell({ railRoot, rail, path, wide = false, children }: { railRoot?: string; rail?: TreeNode[]; path?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`shell ${rail ? 'with-rail' : ''}`}>
      {rail && (
        <aside className="rail" aria-label="Where you are in the repository">
          <Tree root={railRoot} nodes={rail} compact />
        </aside>
      )}
      <div className={`reading ${wide ? 'has-playground' : ''}`}>
        {path && <p className="path">{path}</p>}
        {children}
      </div>
    </div>
  )
}
