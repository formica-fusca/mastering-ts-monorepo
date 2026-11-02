import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { copyFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { loadContent, playgroundFileTree, type Program } from '@site/content'

const REPO_ROOT = path.resolve(__dirname, '../../..')
const VIRTUAL_ID = 'virtual:content'
const RESOLVED_ID = '\0' + VIRTUAL_ID

let programPromise: Promise<Program> | null = null
const getProgram = () => (programPromise ??= loadContent({
  repoRoot: REPO_ROOT,
  siteTitle: 'An attempt at TypeScript monorepos',
  repo: {
    owner: 'formica-fusca',
    name: 'mastering-ts-monorepo',
    branch: 'main',
    url: 'https://github.com/formica-fusca/mastering-ts-monorepo',
  },
}))

/** Exposes the rendered program content as a virtual JSON module, computed at build time. */
function contentPlugin(): Plugin {
  return {
    name: 'site-content',
    resolveId(id) { return id === VIRTUAL_ID ? RESOLVED_ID : null },
    async load(id) {
      if (id !== RESOLVED_ID) return null
      return `export default ${JSON.stringify(await getProgram())}`
    },
  }
}

/**
 * Writes every playground folder as a mountable file tree under public/wc/, fetched on
 * demand by the in-page WebContainer. Generated, not committed.
 */
function playgroundTreesPlugin(): Plugin {
  return {
    name: 'site-playground-trees',
    async buildStart() {
      const program = await getProgram()
      for (const p of program.playgrounds) {
        const out = path.join(__dirname, 'public', 'wc', `${p.kind}s`, `${p.slug}.json`)
        await mkdir(path.dirname(out), { recursive: true })
        await writeFile(out, JSON.stringify(await playgroundFileTree(REPO_ROOT, p.repoPath)))
      }
    },
  }
}

/** WebContainers need a cross-origin isolated page; these headers provide it in dev and preview. */
const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

/** GitHub Pages serves a project site under /<repo>/; the workflow sets BASE_PATH accordingly. */
const base = process.env.BASE_PATH ?? '/'

/** GitHub Pages has no rewrite rules: serve index.html as 404.html so deep links load the SPA. */
function spaFallbackPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'site-spa-fallback',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
    closeBundle() { copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html')) },
  }
}

export default defineConfig({
  base,
  plugins: [react(), contentPlugin(), playgroundTreesPlugin(), spaFallbackPlugin()],
  server: { headers: isolationHeaders },
  preview: { headers: isolationHeaders },
})
