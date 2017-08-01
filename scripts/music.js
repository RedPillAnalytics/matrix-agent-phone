const exec = require('child_process').exec

let playing = false
let process = null

function play() {
  if(playing === true) return
  playing = true
  console.log('play')

  process = exec('omxplayer -o both ./res/audio/matrix.mp3', (error, stdout, stderr) => {
    playing = false
    if (error) {
      console.error(`exec error: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    
  })
}

function stop() {
  if(playing === false) return
  playing = false
  console.log('stop')

  process.stdin.write('q')
}

module.exports = {
  play,
  stop
}
