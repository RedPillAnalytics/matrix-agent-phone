//npm librs
const vue = require('vue/dist/vue.min.js')

//local scripts
const poll = require('./scripts/poll.js')
const phone = require('./scripts/phone.js')
const music = require('./scripts/music.js')
const hardware = require('./scripts/hardware.js')
const conference = require('./scripts/conference.js')

//charts
const surveyChart = require('./scripts/surveyChart.js')
const avgMinPerSessionByTrackVertBar = require('./scripts/avgMinPerSessionByTrackVertBar.js')
const heatmapChart = require('./scripts/heatmapChart.js')

//DOM is safe to be interacted with inside this function
document.addEventListener("DOMContentLoaded", function(event) {
  console.log('application startup')

  phone.setup()
  poll.setup()
  let currentQuestion = poll.getNextQuestion()
  let busy = false

  let graphUpdate, g, g2;

  let dashboard = new vue({
    el: '#dashboard',
    data: {
      slide: 1,
      surveyQuestion: currentQuestion.question,
      surveyAnswers: currentQuestion.answers,
      surveyLabels: currentQuestion.labels,
      surveyData: currentQuestion.data,
      numSessionsOffered: 24,
      avgMinutesPerVisit: 14,
      numUniqueAttendees: 49,
      avgAttendeesPer: 13,
      avgMinPerSessionByTrackVertBarLabels: [],
      avgMinPerSessionByTrackVertBarData: [],
      pingLabel: [],
      pingData: [],
      pingAverage: 0,
      memoryUsage: 66,
      cpuUsage: 23,
      heatmapAttendees: []
    },
    methods: {
      enter: function(element) {
        draw(element.id)
      }
    }
  })
 
  hardware.startPolling((cpuUsage, memoryUsage, pingTime) => {
    //update graph
    if(dashboard.pingData.length >= 60) { dashboard.pingData = dashboard.pingData.slice(1) }
    dashboard.pingData = dashboard.pingData.concat(pingTime)

    if(dashboard.pingLabel.length >= 60) { dashboard.pingLabel = dashboard.pingLabel.slice(1) }
    dashboard.pingLabel = dashboard.pingLabel.concat(Date.now())

    let pingAvgTotal = 0
    for(let i = 0; i < dashboard.pingData.length; i++) {
      pingAvgTotal += dashboard.pingData[i]
    }
    dashboard.pingAverage = pingAvgTotal / dashboard.pingData.length

    graphUpdate.data.datasets[0].data = dashboard.pingData
    graphUpdate.data.labels = dashboard.pingLabel
    graphUpdate.options.annotation.annotations[0].value = dashboard.pingAverage
    graphUpdate.update()

    //update gauges
    dashboard.cpuUsage = cpuUsage
    dashboard.memoryUsage = memoryUsage * 100

    g.refresh(dashboard.memoryUsage)
    g2.refresh(dashboard.cpuUsage)
  })

  setInterval(() => {
    console.log('update turnout now data')
    
    updateTurnoutData()
  }, 15 * 60 * 1000) //every 15 minutes

  setInterval(() => {
    console.log('update chart data')

    updateChartData()
  }, 5 * 60 * 1000) //every 5 minutes

  setInterval(() => {
    dashboard.slide = (dashboard.slide >=2) ? 0 : dashboard.slide + 1
    console.log('changing dashboard viz slide index to ' + dashboard.slide)
  }, 1 * 30 * 1000) //every 30 seconds

  setInterval(() => {
    let number = phone.pollNumberPad()
    if(number === null) number = phone.pollKeyboard()

    if(number !== null && busy === false) {
      busy = true
      console.log(number)
      dashboard.surveyData[parseInt(number) - 1] = dashboard.surveyData[parseInt(number) - 1] + 1
      surveyChart.redraw(dashboard.surveyLabels, dashboard.surveyData)
      poll.answerCurrentQuestion(number)

      setTimeout(() => {
        let question = poll.getNextQuestion()
        dashboard.surveyQuestion = question.question
        dashboard.surveyAnswers = question.answers
        dashboard.surveyLabels = question.labels
        dashboard.surveyData = question.data
        surveyChart.redraw(dashboard.surveyLabels, dashboard.surveyData)
        busy = false
      }, 3000)
    }

    if(process.platform === 'darwin') return
    if(phone.isOffHook()) { music.play() }
    else { music.stop() }
  }, 100)

  function updateTurnoutData() {
    conference.getAvgMinPerSessionByTrackVertBar((data) => {
      dashboard.avgMinPerSessionByTrackVertBarLabels.length = 0
      dashboard.avgMinPerSessionByTrackVertBarData.length = 0

      for(let i = 1; i < data.ResultSet.Rows.length; i++) {
        let row = data.ResultSet.Rows[i]
        let track = row.Data[0].VarCharValue
        let averageMin = row.Data[1].VarCharValue

        dashboard.avgMinPerSessionByTrackVertBarLabels = dashboard.avgMinPerSessionByTrackVertBarLabels.concat(track)
        dashboard.avgMinPerSessionByTrackVertBarData = dashboard.avgMinPerSessionByTrackVertBarData.concat(averageMin)
      }

      avgMinPerSessionByTrackVertBar.update(dashboard.avgMinPerSessionByTrackVertBarLabels, dashboard.avgMinPerSessionByTrackVertBarData)
    })

    conference.getNumSessionsOffered((data) => {
      dashboard.numSessionsOffered = data.ResultSet.Rows[1].Data[0].VarCharValue
    })

    conference.getAvgMinPerVisitTotal((data) => {
      dashboard.avgMinutesPerVisit = parseFloat(data.ResultSet.Rows[1].Data[0].VarCharValue).toFixed(1)
    })

    setTimeout(() => {
        conference.getAttendeeDayTimeHeatmap((data) => {
        dashboard.heatmapAttendees.length = 0

        for(let i = 1; i < data.ResultSet.Rows.length; i++) {
          let row = data.ResultSet.Rows[i]
          let hour = parseInt(row.Data[0].VarCharValue)
          let day = parseInt(row.Data[1].VarCharValue)
          let count = parseInt(row.Data[2].VarCharValue)

          if(hour >= 8 && hour <= 18 && (day == 7 || (day >=1 && day <= 3))) {
            if(day == 7) {
              dashboard.heatmapAttendees = dashboard.heatmapAttendees.concat({day: 1, hour: hour - 7, value: count})
            } else {
              dashboard.heatmapAttendees = dashboard.heatmapAttendees.concat({day: day + 1, hour: hour - 7, value: count})
            }
          }
        }

        /*let i,j

        let match = function(element) {
          //console.log(element.day + '=' + j + ',' + element.hour + '=' + i)
          return element.day == j && element.hour == i
        }

        for(i = 1; i <= 11; i++) {
          for(j = 1; j <= 4; j++) {
            if(dashboard.heatmapAttendees.find(match) == null) {
              //console.log(i + ',' + j)
              dashboard.heatmapAttendees = dashboard.heatmapAttendees.concat({day: j, hour: i, value: 0})
            }
          }
        }*/
      })

      conference.getNumUniqueAttendees((data) => {
        dashboard.numUniqueAttendees = data.ResultSet.Rows[1].Data[0].VarCharValue
      })

      conference.getAvgAttendeesPerSession((data) => {
        dashboard.avgAttendeesPer = parseFloat(data.ResultSet.Rows[1].Data[0].VarCharValue).toFixed(1)
      })
    }, 15 * 1000)

    
  }

  function updateChartData() {
    poll.getSurveyData(() => {
      currentQuestion = poll.getCurrentQuestion()
      dashboard.surveyData = currentQuestion.data
      surveyChart.redraw(dashboard.surveyLabels, dashboard.surveyData)
    })
  }

  function draw(slide) {
    switch(slide) {
      case 'session':
        avgMinPerSessionByTrackVertBar.draw(dashboard.avgMinPerSessionByTrackVertBarLabels, dashboard.avgMinPerSessionByTrackVertBarData)
        break;
      case 'hardware':
        var ctx = document.getElementById("piCPUChart").getContext('2d');
        graphUpdate = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [new Date(Date.now() - 60000), new Date(Date.now() - 50000),new Date(Date.now() - 40000),new Date(Date.now() - 30000),new Date(Date.now() - 20000),new Date(Date.now() - 10000),new Date(Date.now() - 1000)],
            datasets: [{ 
                data: [10, 23, 55.2, 38, 12.3,10, 32.99],
                borderColor: "#8dc63f",
                fill: false
              }
            ]
          },
          options: {
            title: {
              display: true,
              fontColor: '#eee',
              fontSize: 18,
              fontFamily: 'Raleway',
              
              text: 'Matrix Phone Roundtrip Time [ms]'
            },
            scales: {
            xAxes: [{
              type: 'time',
              time: {
                    unit: 'second'
                },
                ticks: {
                    beginAtZero:true,
                    fontColor: '#eee',
                    stepSize: 1,
                    maxRotation: 45,
                    minRotation: 45
                },
                gridLines: {
                    display: false,
                    color: '#999',
                    drawTicks: true,
                    tickMarkLength: 20
                }
            }],
            yAxes: [{
                ticks: {
                    //beginAtZero:true,
                    fontColor: '#eee',
                    //max: 100
                },
                gridLines: {
                    display: false,
                    color: '#999',
                    drawTicks: true,
                    tickMarkLength: 20
                }
                }]
            },
            legend: {
              display: false
            },
            tooltips: {
                enabled: false
            },
            annotation: {
              annotations: [{
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: dashboard.memoryUsageAverage,
                borderColor: '#8dc63f',
                borderWidth: 1,
                borderDash: [2, 2],
                label: {
                  enabled: true,
                  content: 'Average',
                  yAdjust: -16,
                  xAdjust: 200
                }
              }]
            }
          }
          
        
        });
        g = new JustGage({
          id: "gauge",
          value: dashboard.memoryUsage,
          min: 0,
          max: 100,
          title: "Heap Memory Usage",
          label: '%',
          levelColors: [
            "#8dc63f",
            "#fee08b",
            "#d73027"
          ],
          labelFontColor: '#eee',
          valueFontColor: '#eee',
          titleFontColor: '#eee'
        });
        g2 = new JustGage({
          id: "gauge2",
          value: dashboard.cpuUsage,
          min: 0,
          max: 100,
          title: "CPU Load Average",
          label: '%',
          levelColors: [
            "#8dc63f",
            "#fee08b",
            "#d73027"
          ],
          labelFontColor: '#eee',
          valueFontColor: '#eee',
          titleFontColor: '#eee'
        });
        break;
      case 'attendees':
        heatmapChart.draw(dashboard.heatmapAttendees);
        break;
      default:
        break;
    }
    
  }

  surveyChart.create(dashboard.surveyLabels, dashboard.surveyData)
  draw('hardware')
  updateTurnoutData()
  updateChartData()
})
