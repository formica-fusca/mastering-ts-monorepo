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
          Lecture notes, runnable demos and self-verifying exercises from a one-student masterclass on
          TypeScript monorepos, kept as a repository and read here as one. Every lesson ends with something
          to break. {delivered} of {total} lessons so far.
        </p>
        <Tree root="courses/" nodes={programTree()} />
        <p className="aside">
          Dimmed entries are in the program but not yet taught. A lesson is <em>completed</em> only once its
          exercises are done and reviewed; the exercise index of each module keeps that record.
        </p>
      </div>
    </div>
  )
}
