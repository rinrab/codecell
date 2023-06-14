type Data = {
    values: Core.Table<string | number | boolean>,
    formulas: Core.Table<string>,
    styles: Core.Table<Core.IStyle>;
};

interface RenderData {
    selection: TableSelection;
    HTMLTable: HTMLTableElement;
    tHead: HTMLElement;
    tBody: HTMLElement;
    container: HTMLElement;
    formulaLine: HTMLElement;
    lastData: Data;
}

function InitRender(container: HTMLElement, formulaLine: HTMLElement): RenderData {
    const table = document.createElement("table");
    const tHead = document.createElement("thead");
    const tBody = document.createElement("tbody");
    table.appendChild(tHead);
    table.appendChild(tBody);
    container.appendChild(table);
    table.className = "table table-bordered";

    const rv = <RenderData>{
        HTMLTable: table,
        tBody: tBody,
        tHead: tHead,
        selection: null,
        container: container,
        formulaLine: formulaLine,
        lastData: null
    }

    rv.selection = new TableSelection(() => {
        renderTable(rv.lastData, rv);
    });
    const selection = rv.selection;

    addEventListener("keydown", (e: KeyboardEvent) => {
        selection.width = 0;
        for (const row of rv.lastData.values.data) {
            selection.width = Math.max(selection.width, row.length);
        }
        selection.height = rv.lastData.values.data.length;

        if ((<any>e.target).id != "editor") {
            if (e.shiftKey) {
                if (e.code == "ArrowRight") {
                    selection.expand(1, 0);
                    e.preventDefault();
                } else if (e.code == "ArrowLeft") {
                    selection.expand(-1, 0);
                    e.preventDefault();
                } else if (e.code == "ArrowDown") {
                    selection.expand(0, 1);
                    e.preventDefault();
                } else if (e.code == "ArrowUp") {
                    selection.expand(0, -1);
                    e.preventDefault();
                }
            } else {
                if (e.code == "ArrowRight") {
                    selection.move(1, 0);
                    e.preventDefault();
                } else if (e.code == "ArrowLeft") {
                    selection.move(-1, 0);
                    e.preventDefault();
                } else if (e.code == "ArrowDown") {
                    selection.move(0, 1);
                    e.preventDefault();
                } else if (e.code == "ArrowUp") {
                    selection.move(0, -1);
                    e.preventDefault();
                }
            }
        }
    });

    return rv;
}

function renderTable(data: Data, html: RenderData) {
    let toScroll: HTMLElement[] = [];
    html.tHead.innerHTML = "";
    html.tBody.innerHTML = "";
    html.lastData = data;

    let maxWidth = 0;
    for (let i = 0; i < data.values.data.length; i++) {
        maxWidth = Math.max(maxWidth, data.values.data[i].length);
    }

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<td></td>";
    for (let i = 0; i < maxWidth; i++) {
        const newHeader = document.createElement("th");
        if (i == html.selection.endX) {
            newHeader.classList.add("cell-header-selected");
        }
        newHeader.innerText = Core.alphabet[i];
        headerRow.append(newHeader);
    }
    html.tHead.append(headerRow);

    for (let y = 1; y < data.values.data.length; y++) {
        const newRow = document.createElement("tr");
        html.tBody.append(newRow)
        const newHeader = document.createElement("th");
        newHeader.innerText = y.toString();
        newHeader.classList.add("cell-header");
        if (y == html.selection.endY) {
            newHeader.classList.add("cell-header-selected");
        }
        newRow.append(newHeader);
        for (let x = 0; x < maxWidth; x++) {
            const newCol = <HTMLTableCellElement>document.createElement("td");
            let val = data.values.get(x, y);
            const style = <Core.IStyle>data.styles.get(x, y);

            let type;
            switch (typeof val) {
                case "number":
                    type = "cell-number"
                    break;
                default:
                    type = "cell";
                    break;
            }

            newCol.innerHTML = Core.renderStyle(val, style);
            newCol.classList.add("cell");
            newCol.classList.add(type);
            const above = (a: number, left: number, rigth: number) => {
                if ((left <= a && a <= rigth) || (rigth <= a && a <= left)) {
                    return true;
                } else {
                    return false;
                }
            }

            newRow.append(newCol);

            if (html.selection.startX == html.selection.endX && html.selection.startY == html.selection.endY) {
                if (html.selection.endX == x && html.selection.endY == y) {
                    newCol.classList.add("cell-selected");
                    toScroll.push(newCol);
                }
            } else if (above(x, html.selection.endX, html.selection.startX) && above(y, html.selection.endY, html.selection.startY)) {
                newCol.classList.add("select-area");
                if (html.selection.startX == x && html.selection.startY == y) {
                    newCol.classList.add("cell-selected");
                }
                toScroll.push(newCol);
            }
        }
    }

    for (const toscroll of toScroll) {
        const rect = toscroll.getBoundingClientRect();
        const x1 = html.container.scrollLeft;
        const y1 = html.container.scrollTop;
        toscroll.scrollIntoView({ block: "nearest", inline: "nearest" });

        if (x1 > html.container.scrollLeft) {
            html.container.scrollBy(-html.tHead.children[0].children[0].clientWidth, 0);
        }
        if (x1 < html.container.scrollLeft) {
            html.container.scrollBy(5, 0);
        }
        if (y1 > html.container.scrollTop) {
            html.container.scrollBy(0, -html.tHead.children[0].children[0].clientHeight);
        }
        if (y1 < html.container.scrollTop) {
            html.container.scrollBy(0, 5);
        }
    }

    const value = data.formulas.get(html.selection.startX, html.selection.startY);
    if (value == null) {
        html.formulaLine.innerText = "";
    } else {
        html.formulaLine.innerHTML = String(value);
        Main.highlight(html.formulaLine);
    }
}

class TableSelection {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    renderCallBack: () => void;
    width: number;
    height: number;

    constructor(renderCallBack: () => void) {
        this.startX = 0;
        this.startY = 1;
        this.endX = 0;
        this.endY = 1;
        this.renderCallBack = renderCallBack;
    }
    isMoveAvalible(dx: number, dy: number) {
        return 0 <= this.endX + dx && this.endX + dx < this.width &&
            1 <= this.endY + dy && this.endY + dy < this.height;
    }
    move(dx: number, dy: number) {
        if (this.startX == this.endX && this.startY == this.endY) {
            if (this.isMoveAvalible(dx, dy)) {
                this.endX += dx;
                this.endY += dy;
                this.startX = this.endX;
                this.startY = this.endY;
                this.renderCallBack();
            }
        } else {
            this.endX = this.startX;
            this.endY = this.startY;
            if (this.isMoveAvalible(dx, dy)) {
                this.endX += dx;
                this.endY += dy;
                this.startX = this.endX;
                this.startY = this.endY;
            }
            this.renderCallBack();
        }
    }
    expand(dx: number, dy: number) {
        if (this.isMoveAvalible(dx, dy)) {
            this.endX += dx;
            this.endY += dy;
            this.renderCallBack();
        }
    }
}