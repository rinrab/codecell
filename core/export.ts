namespace ExportTable {
    function rept(str: string, count: number) {
        let rv = "";
        for (let i = 0; i < count; i++) {
            rv += str;
        }
        return rv;
    }

    export function MarkDown(table: Core.Table<string | number | boolean>, minify: boolean): string {
        let text = "";

        const rows: (string | number | boolean)[][] = table.data;
        if (rows.length <= 1) {
            return "";
        }

        const colWidths: number[] = [];
        let width = 0;

        for (let y = 1; y < rows.length; y++) {
            for (let x = 0; x < rows[y].length; x++) {
                if (rows[y][x] != null) {
                    const newValue = rows[y][x].toString().length + 2;
                    if (colWidths[x]) {
                        colWidths[x] = Math.max(colWidths[x], newValue);
                    } else {
                        colWidths[x] = 1;
                    }
                }
            }
            width = Math.max(width, rows[y].length);
        }

        const firstColSize = rows.length.toString().length + 4;

        text += "|" + (minify ? "" : rept(' ', Math.floor(firstColSize / 2) - 1)) +
            '*' + (minify ? "" : rept(' ', Math.ceil(firstColSize / 2))) + '|';

        for (let i = 0; i < width; i++) {
            const val = Core.alphabet[i];
            text += val + ((minify) ? "" : rept(' ', colWidths[i] - val.length)) + '|';
        }

        text += "\n|" + rept('-', minify ? 3 : firstColSize) + "|";
        for (let i = 0; i < width; i++) {
            text += rept('-', minify ? 2 : colWidths[i] - 1) + ":|"; // НЕТ БЛИН :) ИЛИ :(
        }

        for (let y = 1; y < rows.length; y++) {
            text += "\n|**" + y + "**" + (minify ? "" : rept(' ', firstColSize - y.toString().length - 4)) + '|';
            for (let x = 0; x < width; x++) {
                let val = rows[y][x];
                if (val == undefined || val == null) {
                    val = "";
                }
                if (typeof (val) == "number") {
                    text += (minify ? "" : rept(' ', colWidths[x] - val.toString().length)) + val + '|';
                } else {
                    text += val.toString() + (minify ? "" : rept(' ', colWidths[x] - val.toString().length)) + '|';
                }
            }
        }

        return text;
    }

    function prepareCSVCell(text: string | number | boolean | null, minify: boolean): string {
        if (text == null || text == "") {
            return '""';
        } else {
            text = text.toString();
            text = text.replace(/"/g, '""');
            if (text.search(minify ? /"/g : / |,|"/g) != -1) {
                text = '"' + text + '"';
            }
            return text;
        }
    }

    export function CSV(table: Core.Table<string | number | boolean | null>, minify: boolean, isFormulas: boolean): string {
        let text = "";

        const data: (number | string | boolean | null)[][] = table.data;

        for (let y = 1; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                let cell = data[y][x];
                if (isFormulas) {
                    text += prepareCSVCell(cell, minify);
                } else {
                    text += cell.toString();
                }

                if (x != data[y].length - 1) {
                    text += ',';
                }
            }
            if (data[y].length == 0) {
                text += ','
            }
            text += '\n';
        }

        return text;
    }
}