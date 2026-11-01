import { Link } from 'react-router'
import { site } from '../content'

/** The repo path above a title, with every segment that has a page linked to it. */
export function PathCrumbs({ path }: { path: string }) {
  const trailingSlash = path.endsWith('/')
  const parts = path.replace(/\/$/, '').split('/')
  const routeFor = (i: number): string | null => {
    const [root, dir, third, fourth] = parts
    if (root !== 'courses') return null
    if (i === 0) return '/'
    const m = site.modules.find((mod) => mod.dir === dir)
    if (!m) return null
    if (i === 1) return `/modules/${m.number}`
    if (i === 2) {
      if (third === 'demos' || third === 'exercises') return `/modules/${m.number}/${third}`
      if (third.endsWith('.md')) return `/lessons/${third.replace(/\.md$/, '')}`
      return null
    }
    if (i === 3 && (third === 'demos' || third === 'exercises')) {
      if (fourth === 'README.md') return `/modules/${m.number}/${third}`
      return `/${third}/${fourth}`
    }
    return null
  }
  return (
    <p className="path" aria-label="Path in the repository">
      {parts.map((seg, i) => {
        const to = routeFor(i)
        const last = i === parts.length - 1
        const text = seg + (last && !trailingSlash ? '' : '/')
        return <span key={i}>{to ? <Link to={to}>{text}</Link> : text}</span>
      })}
    </p>
  )
}
