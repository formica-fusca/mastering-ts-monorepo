import { Link } from 'react-router'
import { site } from '../content'

export function Home() {
  const delivered = site.modules.reduce((n, m) => n + m.delivered, 0)
  const total = site.modules.reduce((n, m) => n + m.lessons.length, 0)
  return (
    <>
      <section className="hero">
        <h1>{site.siteTitle}</h1>
        <p className="lede">
          One student, one AI instructor, an eight-module program on TypeScript monorepos. Every lesson
          ends with something to break. This site is the archive: the lessons as delivered, the demos you
          can run in your browser, and the exercises with their verifiers.
        </p>
        <p className="muted">{delivered} of {total} lessons delivered so far.</p>
      </section>
      <section className="modules">
        {site.modules.map((m) => (
          <article key={m.number} className={`module-card ${m.delivered === 0 ? 'planned' : ''}`}>
            <h2>
              <span className="module-number">Module {m.number}</span>
              {m.delivered > 0 ? <Link to={`/modules/${m.number}`}>{m.title}</Link> : m.title}
            </h2>
            <ol className="lesson-list">
              {m.lessons.map((l) => (
                <li key={l.id} className={l.files.length ? '' : 'planned'}>
                  <span className="lesson-id">{l.id}</span>
                  {l.files.length ? <Link to={`/lessons/${l.files[0]}`}>{l.title}</Link> : <span>{l.title}</span>}
                </li>
              ))}
            </ol>
            <p className="muted small">
              {m.delivered === 0 ? 'Not started' : `${m.delivered}/${m.lessons.length} lessons · ${m.demos.length} demos · ${m.exercises.length} exercises`}
            </p>
          </article>
        ))}
      </section>
    </>
  )
}
