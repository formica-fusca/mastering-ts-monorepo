import { Link } from 'react-router'

export interface TreeNode {
  /** Monospace label, as it would appear in `ls`: "1.2-node-modules-resolution.md", "demos/". */
  label: string
  /** Optional human title shown after the label. */
  title?: string
  to?: string
  /** Planned / not yet delivered. */
  dim?: boolean
  /** The file the visitor is reading. */
  current?: boolean
  /** Short trailing note, e.g. "5 of 5 lessons". */
  note?: string
  /** Called when the pointer enters the line or it takes focus; lets a card unfold a node on hover. */
  onEnter?: () => void
  /** Makes the label a button instead of a link; for pickers that act in place. */
  onSelect?: () => void
  children?: TreeNode[]
}

/**
 * Renders a directory tree with the connectors `tree` prints. The connectors are real
 * text, so the structure survives copy-paste and screen readers read it as a list.
 */
export function Tree({ root, nodes, compact = false }: { root?: string; nodes: TreeNode[]; compact?: boolean }) {
  return (
    <div className={`tree ${compact ? 'tree-compact' : ''}`} role="tree">
      {root && <div className="tree-root">{root}</div>}
      <Branch nodes={nodes} prefix="" depth={0} />
    </div>
  )
}

function Branch({ nodes, prefix, depth }: { nodes: TreeNode[]; prefix: string; depth: number }) {
  return (
    <ul role="group">
      {nodes.map((n, i) => {
        const last = i === nodes.length - 1
        const connector = last ? '└── ' : '├── '
        const childPrefix = prefix + (last ? '    ' : '│   ')
        return (
          <li key={n.label + i} role="treeitem" aria-current={n.current ? 'page' : undefined} className={`depth-${depth} ${n.dim ? 'dim' : ''} ${n.current ? 'current' : ''}`}>
            <span className="tree-line" onMouseEnter={n.onEnter} onFocus={n.onEnter}>
              <span className="tree-head">
                <span className="tree-prefix" aria-hidden="true">{prefix}{connector}</span>
                {n.onSelect
                  ? <button type="button" className="tree-label" onClick={n.onSelect} aria-pressed={n.current || undefined}>{n.label}</button>
                  : n.to && !n.dim ? <Link to={n.to} className="tree-label">{n.label}</Link> : <span className="tree-label">{n.label}</span>}
                {n.note && <>{'  '}<span className="tree-note">{n.note}</span></>}
              </span>
              {n.title && <span className="tree-title">{n.title}</span>}
            </span>
            {n.children && n.children.length > 0 && <Branch nodes={n.children} prefix={childPrefix} depth={depth + 1} />}
          </li>
        )
      })}
    </ul>
  )
}
