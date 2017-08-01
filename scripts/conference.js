const client = require('./client.js')

//session data

function getAvgMinPerSessionByTrackVertBar(callback) {
    client.startQuery("select s.sessioncategory as track, avg(minute) as average from (select sessionnumber, date_diff('minute',visitstart,visitend) as minute from session_activity) sa, session s where s.sessionid=sa.sessionnumber group by s.sessioncategory order by average desc", 'turnoutnow').then((data) => {
      setTimeout(() => {
          client.getQuery(data).then((data) => {
              callback(data)
          }).catch((err) => {
              console.error(err)
          })
      }, 10 * 1000)
  }).catch((err) => {
      console.error(err)
  })
}

function getNumSessionsOffered(callback) {
    client.startQuery("select count(sessionid) as count from session", 'turnoutnow').then((data) => {
      setTimeout(() => {
          client.getQuery(data).then((data) => {
              callback(data)
          }).catch((err) => {
              console.error(err)
          })
      }, 10 * 1000)
  }).catch((err) => {
      console.error(err)
  })
}

function getAvgMinPerVisitTotal(callback) {
    client.startQuery("select avg(minute) as average from (select date_diff('minute',visitstart,visitend) as minute from session_activity)", 'turnoutnow').then((data) => {
      setTimeout(() => {
          client.getQuery(data).then((data) => {
              callback(data)
          }).catch((err) => {
              console.error(err)
          })
      }, 10 * 1000)
  }).catch((err) => {
      console.error(err)
  })
}

//attendee data

function getAttendeeDayTimeHeatmap(callback) {
    client.startQuery("select HOUR(visitstart) as hour, DOW(visitstart) as day, count(1) as count from session_activity group by HOUR(visitstart), DOW(visitstart) order by day, hour", 'turnoutnow').then((data) => {
      setTimeout(() => {
          client.getQuery(data).then((data) => {
              callback(data)
          }).catch((err) => {
              console.error(err)
          })
      }, 10 * 1000)
  }).catch((err) => {
      console.error(err)
  })
}

function getNumUniqueAttendees(callback) {
    //SELECT count(distinct refuserid) FROM session_activity --------- turnoutnow
    client.startQuery("SELECT count(1) FROM question", 'agent').then((data) => {
      setTimeout(() => {
          client.getQuery(data).then((data) => {
              callback(data)
          }).catch((err) => {
              console.error(err)
          })
      }, 10 * 1000)
  }).catch((err) => {
      console.error(err)
  })
}

function getAvgAttendeesPerSession(callback) {
    client.startQuery("SELECT avg(count) from (SELECT sessionnumber, count(distinct refuserid) as count FROM session_activity group by sessionnumber)", 'turnoutnow').then((data) => {
      setTimeout(() => {
          client.getQuery(data).then((data) => {
              callback(data)
          }).catch((err) => {
              console.error(err)
          })
      }, 10 * 1000)
  }).catch((err) => {
      console.error(err)
  })
}

module.exports = {
  getAvgMinPerSessionByTrackVertBar,
  getNumSessionsOffered,
  getAvgMinPerVisitTotal,
  getAttendeeDayTimeHeatmap,
  getNumUniqueAttendees,
  getAvgAttendeesPerSession
}
