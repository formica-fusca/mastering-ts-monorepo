import { Link } from 'react-router'
import type { Playground } from '@site/content/types'

export function PlaygroundList({ title, items }: { title: string; items: Playground[] }) {
  if (items.length === 0) return null
  return (
    <section className="pg-list">
      <h2>{title}</h2>
      <ul>
        {items.map((p) => (
          <li key={p.slug}>
            <Link to={`/${p.kind}s/${p.slug}`}>{p.title}</Link>
            <span className="muted"> · {p.slug}</span>
            {p.fabricatedNodeModules && <span className="tag">fabricated node_modules</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
