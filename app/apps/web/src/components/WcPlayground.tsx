import { useEffect, useRef, useState } from 'react'
import { WebContainer, type FileSystemTree } from '@webcontainer/api'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { FileTree, Playground } from '@site/content/types'
import { Tree, type TreeNode } from './Tree'

/**
 * The playground: a WebContainer booted in this page, the folder mounted from the tree the
 * build emitted, a shell in a terminal, and the files in a plain editor. One instance per
 * page; leaving the page tears it down.
 */
export function WcPlayground({ playground: p }: { playground: Playground }) {
  const termRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Booting the container…')
  const [files, setFiles] = useState<string[]>([])
  const [tree, setTree] = useState<FileTree | null>(null)
  const [open, setOpen] = useState<{ path: string; text: string } | null>(null)
  const wcRef = useRef<WebContainer | null>(null)
  const writeTimer = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    let wc: WebContainer | null = null
    const term = new Terminal({ convertEol: true, fontSize: 12.5, fontFamily: 'JetBrains Mono, Menlo, monospace', theme: themeFromTokens() })
    const fit = new FitAddon()
    term.loadAddon(fit)
    if (termRef.current) { term.open(termRef.current); fit.fit() }
    const onResize = () => fit.fit()
    window.addEventListener('resize', onResize)
    ;(async () => {
      try {
        if (!crossOriginIsolated) throw new Error('This page is not cross-origin isolated, so the container cannot start. Reload once; if it persists, your browser blocks service workers here.')
        const treeRes = await fetch(`${import.meta.env.BASE_URL}wc/${p.kind}s/${p.slug}.json`)
        if (!treeRes.ok) throw new Error(`No file tree for this folder (${treeRes.status}).`)
        const tree = (await treeRes.json()) as FileTree
        wc = await WebContainer.boot({ coep: 'require-corp' })
        if (cancelled) { wc.teardown(); return }
        wcRef.current = wc
        setStatus('Mounting the folder…')
        await wc.mount(toFsTree(tree))
        const paths = listFiles(tree)
        setFiles(paths)
        setTree(tree)
        const first = firstSourceFile(paths)
        if (first) setOpen({ path: first, text: await wc.fs.readFile(first, 'utf8') })
        const shell = await wc.spawn('jsh', { terminal: { cols: term.cols, rows: term.rows } })
        shell.output.pipeTo(new WritableStream({ write(d) { term.write(d) } }))
        const input = shell.input.getWriter()
        term.onData((d) => { input.write(d) })
        term.onResize(({ cols, rows }) => shell.resize({ cols, rows }))
        const steps = [p.boot.install ? 'pnpm install' : null, p.boot.start].filter(Boolean)
        setStatus(steps.length ? `Ready. Running: ${steps.join(' && ')}` : 'Ready.')
        if (steps.length) input.write(`${steps.join(' && ')}\n`)
      } catch (e) {
        setStatus(`Failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    })()
    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      term.dispose()
      wc?.teardown()
      wcRef.current = null
    }
  }, [p.kind, p.slug, p.boot.install, p.boot.start])

  const openFile = async (path: string) => {
    const wc = wcRef.current
    if (!wc) return
    try { setOpen({ path, text: await wc.fs.readFile(path, 'utf8') }) }
    catch { setOpen({ path, text: '(binary or unreadable file)' }) }
  }
  const edit = (text: string) => {
    if (!open) return
    setOpen({ ...open, text })
    if (writeTimer.current) window.clearTimeout(writeTimer.current)
    writeTimer.current = window.setTimeout(() => { wcRef.current?.fs.writeFile(open.path, text) }, 300)
  }

  return (
    <div className="wc">
      <div className="wc-head">
        <span className="wc-title">{p.slug}/</span>
        <span className="wc-status">{status}</span>
      </div>
      <div className="wc-files" aria-label="Files">
        {tree && <Tree nodes={treeNodes(tree, open?.path ?? null, openFile)} compact />}
      </div>
      <textarea className="wc-editor" spellCheck={false} value={open?.text ?? ''} placeholder={files.length ? 'Pick a file on the left.' : ''} onChange={(e) => edit(e.target.value)} aria-label={open ? `Editing ${open.path}` : 'Editor'} />
      <div className="wc-term" ref={termRef} />
    </div>
  )
}

function toFsTree(t: FileTree): FileSystemTree {
  const out: FileSystemTree = {}
  for (const [name, node] of Object.entries(t)) {
    if ('directory' in node) out[name] = { directory: toFsTree(node.directory) }
    else if ('symlink' in node.file) out[name] = { file: { symlink: node.file.symlink } }
    else if ('b64' in node.file) out[name] = { file: { contents: Uint8Array.from(atob(node.file.b64), (c) => c.charCodeAt(0)) } }
    else out[name] = { file: { contents: node.file.contents } }
  }
  return out
}

/**
 * The folder as an ls-style tree for the picker. A node_modules directory is shown
 * folded with its file count: it is navigable from the shell, not from here.
 */
function treeNodes(t: FileTree, current: string | null, onSelect: (path: string) => void, prefix = ''): TreeNode[] {
  const names = Object.keys(t).sort((a, b) => {
    const da = 'directory' in t[a], db = 'directory' in t[b]
    return da === db ? a.localeCompare(b) : da ? -1 : 1
  })
  return names.map((name) => {
    const node = t[name]
    const path = `${prefix}${name}`
    if ('directory' in node) {
      if (name === 'node_modules') return { label: `${name}/`, dim: true, note: `${countFiles(node.directory)} files` }
      return { label: `${name}/`, children: treeNodes(node.directory, current, onSelect, `${path}/`) }
    }
    if ('symlink' in node.file) return { label: `${name} -> ${node.file.symlink}`, dim: true }
    return { label: name, current: current === path, onSelect: () => onSelect(path) }
  })
}
/** The file to open first: a source file, preferably under src/, never a config, a verifier or node_modules. */
function firstSourceFile(paths: string[]): string | undefined {
  const source = paths.filter((f) => /\.(ts|js|mjs|cjs)$/.test(f) && !f.includes('node_modules/') && !/\.config\.|(^|\/)(verify|restore-symlinks)\.mjs$/.test(f))
  return source.find((f) => f.includes('/src/')) ?? source[0] ?? paths[0]
}
const countFiles = (t: FileTree): number => Object.values(t).reduce((n, node) => n + ('directory' in node ? countFiles(node.directory) : 1), 0)

/** File paths in display order: the folder's own files first, node_modules last. */
function listFiles(t: FileTree, prefix = ''): string[] {
  const out: string[] = []
  const names = Object.keys(t).sort((a, b) => (a === 'node_modules') === (b === 'node_modules') ? a.localeCompare(b) : a === 'node_modules' ? 1 : -1)
  for (const name of names) {
    const node = t[name]
    if ('directory' in node) out.push(...listFiles(node.directory, `${prefix}${name}/`))
    else if (!('symlink' in node.file)) out.push(`${prefix}${name}`)
  }
  return out
}

function themeFromTokens() {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return { background: v('--paper-2'), foreground: v('--ink'), cursor: v('--accent'), selectionBackground: v('--mark') }
}
