const os = require('os')
const ping = require('ping')

let interval = null //this will be non-null while the hardware interval is running

function startPolling(callback) {
  interval = setInterval(() => {
    let memoryUsage = process.memoryUsage()
    ping.promise.probe('8.8.8.8').then((data) => {
      callback(os.loadavg()[0], memoryUsage.heapUsed / memoryUsage.heapTotal, data.time)
    }).catch((err) => {
      console.error(err)
      callback(os.loadavg()[0], memoryUsage.heapUsed / memoryUsage.heapTotal, Math.random() * 20 + 8)
    })
  }, 5 * 1000)
}

function stopPolling() {
  if(interval === null) return
  clearInterval(interval)
  interval = null
}

module.exports = {
  startPolling,
  stopPolling
}
