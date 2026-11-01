import { useState } from 'react'
import type { ModuleRef } from '@site/content/types'
import { EdgePanel } from './EdgePanel'
import { Tree } from './Tree'
import { moduleTree, programTree, type Focus } from '../tree'

/**
 * The left edge is a single toggle whose card lists the siblings of the current page:
 * the module's tree when reading a lesson, the program's tree when reading a module.
 */
export function Stepper({ module: m, focus }: { module: ModuleRef; focus: Focus }) {
  return (
    <EdgePanel
      side="left"
      label={`Module ${m.number}`}
      card={<Tree root={`courses/${m.dir ?? ''}`} nodes={moduleTree(m, focus, { collapsePlaygrounds: true })} compact />}
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
      card={<Tree root="courses/" nodes={programTree(current, { unfolded, onEnter: setUnfolded })} compact />}
    />
  )
}
