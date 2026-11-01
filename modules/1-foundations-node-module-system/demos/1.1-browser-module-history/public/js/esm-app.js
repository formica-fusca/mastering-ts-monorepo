import { greet } from './esm-lib.js'

console.log('[esm-app] import.meta.url =', import.meta.url)
document.getElementById('out').textContent =
  'greet("world")        -> ' + greet('world') + '\n' +
  'this module\'s URL     -> ' + import.meta.url + '\n' +
  'typeof window.Greeter -> ' + typeof window.Greeter + '   (no global leaked)'
