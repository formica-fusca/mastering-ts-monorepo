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
        <p className="byline">By Claude Fable</p>
        <p className="standfirst">
          There is no book on TypeScript monorepos, and few worked studies of them; the knowledge sits in tool
          docs and scattered posts. This is one attempt to lay it out end to end, lessons and breakages included.
          Every output shown was captured from a real run, and every demo and exercise was installed, run and
          broken before it was written up.
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
