//npm dependencies
const fs = require('fs')
const path = require('path')

//local scripts
const client = require('./client.js')
const hardware = require('./hardware.js')

//globals
let questions, data, i = 0

function dayOfWeekAsString(day) {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][day];
}

function readLocalQuestions() {
  questions = JSON.parse(fs.readFileSync(path.join(__dirname, '..' + '/res/questions/questions.json')))
  if(new Date().getDay() <= 2) questions = questions.concat(JSON.parse(fs.readFileSync(path.join(__dirname, '..', '/res/questions/questions-' + dayOfWeekAsString(new Date().getDay()) + '.json'))))
}

function readRemoteQuestions() {
  client.getPollQuestions().then((data) => {
    questions = JSON.parse(data.Body)

    let day = dayOfWeekAsString(new Date().getDay())

    if(new Date().getDay() > 3) return

    client.getDayPollQuestions(day).then((data) => {
      questions = questions.concat(JSON.parse(data.Body))
    }).catch((err) => {
      console.error(err)
    })
  }).catch((err) => {
    console.error(err)
  })
}

function answerCurrentQuestion(answer) {
  let date = new Date()
  let data = {
    'date_time': date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2) + '.' + ('00' + date.getMilliseconds()).slice(-3),
    'question': questions[(i-1 > 0) ? i-1 : 0].question,
    'answer': answer
  }

  client.putPollQuestions(data).catch((err) => {
    console.log(err)
  })
}

function getCurrentQuestion() {
  return questions[(i-1 > 0) ? i-1 : 0]
}

function getNextQuestion() {
  let question = questions[i]
  i = (i === questions.length - 1) ? 0 : i + 1

  return question
}

function setup() {
  console.log('poll setup')

  //hardware.setup()
  readLocalQuestions()
  readRemoteQuestions()
}

function getSurveyData(callback) {
  client.startQuery("select question,answer,count(1) as count from question group by question,answer order by question,answer", 'agent').then((data) => {
    setTimeout(() => {
        client.getQuery(data).then((data) => {
          for(let i = 1; i < data.ResultSet.Rows.length; i++) {
            let row = data.ResultSet.Rows[i]
            let question = row.Data[0].VarCharValue
            let answer = parseInt(row.Data[1].VarCharValue) - 1
            let count = parseInt(row.Data[2].VarCharValue)

            let match = function(element) {
              return element.question == question
            }

            let item = questions.find(match)
            
            if(item !== undefined && answer >= 0 && answer <= 3) {
              item.data[answer] = count
              //console.log(item)
            }
          }
          callback()
        }).catch((err) => {
            console.log(err)
        })
        }, 10000)
    }).catch((err) => {
        console.log(err)
    })
}




module.exports = {
  setup,
  answerCurrentQuestion,
  getCurrentQuestion,
  getNextQuestion,
  getSurveyData
}
