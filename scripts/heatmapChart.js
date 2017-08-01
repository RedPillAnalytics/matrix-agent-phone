const d3 = require('d3')

function draw(data) {
    

    const margin = { top: 50, right: 0, bottom: 100, left: 30 },
        width = 700 - margin.left - margin.right,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 11),
        legendElementWidth = gridSize * 1.25,
        buckets = 9,
        colors = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'], // alternatively colorbrewer.YlGnBu[9]
        // ['#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704', '#591b03']
        days = ["Su","Mo", "Tu", "We"],
        times = ["8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p"];

    let svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", (d, i) => i * gridSize)
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", (d, i) => ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"));

    const timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text((d) => d)
        .attr("x", (d, i) => i * gridSize)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", (d, i) => ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"));

        data = data

        data.forEach(function(d) {
            d.day = d.day;
            d.hour = d.hour;
            d.value = parseInt(d.value);
        })

        console.log(d3.max(data, (d) => d.value))
        const colorScale = d3.scaleQuantile()
        .domain([0, d3.max(data, (d) => d.value)])
        .range(colors);

        const cards = svg.selectAll(".hour")
            .data(data, (d) => d.day+':'+d.hour);

        cards.append("title");

        cards.enter().append("rect")
            .attr("x", (d) => (d.hour - 1) * gridSize)
            .attr("y", (d) => (d.day - 1) * gridSize)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0])
        .merge(cards)
            .transition()
            .duration(1000)
            .style("fill", (d) => colorScale(d.value));

        cards.select("title").text((d) => d.value);

        cards.exit().remove();

        const legend = svg.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), (d) => d);

        const legend_g = legend.enter().append("g")
            .attr("class", "legend");

        legend_g.append("rect")
        .attr("x", (d, i) => legendElementWidth * i)
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", (d, i) => colors[i]);

        legend_g.append("text")
        .attr("class", "mono")
        .text((d) => "≥ " + Math.round(d))
        .attr("x", (d, i) => legendElementWidth * i)
        .attr("y", height + gridSize);

        legend.exit().remove();

    
}

function update() {
  
}

module.exports = {
  draw,
  update
}
