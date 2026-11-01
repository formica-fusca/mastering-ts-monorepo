import { Link, useParams } from 'react-router'
import type { PlaygroundKind } from '@site/content/types'
import { playground, site } from '../content'
import { Prose } from '../components/Prose'
import { Embed } from '../components/Embed'
import { NotFound } from './NotFound'

export function PlaygroundPage({ kind }: { kind: PlaygroundKind }) {
  const { slug } = useParams()
  const p = slug ? playground(kind, slug) : undefined
  if (!p) return <NotFound />
  const lessons = p.lessonIds.flatMap((id) => site.lessons.filter((l) => l.id === id)).slice(0, 1)
  return (
    <>
      <nav className="crumbs">
        <Link to="/">Program</Link> / <Link to={`/modules/${p.moduleNumber}`}>Module {p.moduleNumber}</Link>
        {lessons.map((l) => <span key={l.slug}> / <Link to={`/lessons/${l.slug}`}>Lesson {l.id}</Link></span>)}
        {' '}/ {kind === 'demo' ? 'Demo' : 'Exercise'}
      </nav>
      <h1>{p.title}</h1>
      <p className="muted small"><code>{p.repoPath}</code></p>
      <Prose html={p.html} />
      <Embed playground={p} />
    </>
  )
}
