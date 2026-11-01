import { Link, useParams } from 'react-router'
import { moduleByNumber, playgroundsFor } from '../content'
import { Prose } from '../components/Prose'
import { Shell } from '../components/Shell'
import { NotFound } from './NotFound'

export function ExercisesIndexPage() {
  const { number } = useParams()
  const m = moduleByNumber(Number(number))
  if (!m || !m.dir) return <NotFound />
  const exercises = playgroundsFor('exercise', m.exercises)
  return (
    <Shell module={m} focus={{ playground: { kind: 'exercise', slug: '' } }} path={`modules/${m.dir}/exercises/`} title={`Exercises of Module ${m.number}`}>
      <h1>Exercises of Module {m.number}</h1>
      <ul className="index">
        {exercises.map((p) => (
          <li key={p.slug}>
            <Link to={`/exercises/${p.slug}`}>{p.title}</Link>
            <span className="index-meta"><code className="dimcode">{p.slug}/</code></span>
          </li>
        ))}
      </ul>
      {m.exercisesIndexHtml && (
        <>
          <h2>Index and status, as kept in the repository</h2>
          <p className="aside">Rendered from <code>exercises/README.md</code>.</p>
          <Prose html={m.exercisesIndexHtml} />
        </>
      )}
    </Shell>
  )
}
