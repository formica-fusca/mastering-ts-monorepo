import { useState } from 'react'
import type { Playground } from '@site/content/types'
import { WcPlayground } from './WcPlayground'

/**
 * The interactive playground: a Node environment booted in the visitor's browser with
 * the folder mounted. Boots on click only, since it costs a few seconds and some memory.
 */
export function Embed({ playground: p }: { playground: Playground }) {
  const [generation, setGeneration] = useState(0)
  const loaded = generation > 0
  return (
    <section className="playground" id="playground">
      <h2>Run it here</h2>
      <p className="playground-links">
        {loaded && p.embeddable && <button type="button" className="textbutton" onClick={() => setGeneration((g) => g + 1)}>Restart</button>}
        <a href={p.githubUrl} target="_blank" rel="noreferrer">Open on GitHub</a>
      </p>
      {!p.embeddable ? (
        <div className="playground-note">
          <p>This one runs on a real machine, not in the browser.{p.embedNote ? ` ${p.embedNote}` : ''}</p>
          <p>Clone the repository, <code>cd {p.repoPath}</code>, and follow the README above.</p>
        </div>
      ) : loaded ? (
        <WcPlayground key={generation} playground={p} />
      ) : (
        <div className="playground-start">
          <p>
            A Node.js environment boots in your browser with this folder, its files and a shell. The README's
            first command runs on boot. Edit, rerun, break it as instructed; nothing is kept once you leave the page.
          </p>
          {p.fabricatedNodeModules && (
            <p className="fail-note">This folder ships a hand-made <code>node_modules</code> that is the exhibit. Do not run an install inside it.</p>
          )}
          <button type="button" className="start" onClick={() => setGeneration(1)}>Start the playground</button>
          <p className="aside">Needs a current Chromium or Firefox; Safari works from 16.4.</p>
        </div>
      )}
    </section>
  )
}
