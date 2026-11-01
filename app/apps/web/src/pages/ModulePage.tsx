import { Link, useParams } from 'react-router'
import { moduleByNumber, playgroundsFor } from '../content'
import { Shell } from '../components/Shell'
import { moduleTree } from '../tree'
import { NotFound } from './NotFound'

export function ModulePage() {
  const { number } = useParams()
  const m = moduleByNumber(Number(number))
  if (!m) return <NotFound />
  const demos = playgroundsFor('demo', m.demos)
  const exercises = playgroundsFor('exercise', m.exercises)
  return (
    <Shell railRoot={`courses/${m.dir ?? ''}`} rail={moduleTree(m, {}, { expandPlaygrounds: true })} path={`courses/${m.dir ?? `${m.number}-…`}/`}>
      <h1>Module {m.number}. {m.title}</h1>
      <h2>Lessons</h2>
      <ol className="lessons">
        {m.lessons.map((l) => (
          <li key={l.id} className={l.files.length ? '' : 'dim'}>
            <span className="lesson-num">{l.id}</span>
            <span>
              {l.files.length === 0 && <>{l.title}<span className="aside-inline"> not yet taught</span></>}
              {l.files.map((f, i) => (
                <span key={f}>{i > 0 && <span className="sep"> and </span>}<Link to={`/lessons/${f}`}>{i === 0 ? l.title : `${f.replace(/^\d+\.\d+-/, '')}`}</Link></span>
              ))}
            </span>
          </li>
        ))}
      </ol>
      {m.exercisesIndexHtml && <p><Link to={`/modules/${m.number}/exercises`}>Exercise index and status for this module</Link></p>}
      {demos.length > 0 && (
        <>
          <h2 id="demos">Demos</h2>
          <ul className="plain">
            {demos.map((p) => <li key={p.slug}><Link to={`/demos/${p.slug}`}>{p.title}</Link> <code className="dimcode">{p.slug}/</code></li>)}
          </ul>
        </>
      )}
      {exercises.length > 0 && (
        <>
          <h2 id="exercises">Exercises</h2>
          <ul className="plain">
            {exercises.map((p) => <li key={p.slug}><Link to={`/exercises/${p.slug}`}>{p.title}</Link> <code className="dimcode">{p.slug}/</code></li>)}
          </ul>
        </>
      )}
    </Shell>
  )
}
