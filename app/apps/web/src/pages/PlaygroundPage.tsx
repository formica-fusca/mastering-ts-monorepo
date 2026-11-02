import { useParams } from 'react-router'
import type { PlaygroundKind } from '@site/content/types'
import { moduleByNumber, playground } from '../content'
import { Prose } from '../components/Prose'
import { Embed } from '../components/Embed'
import { Shell } from '../components/Shell'
import { NotFound } from './NotFound'

export function PlaygroundPage({ kind }: { kind: PlaygroundKind }) {
  const { slug } = useParams()
  const p = slug ? playground(kind, slug) : undefined
  const m = p ? moduleByNumber(p.moduleNumber) : undefined
  if (!p || !m) return <NotFound />
  return (
    <Shell module={m} nav="none" focus={{ playground: { kind, slug: p.slug } }} path={`${p.repoPath}/`} title={p.title} wide>
      <h1>{p.title}</h1>
      <Prose html={p.html} />
      <Embed playground={p} />
    </Shell>
  )
}
