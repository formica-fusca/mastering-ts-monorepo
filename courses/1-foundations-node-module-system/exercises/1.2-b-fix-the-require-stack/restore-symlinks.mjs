// Repairs the exercise's committed symlink when the folder was imported without
// symlink support (StackBlitz's GitHub import turns a symlink into a plain file
// containing its target path). Idempotent; a no-op on a normal git checkout.
import { lstatSync, readFileSync, rmSync, symlinkSync } from 'node:fs'

const link = new URL('./tree/app/node_modules/@demo/lib', import.meta.url)
const expected = '../../../packages/lib'

try {
  const st = lstatSync(link)
  if (st.isSymbolicLink()) process.exit(0)
  if (st.isFile() && readFileSync(link, 'utf8').trim() === expected) {
    rmSync(link)
    symlinkSync(expected, link)
    console.log(`restored symlink: tree/app/node_modules/@demo/lib -> ${expected}`)
  }
} catch {
  /* missing entirely: leave it to the student to notice */
}
