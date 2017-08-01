//npm dependencies
const Chart = require('chart.js')

let surveyChart = null

function create(labels, data) {
  var ctx = document.getElementById("surveyChart").getContext('2d')

  surveyChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: '#8dc63f'
        }]
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero:true,
                    fontColor: '#eee',
                    stepSize: 1
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
                    fontColor: '#eee'
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
        }
    }
  })
}

function redraw(answers, data) {
  if(surveyChart === null) return
  surveyChart.data.datasets[0].data = data
  surveyChart.data.labels = answers
  surveyChart.update()
}


module.exports = {
  create,
  redraw
}
