// 2015 style: no exports. Just assign to the global object and hope.
// jQuery did exactly this — window.jQuery and window.$.
window.Greeter = {
  greet: function (name) {
    return 'hello ' + name
  },
}
console.log('[legacy-lib] defined window.Greeter')
