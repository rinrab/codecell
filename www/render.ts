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
        this.selection.width = 0;
        for (const row of calculated.tables[name].values.data) {
            this.selection.width = Math.max(this.selection.width, row.length);
        }
        this.selection.height = calculated.tables[name].values.data.length;

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
            if (isBetween(i, this.selection.startX, this.selection.endX)) {
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
            if (isBetween(y, this.selection.startY, this.selection.endY)) {
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

                if (x == this.selection.startX && y == this.selection.startY) {
                    newCol.classList.add("cell-selected");
                }
                if (isBetween(x, this.selection.startX, this.selection.endX) &&
                    isBetween(y, this.selection.startY, this.selection.endY)) {
                    if (!newCol.classList.contains("cell-selected")) {
                        newCol.classList.add("select-area");
                    }
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

    relativeChangeSelection(key: string, doExpand: boolean): boolean {
        const delta: { [key: string]: number[] } = {
            "right": [1, 0],
            "left": [-1, 0],
            "down": [0, 1],
            "up": [0, -1]
        }

        if (delta[key]) {
            if (doExpand) {
                this.selection.expand(delta[key][0], delta[key][1]);
                return true;
            } else {
                this.selection.move(delta[key][0], delta[key][1]);
                return true;
            }
        }
        return false;
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