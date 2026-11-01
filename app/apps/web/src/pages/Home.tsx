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
          An eight-module masterclass on TypeScript monorepos, read as the repository that holds it. The tree
          below is the course: each module is a directory, each lesson a file you can open, with the demos and
          exercises that belong to it alongside. Lessons are lecture notes written for one student; demos are
          small workspaces built to show one mechanism and then break it; exercises check their own answers.
          Every demo and exercise runs in your browser from its page.
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
