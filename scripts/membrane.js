//local scripts
const gpio = require('./gpio.js')

const rows = [17, 27, 22, 18]
const cols = [25, 24, 23]

const membrane = [['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['*', '0', '#']]

let lastPress = 0

function setup(pin) {
  rows.forEach((element, index, array) => {
    gpio.open(element)
    gpio.direction(element, 'out')
    gpio.write(element, 0)
  })

  cols.forEach((element, index, array) => {
    gpio.open(element)
    gpio.direction(element, 'in')
  })
}

function pollMembrane() {
  let key = null

  rows.forEach((row, rindex, rarray) => {
    gpio.write(row, 1)

    cols.forEach((col, cindex, carray) => {
      let value = gpio.read(col)
      if(value == '1') key = membrane[rindex][cindex]
    })

    gpio.write(row, 0)
  })

  if(key !== null && lastPress < Date.now() - 250) {
    lastPress = Date.now()
    return key
  } else {
    return null
  }
}

module.exports = {
  setup: setup,
  pollMembrane: pollMembrane
}
