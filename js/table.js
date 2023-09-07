const element = document.getElementById("showTable");

element.onclick = function () {
    const table = d3.select("div.table").select("table");

    if (this.value === "Показать таблицу") {
        this.value = "Скрыть таблицу";

        const tableHeader = table.append("thead").append("tr");
        const headers = Object.keys(buildings[0]);
        tableHeader
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th").text((d) => d);

        const tableBody = table.append("tbody")
        tableBody
            .selectAll("tr")
            .data(buildings)
            .enter()
            .append("tr");
        tableBody
            .selectAll("tr")
            .data(buildings)
            .html((d) => Object.values(d)
                .map((value) => `<td>${value}</td>`)
                .join(""))
    } else {
        this.value = "Показать таблицу";
        // удалить строки таблицы
        table.select('thead').remove();
        table.select('tbody').remove();
    }
};