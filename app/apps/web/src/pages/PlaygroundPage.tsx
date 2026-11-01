import { Link, useParams } from 'react-router'
import type { PlaygroundKind } from '@site/content/types'
import { moduleByNumber, playground, site } from '../content'
import { Prose } from '../components/Prose'
import { Embed } from '../components/Embed'
import { Shell } from '../components/Shell'
import { moduleTree } from '../tree'
import { NotFound } from './NotFound'

export function PlaygroundPage({ kind }: { kind: PlaygroundKind }) {
  const { slug } = useParams()
  const p = slug ? playground(kind, slug) : undefined
  const m = p ? moduleByNumber(p.moduleNumber) : undefined
  if (!p || !m) return <NotFound />
  const lesson = p.lessonIds.flatMap((id) => site.lessons.filter((l) => l.id === id))[0]
  return (
    <Shell railRoot={`courses/${m.dir}`} rail={moduleTree(m, { playground: { kind, slug: p.slug } })} path={`${p.repoPath}/`} wide>
      <h1>{p.title}</h1>
      {lesson && <p className="aside">{kind === 'demo' ? 'Demo for' : 'Exercise for'} lesson {lesson.id}, <Link to={`/lessons/${lesson.slug}`}>{lesson.title}</Link>.</p>}
      <Prose html={p.html} />
      <Embed playground={p} />
    </Shell>
  )
}
