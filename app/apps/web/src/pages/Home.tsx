import { Tree } from '../components/Tree'
import { programTree } from '../tree'
import { site } from '../content'

export function Home() {
  const delivered = site.modules.reduce((n, m) => n + m.delivered, 0)
  const total = site.modules.reduce((n, m) => n + m.lessons.length, 0)
  return (
    <div className="shell">
      <div className="reading wide">
        <h1 className="home-title">{site.siteTitle}</h1>
        <p className="standfirst">
          Eight modules on TypeScript monorepos, laid out as the repository they live in. Open a lesson, then
          run its demos and exercises in your browser.
        </p>
        <Tree root="courses/" nodes={programTree()} />
        <p className="aside">
          {delivered} of {total} lessons taught so far; dimmed entries are in the program but not yet written.
          A lesson is <em>completed</em> only once its exercises are done and reviewed; the exercise index of
          each module keeps that record.
        </p>
      </div>
    </div>
  )
}
