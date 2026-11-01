import { useParams } from 'react-router'
import { moduleByNumber } from '../content'
import { Prose } from '../components/Prose'
import { Shell } from '../components/Shell'
import { moduleTree } from '../tree'
import { NotFound } from './NotFound'

export function ExercisesIndexPage() {
  const { number } = useParams()
  const m = moduleByNumber(Number(number))
  if (!m?.exercisesIndexHtml) return <NotFound />
  return (
    <Shell railRoot={`courses/${m.dir}`} rail={moduleTree(m, { playground: { kind: 'exercise', slug: '' } })} path={`courses/${m.dir}/exercises/README.md`}>
      <Prose html={m.exercisesIndexHtml} />
    </Shell>
  )
}
