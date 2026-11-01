import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { ModuleRef } from '@site/content/types'
import { Tree } from './Tree'
import { moduleTree, type Focus } from '../tree'

/**
 * The module as a vertical stepper on the right edge: one step per lesson, numbers only.
 * Hovering or focusing it opens a card with the module's full tree over the page.
 */
export function Stepper({ module: m, focus }: { module: ModuleRef; focus: Focus }) {
  // Open on hover with a grace period, so crossing to the card does not close it;
  // a click pins it open until a click outside or Escape.
  const [hovering, setHovering] = useState(false)
  const [pinned, setPinned] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const enter = () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setHovering(true) }
  const leave = () => { closeTimer.current = window.setTimeout(() => setHovering(false), 350) }
  useEffect(() => {
    if (!pinned) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setPinned(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPinned(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [pinned])
  const open = hovering || pinned
  const relatedId = focus.lessonSlug
    ? m.lessons.find((l) => l.files.includes(focus.lessonSlug!))?.id
    : focus.playground
      ? m.lessons.find((l) => focus.playground!.slug.startsWith(`${l.id}-`))?.id
      : undefined
  return (
    <nav
      ref={rootRef}
      className={`stepper ${open ? 'open' : ''}`}
      aria-label={`Module ${m.number}, lessons`}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        type="button"
        className="stepper-toggle"
        aria-expanded={pinned}
        aria-label={pinned ? 'Close the module tree' : 'Pin the module tree open'}
        onClick={() => setPinned((v) => !v)}
      >
        {pinned ? '×' : '≡'}
      </button>
      <ol className="stepper-list">
        {m.lessons.map((l) => {
          const cls = [
            l.files.length ? '' : 'dim',
            relatedId === l.id ? (focus.lessonSlug ? 'current' : 'related') : '',
          ].join(' ')
          return (
            <li key={l.id} className={cls}>
              {l.files.length
                ? <Link to={`/lessons/${l.files[0]}`} aria-current={focus.lessonSlug && l.files.includes(focus.lessonSlug) ? 'page' : undefined}>{l.id}</Link>
                : <span title="not yet taught">{l.id}</span>}
            </li>
          )
        })}
      </ol>
      <div className="stepper-card">
        <p className="stepper-card-title">Module {m.number}. {m.title}</p>
        <Tree root={`courses/${m.dir ?? ''}`} nodes={moduleTree(m, focus, { collapsePlaygrounds: true })} compact />
      </div>
    </nav>
  )
}
