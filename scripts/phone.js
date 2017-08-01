//local scripts
const gpio = require('./gpio.js')
const membrane = require('./membrane.js')

const hookPin = 10
const audioPin = 13

let lastKey = null

document.addEventListener("keydown", function(event) {
  //console.debug('key - ' + event.which)
  if(event.which >=48 && event.which <= 57) {
    lastKey = event.which - 48
  }
})

function setup() {
  if(process.platform === 'darwin') return
  gpio.open(audioPin)
  gpio.modeEnable()
  gpio.mode(audioPin, 0)
  gpio.open(hookPin)
  gpio.direction(hookPin, 'in')
  membrane.setup()
}

function pollNumberPad() {
  if(process.platform === 'darwin') return null
  return membrane.pollMembrane()
}

function pollKeyboard() {
  if(lastKey !== null) {
    let temp = lastKey
    lastKey = null
    return temp
  } else {
    return null
  }
}

function isOffHook() {
  return (gpio.read(hookPin) === '0') //1 for red
}

module.exports = {
  setup,
  pollNumberPad,
  pollKeyboard,
  isOffHook
}
