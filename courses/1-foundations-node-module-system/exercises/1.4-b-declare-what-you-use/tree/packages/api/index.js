// DO NOT EDIT. This is the code as written by a colleague. It works on every
// developer machine in the hoisted workspace. Your job is not to change it.
const leftPad = require('left-pad')
const chalk = require('chalk')
const ms = require('ms')

console.log(chalk.bold(leftPad('api up', 10)) + ' in ' + ms(42))
