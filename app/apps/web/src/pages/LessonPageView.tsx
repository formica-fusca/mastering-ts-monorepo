import { Link, useParams } from 'react-router'
import { lessonBySlug, moduleByNumber, playgroundsFor, site } from '../content'
import { Prose } from '../components/Prose'
import { PlaygroundList } from '../components/PlaygroundList'
import { NotFound } from './NotFound'

export function LessonPageView() {
  const { slug } = useParams()
  const lesson = slug ? lessonBySlug(slug) : undefined
  if (!lesson) return <NotFound />
  const m = moduleByNumber(lesson.moduleNumber)
  return (
    <>
      <nav className="crumbs">
        <Link to="/">Program</Link> / <Link to={`/modules/${lesson.moduleNumber}`}>Module {lesson.moduleNumber}</Link> / Lesson {lesson.id}
      </nav>
      <h1>{lesson.title}</h1>
      <p className="muted small">
        <a href={`${site.repo.url}/blob/${site.repo.branch}/${lesson.repoPath}`} target="_blank" rel="noreferrer">Source on GitHub</a>
        {lesson.companions.length > 0 && (
          <> · Companion file{lesson.companions.length > 1 ? 's' : ''}: {lesson.companions.map((c, i) => (
            <span key={c}>{i > 0 && ', '}<Link to={`/lessons/${c}`}>{c}</Link></span>
          ))}</>
        )}
      </p>
      <Prose html={lesson.html} />
      <PlaygroundList title="Demos for this lesson" items={playgroundsFor('demo', lesson.demos)} />
      <PlaygroundList title="Exercises for this lesson" items={playgroundsFor('exercise', lesson.exercises)} />
      {m && <p className="muted"><Link to={`/modules/${m.number}`}>← Back to Module {m.number}</Link></p>}
    </>
  )
}
