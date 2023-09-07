const graphSvg = d3.select("svg#graph");
const graphSVGHeight = graphSvg.node().getBoundingClientRect().height;
const graphSVGWidth = graphSvg.node().getBoundingClientRect().width;
const PRECESION = 100;

d3.select("#createGraph").on("click", (e) => {
    let from = e.target.form.from.value;
    let to = e.target.form.to.value;

    if (!(to && from)) {
        alert('Заполните поля!');
        return;
    }else{
        from = +from;
        to = +to;
    }

    if (to === from || to < from) {
        alert('Укажите верный интервал');
        return;
    }

    graphSvg.selectAll("*").remove();
    drawGraph(from, to);
})

function getGraphCoordinates(from, to) {
    const f = x => ((Math.pow(x, 3) - 1) / (8 * x - 1));

    const a = from;
    const b = to;
    const n = PRECESION;
    const h = (b - a) / (n - 1);

    let arrGraph = [];
    for (let i = 0; i < n; i++) {
        let x = a + i * h;
        arrGraph.push({'x': x, 'f': f(x)});
    }

    return arrGraph;
}

function drawGraph(from, to) {
    // если интервал графика проходит через точку разрыва
    const BREAK_POINT = 1/8
    const isBreakInterval = from < BREAK_POINT && BREAK_POINT < to;

    let beforeBreakInterval, afterBreakInterval;
    if(isBreakInterval){
        const eps = 1/PRECESION;
        beforeBreakInterval = getGraphCoordinates(from, BREAK_POINT - eps);
        afterBreakInterval = getGraphCoordinates(BREAK_POINT + eps, to)
    }

    let coordinates = isBreakInterval?
        [...beforeBreakInterval, ... afterBreakInterval] : getGraphCoordinates(from, to);

    const marginX = 50;
    const marginY = 50;

    const minMax = d3.extent(coordinates.map(d => d.x));
    let scaleX = d3.scaleLinear()
        .domain([minMax[0],minMax[1]])
        .range([0, graphSVGWidth - 2 * marginX]);

    let scaleY = d3.scaleLinear()
        .domain(d3.extent(coordinates.map(d => d.f)))
        //.domain([minMax[0]/2,minMax[1]/2])
        .range([graphSVGHeight - 2 * marginY, 0]);

    // создание осей
    let axisX = d3.axisBottom(scaleX); // горизонтальная
    let axisY = d3.axisLeft(scaleY); // вертикальная

    // отрисовка осей в SVG-элементе
    graphSvg.append("g")
        .attr("transform", `translate(${marginX}, ${scaleY(0) + marginY})`)
        .call(axisX);
    graphSvg.append("g")
        .attr("transform", `translate(${marginX + scaleX(0)}, ${marginY})`)
        .call(axisY);


    function drawLine(lineCoordinates) {
        let lineF = d3.line()
            .x(function (d) {
                return scaleX(d.x);
            })
            .y(function (d) {
                return scaleY(d.f);
            })
        graphSvg.append("path") // добавляем путь
            // созданному пути добавляются данные массива arrGraph в качестве атрибута
            .datum(lineCoordinates)
            // вычисляем координаты концов линий с помощью функции lineF
            .attr("d", lineF)
            // помемещаем путь из линий в область построения
            .attr("transform", `translate(${marginX}, ${marginY})`)
            // задаем стиль линии графика
            .style("stroke-width", "2")
            .style("stroke", "red")
    }

    if (isBreakInterval){
        drawLine(beforeBreakInterval)
        drawLine(afterBreakInterval);
    }else{
        drawLine(coordinates);
    }
}