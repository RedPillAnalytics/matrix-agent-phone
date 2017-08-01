//npm dependencies
const fs = require('fs')
const execSync = require('child_process').execSync

const sysFsPrefix = '/sys/class/gpio/gpio' //post 3.18.x kernel

function open(pin) {
  try {
    execSync('echo ' + pin + ' > /sys/class/gpio/export', (error, stdout, stderr) => {})
  } catch(err) {
    console.log(err.stderr.toString())
  }
}

function direction(pin, direction) {
  try {
    fs.writeFileSync(sysFsPrefix + pin + '/direction', direction)
  } catch(err) {
    console.log(err)
  }
}

function write(pin, value) {
  try {
    fs.writeFileSync(sysFsPrefix + pin + '/value', value)
  } catch(err) {
    console.log(err)
  }
}

function read(pin) {
  try {
    return fs.readFileSync(sysFsPrefix + pin + '/value').toString().replace('\n', '')
  } catch(err) {
    console.log(err)
    return ''
  }
}

function mode(pin, mode) {
  try {
    execSync('pigs m ' + pin + ' ' + mode, (error, stdout, stderr) => {})
  } catch(err) {
    console.log(err.stderr.toString())
  }
}

function modeEnable() {
  try {
    execSync('pigpiod', (error, stdout, stderr) => {}) //sudo if needed
  } catch(err) {
    console.log(err.stderr.toString())
  }
}

module.exports = {
  open,
  direction,
  write,
  read,
  mode,
  modeEnable
}