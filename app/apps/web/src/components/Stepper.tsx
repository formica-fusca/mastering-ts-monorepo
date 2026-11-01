import { useState } from 'react'
import { Link } from 'react-router'
import type { ModuleRef } from '@site/content/types'
import { EdgePanel } from './EdgePanel'
import { Tree } from './Tree'
import { moduleTree, programTree, type Focus } from '../tree'
import { site } from '../content'

/**
 * The left edge lists the siblings of the current page: the module's lessons when
 * reading a lesson, the program's modules when reading a module.
 */
export function Stepper({ module: m, focus }: { module: ModuleRef; focus: Focus }) {
  const relatedId = focus.lessonSlug
    ? m.lessons.find((l) => l.files.includes(focus.lessonSlug!))?.id
    : focus.playground
      ? m.lessons.find((l) => focus.playground!.slug.startsWith(`${l.id}-`))?.id
      : undefined
  return (
    <EdgePanel
      side="left"
      label={`Module ${m.number}, lessons`}
      strip={
        <ol className="edge-list">
          {m.lessons.map((l) => {
            const cls = [l.files.length ? '' : 'dim', relatedId === l.id ? (focus.lessonSlug ? 'current' : 'related') : ''].join(' ')
            return (
              <li key={l.id} className={cls}>
                {l.files.length
                  ? <Link to={`/lessons/${l.files[0]}`} aria-current={focus.lessonSlug && l.files.includes(focus.lessonSlug) ? 'page' : undefined}>{l.id}</Link>
                  : <span title="not yet taught">{l.id}</span>}
              </li>
            )
          })}
        </ol>
      }
      card={
        <>
          <p className="edge-card-title">Module {m.number}. {m.title}</p>
          <Tree root={`courses/${m.dir ?? ''}`} nodes={moduleTree(m, focus, { collapsePlaygrounds: true })} compact />
        </>
      }
    />
  )
}

/**
 * The program on the left edge: a single toggle, no strip. The card holds the courses/
 * tree with one module unfolded: the current one, or the written one under the pointer.
 */
export function ProgramStepper({ current }: { current: number }) {
  const [unfolded, setUnfolded] = useState(current)
  return (
    <EdgePanel
      side="left"
      label="Modules"
      card={
        <>
          <p className="edge-card-title">{site.siteTitle}</p>
          <Tree root="courses/" nodes={programTree(current, { unfolded, onEnter: setUnfolded })} compact />
        </>
      }
    />
  )
}
