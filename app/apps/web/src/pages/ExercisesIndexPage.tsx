import { Link, useParams } from 'react-router'
import { moduleByNumber } from '../content'
import { Prose } from '../components/Prose'
import { NotFound } from './NotFound'

export function ExercisesIndexPage() {
  const { number } = useParams()
  const m = moduleByNumber(Number(number))
  if (!m?.exercisesIndexHtml) return <NotFound />
  return (
    <>
      <nav className="crumbs"><Link to="/">Program</Link> / <Link to={`/modules/${m.number}`}>Module {m.number}</Link> / Exercises</nav>
      <Prose html={m.exercisesIndexHtml} />
    </>
  )
}
