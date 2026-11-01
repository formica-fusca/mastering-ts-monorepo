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
    <section className="embed">
      <div className="embed-head">
        <h2>Playground</h2>
        <div className="embed-links">
          {loaded && p.embeddable && (
            <button type="button" className="linklike" onClick={() => setGeneration((g) => g + 1)}>Reload</button>
          )}
          <a href={p.stackblitzUrl.replace('&embed=1', '')} target="_blank" rel="noreferrer">Open in StackBlitz</a>
          <a href={p.codespacesUrl} target="_blank" rel="noreferrer">Open in Codespaces</a>
          <a href={p.githubUrl} target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
      </div>
      {!p.embeddable ? (
        <div className="card">
          <p><strong>This one runs locally or in Codespaces, not in the browser.</strong></p>
          {p.embedNote && <p>{p.embedNote}</p>}
          <p>Clone the repository, <code>cd {p.repoPath}</code>, and follow the README above.</p>
        </div>
      ) : loaded ? (
        <>
          <iframe
            key={generation}
            className="embed-frame"
            src={p.stackblitzUrl}
            title={`${p.title} — interactive playground`}
            allow="cross-origin-isolated; clipboard-read; clipboard-write"
          />
          <p className="muted small">
            The folder is cloned from GitHub into a Node environment in your browser. If it stays on
            "Cloning repo" for more than a few seconds, use Reload: the first import of a folder sometimes
            stalls, the second attempt is fast.
          </p>
        </>
      ) : (
        <div className="card embed-placeholder">
          <p>
            A real Node.js environment boots in your browser with the folder's files, an editor and a
            terminal. The README's first command runs on boot. Edit, rerun, break it as instructed. Nothing
            is saved unless you fork it.
          </p>
          {p.fabricatedNodeModules && (
            <p className="warn">
              This folder ships a hand-made <code>node_modules</code> that is the exhibit. Do not run an
              install inside it.
            </p>
          )}
          <button type="button" onClick={() => setGeneration(1)}>Start the playground</button>
          <p className="muted small">Needs a current Chromium, Firefox or Safari with third-party storage allowed for stackblitz.com.</p>
        </div>
      )}
    </section>
  )
}
