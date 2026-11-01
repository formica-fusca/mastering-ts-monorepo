import { Link, useParams } from 'react-router'
import { moduleByNumber, playgroundsFor, site } from '../content'
import { Shell } from '../components/Shell'
import { NotFound } from './NotFound'

/** The demos/ directory of a module: one entry per demo, each with its own page. */
export function DemosIndexPage() {
  const { number } = useParams()
  const m = moduleByNumber(Number(number))
  if (!m || !m.dir) return <NotFound />
  const demos = playgroundsFor('demo', m.demos)
  return (
    <Shell module={m} focus={{ playground: { kind: 'demo', slug: '' } }} path={`courses/${m.dir}/demos/`}>
      <h1>Demos of Module {m.number}</h1>
      <p>
        Each demo is a small, self-contained pnpm workspace built to exhibit one facet of a lesson: install it,
        run <code>lint</code>, <code>typecheck</code> and <code>build</code>, read what to observe, then break it
        as the README says. Every one can be run in the browser from its page.
      </p>
      <ul className="index">
        {demos.map((p) => {
          const lesson = p.lessonIds.flatMap((id) => site.lessons.filter((l) => l.id === id))[0]
          return (
            <li key={p.slug}>
              <Link to={`/demos/${p.slug}`}>{p.title}</Link>
              <span className="index-meta">
                <code className="dimcode">{p.slug}/</code>
                {lesson && <> for lesson <Link to={`/lessons/${lesson.slug}`}>{lesson.id}</Link></>}
                {p.fabricatedNodeModules && <>, ships a hand-made <code>node_modules</code></>}
              </span>
            </li>
          )
        })}
      </ul>
    </Shell>
  )
}
