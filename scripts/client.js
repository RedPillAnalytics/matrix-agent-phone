//npm dependencies
const AWS = require('aws-sdk')
AWS.config.update({"accessKeyId": "***", "secretAccessKey": "***"})
AWS.config.update({region: '***'})
const s3 = new AWS.S3()
const athena = new AWS.Athena()

function getPollQuestions() {
  return s3.getObject({Bucket: '***', Key: 'questions.json'}).promise()
}

function getDayPollQuestions(day) {
  return s3.getObject({Bucket: '***', Key: 'questions-' + day + '.json'}).promise()
}

function putPollQuestions(data) {
  return s3.putObject({Bucket: '***', Key: 'agent/question/pollAnswer' + Date.now() + '.json', Body: JSON.stringify(data)}).promise()
}

function startQuery(sql, db) {
  return athena.startQueryExecution({
    QueryString: sql,
    ResultConfiguration: { 
      OutputLocation: '***'
    },
    QueryExecutionContext: {
      Database: db
    }
  }).promise()
}

function getQuery(id) {
  return athena.getQueryResults(id).promise()
}

module.exports = {
  getPollQuestions,
  getDayPollQuestions,
  putPollQuestions,
  startQuery,
  getQuery
}
