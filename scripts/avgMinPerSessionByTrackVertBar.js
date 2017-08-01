//npm dependencies
const Chart = require('chart.js')

let chart = null

function draw(labels, data) {
  var ctx = document.getElementById("avgMinPerSessionByTrackVertBar").getContext('2d')

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: '#8dc63f'
        }]
    },
    options: {
        title: {
            display: true,
            fontColor: '#eee',
            fontSize: 18,
            fontFamily: 'Raleway',
            text: 'Average Minutes Per Session By Track'
        },
        scales: {
            xAxes: [{
                scaleLabel: "Label",
                type: 'category',
                ticks: {
                    beginAtZero:true,
                    fontColor: '#eee',
                    stepSize: 1,
                    autoSkip: false,
                    minRotation: 90,
                    maxRotation: 90
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
                    beginAtZero:true,
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

function update(labels, data) {
  if(chart === null) return
  chart.data.datasets[0].data = data
  chart.data.labels = labels
  chart.update()
}


module.exports = {
  draw,
  update
}
