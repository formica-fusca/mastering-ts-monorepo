// A ~40-line static file server. No dependencies, no build step.
//   node server.mjs   →   http://localhost:8080
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const publicDir = new URL('./public/', import.meta.url)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
}

// A deliberately pessimistic network: everything under /simulate/ waits 50ms,
// a realistic-ish round trip. Page 5 uses it to price Node's "probe and walk
// up" resolution as if it had to happen over HTTP.
const SIMULATED_RTT_MS = 50
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  const file = path === '/' ? '/index.html' : path

  if (file.startsWith('/simulate/')) await sleep(SIMULATED_RTT_MS)

  try {
    const body = await readFile(fileURLToPath(new URL('.' + file, publicDir)))
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(body)
    console.log(`  200  ${file}`)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('404')
    console.log(`  404  ${file}`)
  }
})

const port = Number(process.env.PORT ?? 8080)
server.listen(port, () => {
  console.log(`\n  →  http://localhost:${port}`)
  console.log('  Open the DevTools console on each page. Requests log below.\n')
})
