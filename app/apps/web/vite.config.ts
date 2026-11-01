import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { copyFileSync } from 'node:fs'
import { loadContent } from '@site/content'

const REPO_ROOT = path.resolve(__dirname, '../../..')
const VIRTUAL_ID = 'virtual:content'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/** Exposes the rendered program content as a virtual JSON module, computed at build time. */
function contentPlugin(): Plugin {
  return {
    name: 'site-content',
    resolveId(id) { return id === VIRTUAL_ID ? RESOLVED_ID : null },
    async load(id) {
      if (id !== RESOLVED_ID) return null
      const program = await loadContent({
        repoRoot: REPO_ROOT,
        siteTitle: 'An attempt at TypeScript monorepos',
        repo: {
          owner: 'formica-fusca',
          name: 'mastering-ts-monorepo',
          branch: 'main',
          url: 'https://github.com/formica-fusca/mastering-ts-monorepo',
        },
      })
      return `export default ${JSON.stringify(program)}`
    },
  }
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
  plugins: [react(), contentPlugin(), spaFallbackPlugin()],
})
