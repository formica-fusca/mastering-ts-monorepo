import { readdir, readFile, stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { parseCurriculum } from './curriculum.js'
import { renderMarkdown } from './markdown.js'
import { embedOverrides } from './overrides.js'
import type { LessonPage, ModuleRef, Playground, PlaygroundKind, Program, RepoInfo } from './types.js'

export type * from './types.js'

const exec = promisify(execFile)

export interface LoadOptions {
  /** Absolute path to the repository root (the one holding modules/ and references/). */
  repoRoot: string
  repo: RepoInfo
  siteTitle: string
}

const exists = (p: string) => stat(p).then(() => true, () => false)
const lessonIdOf = (name: string) => /^(\d+\.\d+)(?:-|$)/.exec(name)?.[1] ?? null
const moduleNumberOf = (dir: string) => Number(/^(\d+)-/.exec(dir)?.[1] ?? NaN)

/**
 * Scans the repository and renders everything the site shows: the program (from
 * references/curriculum.md), every delivered lesson, every demo and exercise README.
 */
export async function loadContent(opts: LoadOptions): Promise<Program> {
  const { repoRoot, repo } = opts
  const githubBlobBase = `${repo.url}/blob/${repo.branch}`
  const githubTreeBase = `${repo.url}/tree/${repo.branch}`

  // --- inventory: which files exist where ---------------------------------------------
  const modulesDir = path.join(repoRoot, 'modules')
  const moduleDirs = (await readdir(modulesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && /^\d+-/.test(d.name)).map((d) => d.name)

  interface Inventory {
    dir: string; number: number
    lessonFiles: string[]            // basenames with .md
    demos: string[]; exercises: string[]
    hasExercisesIndex: boolean
  }
  const inventory: Inventory[] = []
  for (const dir of moduleDirs) {
    const full = path.join(modulesDir, dir)
    const entries = await readdir(full, { withFileTypes: true })
    const lessonFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.md') && lessonIdOf(e.name)).map((e) => e.name).sort()
    const listDirs = async (sub: string) => (await exists(path.join(full, sub)))
      ? (await readdir(path.join(full, sub), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort()
      : []
    inventory.push({
      dir, number: moduleNumberOf(dir), lessonFiles,
      demos: await listDirs('demos'), exercises: await listDirs('exercises'),
      hasExercisesIndex: await exists(path.join(full, 'exercises', 'README.md')),
    })
  }

  // --- route table for link rewriting --------------------------------------------------------
  const routeFor = (target: string): string | null => {
    const m = /^modules\/([^/]+)(?:\/(.*))?$/.exec(target)
    if (!m) return null
    const [, dir, rest = ''] = m
    const inv = inventory.find((i) => i.dir === dir)
    if (!inv) return null
    if (rest === '') return `/modules/${inv.number}`
    const pg = /^(demos|exercises)\/([^/]+)(?:\/README\.md)?$/.exec(rest)
    if (pg) return `/${pg[1]}/${pg[2]}`
    if (rest === 'exercises' || rest === 'exercises/README.md') return `/modules/${inv.number}/exercises`
    const lesson = /^([^/]+)\.md$/.exec(rest)
    if (lesson && inv.lessonFiles.includes(`${lesson[1]}.md`)) return `/lessons/${lesson[1]}`
    return null
  }

  // --- program from the curriculum ----------------------------------------------------------------
  const curriculum = parseCurriculum(await readFile(path.join(repoRoot, 'references', 'curriculum.md'), 'utf8'))
  const modules: ModuleRef[] = []
  for (const cur of curriculum) {
    const inv = inventory.find((i) => i.number === cur.number)
    const lessons = cur.lessons.map((l) => ({
      ...l,
      files: inv ? inv.lessonFiles.filter((f) => lessonIdOf(f) === l.id).map((f) => f.replace(/\.md$/, '')) : [],
    }))
    let exercisesIndexHtml: string | null = null
    if (inv?.hasExercisesIndex) {
      const repoPath = `modules/${inv.dir}/exercises/README.md`
      exercisesIndexHtml = (await renderMarkdown(await readFile(path.join(repoRoot, repoPath), 'utf8'), { repoPath, routeFor, githubBlobBase })).html
    }
    modules.push({
      number: cur.number, title: cur.title, dir: inv?.dir ?? null, lessons,
      delivered: lessons.filter((l) => l.files.length > 0).length,
      demos: inv?.demos ?? [], exercises: inv?.exercises ?? [], exercisesIndexHtml,
    })
  }

  // --- lesson pages -----------------------------------------------------------------------------------
  const lessons: LessonPage[] = []
  for (const inv of inventory) {
    for (const file of inv.lessonFiles) {
      const slug = file.replace(/\.md$/, '')
      const id = lessonIdOf(file)!
      const repoPath = `modules/${inv.dir}/${file}`
      const { title, html } = await renderMarkdown(await readFile(path.join(repoRoot, repoPath), 'utf8'), { repoPath, routeFor, githubBlobBase })
      lessons.push({
        slug, id, moduleNumber: inv.number, title: title || slug, html, repoPath,
        demos: inv.demos.filter((d) => lessonIdOf(d) === id),
        exercises: inv.exercises.filter((e) => lessonIdOf(e) === id),
        companions: inv.lessonFiles.filter((f) => f !== file && lessonIdOf(f) === id).map((f) => f.replace(/\.md$/, '')),
      })
    }
  }

  // --- playgrounds (demos and exercises) --------------------------------------------------------------
  const { stdout: tracked } = await exec('git', ['ls-files', 'modules'], { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 })
  const trackedFiles = tracked.split('\n')
  const playgrounds: Playground[] = []
  for (const inv of inventory) {
    for (const kind of ['demo', 'exercise'] as PlaygroundKind[]) {
      const subdir = kind === 'demo' ? 'demos' : 'exercises'
      for (const slug of (kind === 'demo' ? inv.demos : inv.exercises)) {
        const repoPath = `modules/${inv.dir}/${subdir}/${slug}`
        const readme = path.join(repoRoot, repoPath, 'README.md')
        if (!(await exists(readme))) continue
        const { title, html } = await renderMarkdown(await readFile(readme, 'utf8'), { repoPath: `${repoPath}/README.md`, routeFor, githubBlobBase })
        const fabricated = trackedFiles.some((f) => f.startsWith(`${repoPath}/`) && f.includes('/node_modules/'))
        const override = embedOverrides[`${kind}:${slug}`]
        const view = override?.view ?? 'editor'
        const id = lessonIdOf(slug)
        playgrounds.push({
          kind, slug, moduleNumber: inv.number, lessonIds: id ? [id] : [],
          title: title || slug, html, repoPath, fabricatedNodeModules: fabricated,
          embeddable: override?.embeddable !== false, embedNote: override?.note ?? null,
          stackblitzUrl: `https://stackblitz.com/github/${repo.owner}/${repo.name}/tree/${repo.branch}/${repoPath}?embed=1&file=README.md&view=${view}&hideNavigation=1&terminalHeight=50`,
          codespacesUrl: `https://codespaces.new/${repo.owner}/${repo.name}?quickstart=1`,
          githubUrl: `${githubTreeBase}/${repoPath}`,
        })
      }
    }
  }

  return { siteTitle: opts.siteTitle, repo, generatedAt: new Date().toISOString(), modules, lessons, playgrounds }
}
