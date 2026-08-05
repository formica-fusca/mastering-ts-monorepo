// No import. This file simply ASSUMES window.Greeter already exists,
// which is true only because of the order of the <script> tags.
console.log('[legacy-app] typeof Greeter =', typeof Greeter)
document.getElementById('out').textContent =
  'Greeter.greet("world") -> ' + Greeter.greet('world') + '\n' +
  'typeof window.Greeter  -> ' + typeof window.Greeter + '\n' +
  '\nNothing declared this dependency. Tag order is the dependency.'
