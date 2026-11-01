import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeShiki from '@shikijs/rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'
import path from 'node:path'

export interface RenderOptions {
  /** Repo-relative path of the markdown file being rendered, e.g. courses/1-x/1.2-y.md */
  repoPath: string
  /** Maps a repo-relative target path (no hash) to a site route, or null to fall back to GitHub. */
  routeFor: (repoRelativeTarget: string) => string | null
  /** https://github.com/<owner>/<name>/blob/<branch> */
  githubBlobBase: string
}

export interface Rendered {
  title: string
  html: string
}

/** Extracts the first H1 as the title and removes it from the body. */
function rehypeExtractTitle(store: { title: string }) {
  return (tree: Root) => {
    let done = false
    visit(tree, 'element', (node: Element, index, parent) => {
      if (done || node.tagName !== 'h1' || !parent || index === undefined) return
      store.title = textOf(node)
      parent.children.splice(index, 1)
      done = true
    })
  }
}

function textOf(node: Element): string {
  let out = ''
  visit(node, 'text', (t: { value: string }) => { out += t.value })
  return out.trim()
}

/** Rewrites relative links to site routes (or GitHub for anything the site does not host). */
function rehypeRewriteLinks(opts: RenderOptions) {
  const fromDir = path.posix.dirname(opts.repoPath)
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a' || typeof node.properties?.href !== 'string') return
      const href = node.properties.href
      if (/^(https?:|mailto:|#)/.test(href)) {
        if (/^https?:/.test(href)) { node.properties.target = '_blank'; node.properties.rel = ['noreferrer'] }
        return
      }
      const [rawPath, hash] = href.split('#')
      const target = path.posix.normalize(path.posix.join(fromDir, rawPath)).replace(/\/$/, '')
      const route = opts.routeFor(target)
      node.properties.href = route
        ? route + (hash ? `#${hash}` : '')
        : `${opts.githubBlobBase}/${target}${hash ? `#${hash}` : ''}`
      if (!route) { node.properties.target = '_blank'; node.properties.rel = ['noreferrer'] }
    })
  }
}

export async function renderMarkdown(markdown: string, opts: RenderOptions): Promise<Rendered> {
  const store = { title: '' }
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeExtractTitle, store)
    .use(rehypeSlug)
    .use(rehypeRewriteLinks, opts)
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      fallbackLanguage: 'text',
    })
    .use(rehypeStringify)
    .process(markdown)
  return { title: store.title, html: String(file) }
}
