const shapeSVG = d3.select("svg#shape");
const shapeSVGHeight = shapeSVG.node().getBoundingClientRect().height;
const shapeSVGWidth = shapeSVG.node().getBoundingClientRect().width;


let countCache = 0;
d3.select("#createShape").on("click", (e) => {
    const count = e.target.form.count.value;

    if (count){
        if(count !== countCache){
            shapeSVG.selectAll("*").remove();
            drawShape(getShapeCoordinates(count))
            countCache = count;
        }
    }else{
        alert('Введите количество фигур');
    }
})

function getShapeCoordinates(count) {
    const
        a = shapeSVGHeight,
        b = shapeSVGWidth;
    const f = x => (Math.sqrt((1-(x*x)/(a*a))*(b*b)));

    const coord = []
    const h = 4 * a / count;
    let x = -a;

    coord.push({'x': x, 'f': f(x)})
    for (let i = 1; i < count/2; i++) {
        x += h;
        coord.push({'x': x, 'f': f(x)});
        coord.push({'x': x, 'f': -f(x)});
    }
    x = a;
    coord.push({'x': x, 'f': f(x)});

    return coord;
}

function drawShape(coordinates) {
    const marginX = 50;
    const marginY = 50;

    let scaleX = d3.scaleLinear()
        .domain(d3.extent(coordinates.map(d => d.x)))
        .range([0, shapeSVGWidth - 2 * marginX]);

    let scaleY = d3.scaleLinear()
        .domain(d3.extent(coordinates.map(d => d.f)))
        .range([shapeSVGHeight - 2 * marginY, 0]);


    shapeSVG.selectAll("circle")
        .data(coordinates)
        .enter()
        .append("circle")
        .attr("cx", d => scaleX(d.x))
        .attr("cy", d => scaleY(d.f))
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .attr("r", 14)
}
