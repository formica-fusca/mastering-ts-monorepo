import { useState } from 'react'
import type { Playground } from '@site/content/types'

/**
 * The interactive playground. Boots a full Node environment in the visitor's browser
 * (StackBlitz WebContainers) from the folder on GitHub, so it loads on click only.
 */
export function Embed({ playground: p }: { playground: Playground }) {
  const [generation, setGeneration] = useState(0)
  const loaded = generation > 0
  return (
    <section className="playground" id="playground">
      <h2>Run it here</h2>
      <p className="playground-links">
        {loaded && p.embeddable && <button type="button" className="textbutton" onClick={() => setGeneration((g) => g + 1)}>Reload</button>}
        <a href={p.stackblitzUrl.replace('&embed=1', '')} target="_blank" rel="noreferrer">Open in StackBlitz</a>
        <a href={p.codespacesUrl} target="_blank" rel="noreferrer">Open in Codespaces</a>
        <a href={p.githubUrl} target="_blank" rel="noreferrer">Open on GitHub</a>
      </p>
      {!p.embeddable ? (
        <div className="playground-note">
          <p>This one runs on a real machine, not in the browser.{p.embedNote ? ` ${p.embedNote}` : ''}</p>
          <p>Clone the repository, <code>cd {p.repoPath}</code>, and follow the README above.</p>
        </div>
      ) : loaded ? (
        <>
          <iframe
            key={generation}
            className="playground-frame"
            src={p.stackblitzUrl}
            title={`${p.title}, interactive playground`}
            allow="cross-origin-isolated; clipboard-read; clipboard-write"
          />
          <p className="aside">
            If it stays on "Cloning repo" for more than a few seconds, use Reload. The first import of a folder
            sometimes stalls; the second attempt is quick.
          </p>
        </>
      ) : (
        <div className="playground-start">
          <p>
            A Node.js environment boots in your browser with this folder, an editor and a terminal. The README's
            first command runs on boot. Edit, rerun, break it as instructed; nothing is kept unless you fork it.
          </p>
          {p.fabricatedNodeModules && (
            <p className="fail-note">This folder ships a hand-made <code>node_modules</code> that is the exhibit. Do not run an install inside it.</p>
          )}
          <button type="button" className="start" onClick={() => setGeneration(1)}>Start the playground</button>
          <p className="aside">Needs a current Chromium, Firefox or Safari, with third-party storage allowed for stackblitz.com.</p>
        </div>
      )}
    </section>
  )
}
