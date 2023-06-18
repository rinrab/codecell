/// <reference path="../lib/jszip/jszip.d.ts" />

namespace xlsx {
    interface SimpleCellSelector {
        col: number;
        isColFixed: boolean;
        row: number;
        isRowFixed: boolean;
        isRange: false;
        sheet?: string | null;
    }

    interface RangeCellSelector {
        start: SimpleCellSelector;
        end: SimpleCellSelector;
        isRange: true;
        sheet?: string | null;
    }

    type CellSelector = SimpleCellSelector | RangeCellSelector;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function parseCellSelector(text: string): CellSelector | null {
        function parse(text: string): SimpleCellSelector | null {
            let col = alphabet.indexOf(text[0]);
            if (col == -1) {
                return null;
            }

            let row = parseInt(text.slice(1));
            if (isNaN(row) || row < 1) {
                return null;
            }

            return {
                isRange: false,
                col: col,
                row: row,
                isColFixed: false,
                isRowFixed: false
            };
        }

        if (text.indexOf(':') == -1) {
            let selector = parse(text);
            return selector;
        } else {
            const splited = text.split(/:/);
            const start = parse(splited[0]);
            const end = parse(splited[1]);
            if (end && start) {
                return {
                    start: start,
                    end: end,
                    isRange: true,
                }
            } else {
                return null;
            }
        }
    }

    function cellSelectorToString(selector: CellSelector) {
        if (selector.isRange) {
            return alphabet[selector.start.col] + selector.start.row + '-' +
                alphabet[selector.end.col] + selector.end.row;
        } else {
            return alphabet[(<SimpleCellSelector>selector).col] + (<SimpleCellSelector>selector).row;
        }
    }

    interface TreeItem {
        left: CellSelector;
        right: string;
    }

    export function parseSheet(text: string) {
        let rv = "";
        const parser = new DOMParser();
        console.log(text);
        const xml = parser.parseFromString(text, "application/xml");

        const rows = xml.querySelectorAll("sheetData>row");

        const rangeTree: TreeItem[] = [];
        let tree: TreeItem[] = [];

        rows.forEach((row: Element, key: number, parent: NodeListOf<Element>) => {
            const cells = row.querySelectorAll("c");
            cells.forEach((cell: Element, key: number, parent: NodeListOf<Element>) => {
                let left: string, right: string;
                const formula = cell.querySelector("f");
                if (formula) {
                    if (formula.hasAttribute("ref")) {
                        left = formula.getAttribute("ref");
                        right = "=" + formula.innerHTML;
                        rangeTree.push({
                            left: parseCellSelector(left),
                            right: right
                        });
                    }
                } else {
                    left = cell.getAttribute("r");
                    const value = cell.querySelector("v");
                    if (value) {
                        right = value.innerHTML;
                        if (!isNaN(parseFloat(right))) {
                            right = parseFloat(right).toString();
                        }
                        tree.push({
                            left: parseCellSelector(left),
                            right: right
                        });
                    }
                }
            });
        });

        tree.sort((a, b) => (<SimpleCellSelector>a.left).col - (<SimpleCellSelector>b.left).col);
        for (let i = tree.length - 1; i > 0; i--) {
            const cs1 = <SimpleCellSelector>tree[i].left;
            const cs2 = <SimpleCellSelector>tree[i - 1].left;
            if (cs1.row == cs2.row && cs1.col == cs2.col + 1) {
                tree[i - 1] = {
                    left: cs2,
                    right: tree[i - 1].right + ", " + tree[i].right
                }
                tree.splice(i, 1);
            }
        }

        tree.sort((a, b) => (<SimpleCellSelector>a.left).row - (<SimpleCellSelector>b.left).row);

        for (const item of rangeTree) {
            rv += cellSelectorToString(item.left) + ": " + item.right + "\n";
        }
        for (const item of tree) {
            rv += cellSelectorToString(item.left) + ": " + item.right + "\n";
        }

        return rv;
    }

    export function parseXLSX(data: ArrayBuffer, then: (value: string) => any) {
        let a = JSZip.loadAsync(data, {});
        let rv = "";

        a.then((value: JSZip) => {
            value.file("xl/workbook.xml").async("string").then((workbook: string) => {
                let workbookDOMParser = new DOMParser();
                let workbookDOM = workbookDOMParser.parseFromString(workbook, "application/xml");
                const wbSheets = workbookDOM.querySelectorAll("sheets>sheet");
                const names: { [key: string]: string } = {};
                wbSheets.forEach((value: Element) => {
                    names["sheet" + value.getAttribute("sheetId") + ".xml"] = value.getAttribute("name");
                });

                let doneCount = 0, count = 0;
                const files = value.folder("xl/worksheets");
                const sheets: { name: string, content: string }[] = [];

                files.forEach((realativePath: string, file: JSZip.JSZipObject) => {
                    count++;
                    file.async("string").then((value: string) => {
                        const name = realativePath;
                        sheets.push({ name: names[name], content: parseSheet(value) });
                        doneCount++;
                        if (doneCount == count) {
                            let text = "";
                            for (const sheet of sheets) {
                                text += `@${sheet.name}\n${sheet.content}\n`;
                            }
                            then(text);
                        }
                    });
                });
            });
        })
    }
}