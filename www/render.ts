class TableRenderer {
    readonly container: HTMLElement;
    readonly tHead: HTMLElement;
    readonly tBody: HTMLElement;

    private selection: TableSelection;
    private lastCalculated: Core.CalculatedTable;
    private lastName: string;

    constructor(container: HTMLElement, formulasLine: HTMLElement) {
        this.container = container;
        const table = document.createElement("table");
        this.tHead = document.createElement("thead");
        this.tBody = document.createElement("tbody");
        table.appendChild(this.tHead);
        table.appendChild(this.tBody);
        container.appendChild(table);
        table.className = "table table-bordered";
        this.selection = new TableSelection(() => this.reRender());
    }

    render(calculated: Core.CalculatedTable, name: string) {
        const lastScrollLeft = this.container.scrollLeft;
        const lastScrollTop = this.container.scrollTop;

        this.lastCalculated = calculated;
        if (name != this.lastName) {
            this.selection = new TableSelection(() => this.reRender());
        }

        this.lastName = name;

        const table = calculated.tables[name].values;

        this.tHead.innerHTML = "";
        this.tBody.innerHTML = "";

        let maxWidth = 0;
        for (let i = 0; i < table.data.length; i++) {
            maxWidth = Math.max(maxWidth, table.data[i].length);
        }

        function isBetween(x: number, a: number, b: number): boolean {
            return (a <= x && x <= b) || (b <= x && x <= a);
        }

        const headerRow = document.createElement("tr");
        headerRow.innerHTML = "<td></td>";
        for (let i = 0; i < maxWidth; i++) {
            const newHeader = document.createElement("th");
            if (i == this.selection.x) {
                newHeader.classList.add("cell-header-selected");
            }
            newHeader.innerText = Core.alphabet[i];
            headerRow.append(newHeader);
        }
        this.tHead.append(headerRow);

        let toScroll: HTMLElement[] = [];
        for (let y = 1; y < table.data.length; y++) {
            const newRow = document.createElement("tr");
            this.tBody.append(newRow);

            const newHeader = document.createElement("th");
            newHeader.innerText = y.toString();
            newHeader.classList.add("cell-header");
            if (y == this.selection.y) {
                newHeader.classList.add("cell-header-selected");
            }
            newRow.append(newHeader);

            for (let x = 0; x < maxWidth; x++) {
                const newCol = <HTMLTableCellElement>document.createElement("td");
                newRow.append(newCol);
                let val = table.get(x, y);
                const style = <Core.IStyle>calculated.tables[name].styles.get(x, y);

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

                if (x == this.selection.x && y == this.selection.y) {
                    newCol.classList.add("cell-selected");
                    toScroll.push(newCol);
                }
            }
        }

        this.container.scrollLeft = lastScrollLeft;
        this.container.scrollTop = lastScrollTop;

        for (let item of toScroll) {
            item.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    reRender() {
        console.log(this);
        this.render(this.lastCalculated, this.lastName);
    }

    relativeChangeSelection(key: string) {
        const delta: { [key: string]: number[] } = {
            "right": [1, 0],
            "left": [-1, 0],
            "down": [0, 1],
            "up": [0, -1]
        }

        if (delta[key]) {
            let maxWidth = 0;
            const data = this.lastCalculated.tables[this.lastName].values.data;
            for (let i = 0; i < data.length; i++) {
                maxWidth = Math.max(maxWidth, data[i].length);
            }

            this.selection.move(delta[key][0], delta[key][1], maxWidth, data.length);
        }
    }
}

class TableSelection {
    x: number;
    y: number;
    render: () => any;

    constructor(render: () => any) {
        this.render = render;
        this.x = 0;
        this.y = 1;
    }

    isMoveAvalible(dx: number, dy: number, width: number, height: number) {
        return 0 <= this.x + dx && this.x + dx < width &&
            1 <= this.y + dy && this.y + dy < height;
    }

    move(dx: number, dy: number, width: number, height: number) {
        if (this.isMoveAvalible(dx, dy, width, height)) {
            this.x += dx;
            this.y += dy;
            this.render();
        }
    }
}