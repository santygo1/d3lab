//при запуске скрипта
drawGraph(d3.select("form").property("elements"));

function getArrGraph(arrObject, fieldX, fieldY) {
    // сформируем список меток по оси OX (различные элементы поля fieldX)
    // см. стр. 8-9 Теоретического материала к ЛР
    const groupObj = d3.group(arrObject, arr => arr[fieldX]);

    const arrGroup = []; // массив объектов для построения графика
    for (const entry of groupObj) {
        // выделяем минимальное и максимальное значения поля fieldY
        // для очередной метки по оси ОХ
        const minMax = d3.extent(entry[1], arr => arr[fieldY]);

        const elementGroup = {
            labelX: entry[0],
            valueMin: minMax[0],
            valueMax: minMax[1]
        };

        arrGroup.push(elementGroup);
    }
    return arrGroup;
}

function drawGraph(form) {
    if (!(form.oy[0].checked || form.oy[1].checked)) {
        alert('Чтобы построить график, выберите хотя бы одно значение по оси OY.'); // eslint-disable-line no-undef
        return;
    }

    const isGraphHorizontal = !(form.oy[0].checked && form.oy[1].checked);
    const arrGraph = getArrGraph(buildings, form.ox.value, 'Высота');
    const marginX = 50;
    const marginY = 50;
    const height = isGraphHorizontal ? 900 : 400;
    const width = isGraphHorizontal ? 400 : 900;


    let svg = d3.select('svg')
        .attr('height', height)
        .attr('width', width);

    // очищаем svg перед построением
    svg.selectAll('*').remove();

    // определяем минимальное и максимальное значение по оси OY
    const min = d3.min(arrGraph.map(d => d.valueMin)) * 0.95;
    const max = d3.max(arrGraph.map(d => d.valueMax)) * 1.05;

    let xAxisLen = width - 2 * marginX;
    let yAxisLen = height - 2 * marginY;

    // определяем шкалы для осей
    let scaleX, scaleY;

    if (isGraphHorizontal) {
        scaleY = d3.scaleBand()
            .domain(arrGraph.map(function (d) {
                return d.labelX;
            })).range([0, yAxisLen], 1);

        scaleX = d3.scaleLinear().domain([min, max]).range([0, xAxisLen]);
    } else {
        scaleX = d3.scaleBand()
            .domain(arrGraph.map(function (d) {
                return d.labelX;
            })).range([0, xAxisLen], 1);
        scaleY = d3.scaleLinear().domain([min, max]).range([yAxisLen, 0]);
    }

    // создаем оси
    let axisX = d3.axisBottom(scaleX); // горизонтальная
    let axisY = d3.axisLeft(scaleY); // вертикальная


    // отображаем ось OX, устанавливаем подписи оси ОX и угол их наклона
    svg.append('g')
        .attr('transform', `translate(${marginX}, ${height - marginY})`)
        .call(axisX)
        .attr('class', 'x-axis')
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    // отображаем ось OY
    svg.append('g')
        .attr('transform', `translate(${marginX}, ${marginY})`)
        .attr('class', 'y-axis')
        .call(axisY);

    // создаем набор вертикальных линий для сетки
    d3.selectAll('g.x-axis g.tick')
        .append('line') // добавляем линию
        .classed('grid-line', true) // добавляем класс
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -(yAxisLen));

    // создаем горизонтальные линии сетки
    d3.selectAll('g.y-axis g.tick')
        .append('line')
        .classed('grid-line', true)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', xAxisLen)
        .attr('y2', 0);

    // Получаем смещения ось X
    /* const xOffset = Number(d3.selectAll('g.x-axis g.tick')._groups[0][0]
      .outerHTML.split('translate(')[1].split(')')[0].split(',')[0]); */
    let xOffset = 18;
    let yOffset = 0;
    if (!(form.oy[0].checked && form.oy[1].checked)) {
        xOffset = 0;
        yOffset = 18;
    }

    if (form.diagram.value === 'Точечная') {
        // отображаем данные в виде точечной диаграммы
        if (form.oy[0].checked) {
            svg.selectAll('.dot')
                .data(arrGraph)
                .enter()
                .append('circle')
                .attr('r', 6)
                .attr('cx', d => isGraphHorizontal ? scaleX(d.valueMax) : scaleX(d.labelX))
                .attr('cy', d => isGraphHorizontal ? scaleY(d.labelX) : scaleY(d.valueMax))
                .attr('transform', `translate(${marginX + xOffset}, ${marginY + yOffset})`)
                .style('fill', 'red');
        }

        if (form.oy[1].checked) {
            const cSize = form.oy[0].checked ? 4 : 6;
            svg.selectAll('.dot')
                .data(arrGraph)
                .enter()
                .append('circle')
                .attr('r', cSize)
                .attr('cx', d => isGraphHorizontal ? scaleX(d.valueMin) : scaleX(d.labelX))
                .attr('cy', d => isGraphHorizontal ? scaleY(d.labelX) : scaleY(d.valueMin))
                .attr('transform', `translate(${marginX + xOffset}, ${marginY + yOffset})`)
                .style('fill', 'blue');
        }
    } else if (form.diagram.value === 'Столбчатая') {
        // отображаем данные в виде столбчатой диаграммы
        const rectWidth = 16;
        if (form.oy[0].checked) {
            svg.selectAll('.dot')
                .data(arrGraph)
                .enter()
                .append('rect')
                .attr('x', d => isGraphHorizontal ? 0 : scaleX(d.labelX) - rectWidth / 2)
                .attr('y', d => isGraphHorizontal ? scaleY(d.labelX) + yOffset - rectWidth / 2 : scaleY(d.valueMax))
                .attr('width', d => isGraphHorizontal ? scaleX(d.valueMax) : rectWidth)
                .attr('height', d => isGraphHorizontal ? rectWidth : (yAxisLen - scaleY(d.valueMax)))
                .attr('transform', `translate(${marginX + xOffset}, ${marginY})`)
                .style('fill', 'red');
        }
        if (form.oy[1].checked) {
            svg.selectAll('.dot')
                .data(arrGraph)
                .enter()
                .append('rect')
                .attr('x', d => isGraphHorizontal ? 0 : scaleX(d.labelX) - rectWidth / 2)
                .attr('y', d => isGraphHorizontal ? scaleY(d.labelX) + yOffset - rectWidth / 2 : scaleY(d.valueMin))
                .attr('width', d => isGraphHorizontal ? scaleX(d.valueMin) : rectWidth)
                .attr('height', d => isGraphHorizontal ? rectWidth : (yAxisLen - scaleY(d.valueMin)))
                .attr('transform', `translate(${marginX + xOffset}, ${marginY})`)
                .style('fill', 'blue');
        }
    }
}
