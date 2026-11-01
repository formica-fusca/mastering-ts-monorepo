import { Link, useParams } from 'react-router'
import { moduleByNumber, playgroundsFor } from '../content'
import { PlaygroundList } from '../components/PlaygroundList'
import { NotFound } from './NotFound'

export function ModulePage() {
  const { number } = useParams()
  const m = moduleByNumber(Number(number))
  if (!m) return <NotFound />
  return (
    <>
      <nav className="crumbs"><Link to="/">Program</Link> / Module {m.number}</nav>
      <h1>Module {m.number} — {m.title}</h1>
      <ol className="lesson-list big">
        {m.lessons.map((l) => (
          <li key={l.id} className={l.files.length ? '' : 'planned'}>
            <span className="lesson-id">{l.id}</span>
            {l.files.length ? (
              <span>
                {l.files.map((f, i) => (
                  <span key={f}>{i > 0 && ' · '}<Link to={`/lessons/${f}`}>{i === 0 ? l.title : f.replace(/^\d+\.\d+-/, '')}</Link></span>
                ))}
              </span>
            ) : <span>{l.title} <span className="muted small">(not yet delivered)</span></span>}
          </li>
        ))}
      </ol>
      {m.exercisesIndexHtml && <p><Link to={`/modules/${m.number}/exercises`}>Exercise index and status for this module →</Link></p>}
      <PlaygroundList title="Demos" items={playgroundsFor('demo', m.demos)} />
      <PlaygroundList title="Exercises" items={playgroundsFor('exercise', m.exercises)} />
    </>
  )
}
