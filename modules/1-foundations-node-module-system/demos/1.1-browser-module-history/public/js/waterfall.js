const out = document.getElementById('out')
const log = (line) => { out.textContent += line + '\n' }
out.textContent = ''

async function timed(url) {
  const t = performance.now()
  const res = await fetch(url)
  const ms = Math.round(performance.now() - t)
  log(`  ${res.status}  ${String(ms).padStart(4)}ms  ${url}`)
  return res
}

log("If the browser implemented Node's node_modules walk:")
const t0 = performance.now()
await timed('/simulate/src/node_modules/greeter/package.json') // miss — walk up
await timed('/simulate/node_modules/greeter/package.json')     // hit — read "exports"
await timed('/simulate/node_modules/greeter/index.js')         // the actual module
const walk = Math.round(performance.now() - t0)
log(`  ---------------------------------------------`)
log(`  TOTAL ${walk}ms to resolve ONE bare specifier\n`)

log('With an import map (name -> URL known upfront):')
const t1 = performance.now()
await timed('/simulate/cdn/greeter/index.js')
const map = Math.round(performance.now() - t1)
log(`  ---------------------------------------------`)
log(`  TOTAL ${map}ms\n`)

log(`Node's algorithm costs ${(walk / map).toFixed(1)}x more, per import,`)
log('and this is a dependency tree of depth one.')
