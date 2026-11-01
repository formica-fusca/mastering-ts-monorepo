import { Link, useParams } from 'react-router'
import { lessonBySlug, moduleByNumber, playgroundsFor, site } from '../content'
import { Prose } from '../components/Prose'
import { Shell } from '../components/Shell'
import { NotFound } from './NotFound'

export function LessonPageView() {
  const { slug } = useParams()
  const lesson = slug ? lessonBySlug(slug) : undefined
  const m = lesson ? moduleByNumber(lesson.moduleNumber) : undefined
  if (!lesson || !m) return <NotFound />
  const demos = playgroundsFor('demo', lesson.demos)
  const exercises = playgroundsFor('exercise', lesson.exercises)
  return (
    <Shell module={m} focus={{ lessonSlug: lesson.slug }} path={lesson.repoPath}>
      <h1>{lesson.title}</h1>
      <Prose html={lesson.html} />
      {(demos.length > 0 || exercises.length > 0) && (
        <section className="runnables">
          <h2>Run what this lesson describes</h2>
          {demos.length > 0 && (
            <ul className="plain">
              {demos.map((p) => <li key={p.slug}>Demo: <Link to={`/demos/${p.slug}`}>{p.title}</Link></li>)}
            </ul>
          )}
          {exercises.length > 0 && (
            <ul className="plain">
              {exercises.map((p) => <li key={p.slug}>Exercise: <Link to={`/exercises/${p.slug}`}>{p.title}</Link></li>)}
            </ul>
          )}
        </section>
      )}
      <p className="aside">
        <a href={`${site.repo.url}/blob/${site.repo.branch}/${lesson.repoPath}`} target="_blank" rel="noreferrer">This file on GitHub</a>
        {lesson.companions.length > 0 && <>. Companion file{lesson.companions.length > 1 ? 's' : ''}: {lesson.companions.map((c, i) => <span key={c}>{i > 0 && ', '}<Link to={`/lessons/${c}`}>{c}.md</Link></span>)}</>}
      </p>
    </Shell>
  )
}
