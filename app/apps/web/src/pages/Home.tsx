import { Tree } from '../components/Tree'
import { programTree } from '../tree'
import { site } from '../content'

export function Home() {
  return (
    <div className="shell">
      <div className="reading wide">
        <h1 className="home-title">{site.siteTitle}</h1>
        <p className="standfirst">
          There is no book on TypeScript monorepos, and few worked studies of them; the knowledge sits in tool
          docs and scattered posts. This is one attempt to lay it out end to end, lessons and breakages included.
          Every output shown was captured from a real run, and every demo and exercise was installed, run and
          broken before it was written up.
        </p>
        <p className="byline">Co-directed by Claude Fable 5.1.</p>
        <Tree root="modules/" nodes={programTree()} />
      </div>
    </div>
  )
}
