/** The typed content index consumed by the site. Produced at build time, shipped as JSON. */

export interface RepoInfo {
  owner: string
  name: string
  branch: string
  /** https://github.com/<owner>/<name> */
  url: string
}

export interface LessonRef {
  /** "1.2" */
  id: string
  /** Title from the curriculum table of contents. */
  title: string
  /** Lesson files present for this id, in display order. Empty when not yet delivered. */
  files: string[]
}

export interface ModuleRef {
  number: number
  /** Title from the curriculum, e.g. "Foundations: Node.js Module System". */
  title: string
  /** Directory name under modules/, when it exists. */
  dir: string | null
  lessons: LessonRef[]
  delivered: number
  /** Slugs of demos and exercises belonging to this module. */
  demos: string[]
  exercises: string[]
  /** Rendered modules/<dir>/exercises/README.md, when present. */
  exercisesIndexHtml: string | null
}

export interface LessonPage {
  /** File basename without extension, e.g. "1.2-node-modules-resolution". */
  slug: string
  /** "1.2" */
  id: string
  moduleNumber: number
  /** First h1 of the file. */
  title: string
  /** Rendered body, first h1 removed, relative links rewritten to site routes. */
  html: string
  /** Repo-relative path, for the GitHub link. */
  repoPath: string
  demos: string[]
  exercises: string[]
  /** Other lesson files sharing the same id (e.g. 1.1-history for 1.1-commonjs-vs-esm). */
  companions: string[]
}

export type PlaygroundKind = 'demo' | 'exercise'

export interface Playground {
  kind: PlaygroundKind
  /** Directory name, e.g. "1.2-realpath-vs-preserve-symlinks". */
  slug: string
  moduleNumber: number
  /** Lesson ids this playground belongs to, by filename prefix. */
  lessonIds: string[]
  title: string
  html: string
  repoPath: string
  /** True when the folder ships a hand-made node_modules tracked in git. Never install into it. */
  fabricatedNodeModules: boolean
  /** Whether the in-browser playground is offered. False means: show the fallback card. */
  embeddable: boolean
  /** Why the embed is not offered, when embeddable is false. */
  embedNote: string | null
  stackblitzUrl: string
  codespacesUrl: string
  githubUrl: string
}

export interface Program {
  siteTitle: string
  repo: RepoInfo
  generatedAt: string
  modules: ModuleRef[]
  lessons: LessonPage[]
  playgrounds: Playground[]
}
