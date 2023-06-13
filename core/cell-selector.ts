namespace Core {
    export interface SimpleCellSelector {
        col: number;
        isColFixed: boolean;
        row: number;
        isRowFixed: boolean;
        isRange: false;
        sheet?: string | null;
    }

    export interface RangeCellSelector {
        start: SimpleCellSelector;
        end: SimpleCellSelector;
        isRange: true;
        sheet?: string | null;
    }

    export type CellSelector = SimpleCellSelector | RangeCellSelector;

    // Parse item selector. Return object with col and row parameters throw exception if can't parse it.
    // Item selector format is like "G123".
    // Column part is a one char in upper case from 'A' to 'Z'.
    // Row part is integer number from 1 to max value for number.
    export function parseCellSelector(text: string): CellSelector | null {
        const parse = (text: string): SimpleCellSelector | null => {
            if (text[0] == '[' && text[text.length - 1] == ']') {
                text = text.slice(1, text.length - 1);
                const tokens = text.split(/,/);
                if (tokens.length == 2) {
                    let col, row;
                    let isColFixed = false, isRowFixed = false;
                    if (tokens[0][0] == '$') {
                        isColFixed = true;
                        col = parseInt(tokens[0].slice(1)) - 1;
                    } else {
                        col = parseInt(tokens[0]) - 1;
                    }
                    if (tokens[1][0] == '$') {
                        isRowFixed = true;
                        row = parseInt(tokens[1].slice(1));
                    } else {
                        row = parseInt(tokens[1]);
                    }
                    if (row >= 1 && col >= 0) {
                        return {
                            col, isColFixed,
                            row, isRowFixed,
                            isRange: false
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else if (text.search(/C\$?[0-9]+R\$?[0-9]+/) != -1) {
                const colStr = text.match(/C(\$?[0-9]+)/)[1];
                const rowStr = text.match(/R(\$?[0-9]+)/)[1];
                let col, isColFixed = false;
                let row, isRowFixed = false;
                if (colStr[0] == '$') {
                    isColFixed = true;
                    col = parseInt(colStr.slice(1)) - 1;
                } else {
                    col = parseInt(colStr) - 1;
                }
                if (rowStr[0] == '$') {
                    isRowFixed = true;
                    row = parseInt(rowStr.slice(1));
                } else {
                    row = parseInt(rowStr);
                }

                if (row >= 1 && col >= 0) {
                    return {
                        col, isColFixed,
                        row, isRowFixed,
                        isRange: false
                    }
                } else {
                    return null;
                }
            } else {
                let isColFixed = false;
                if (text[0] == '$') {
                    isColFixed = true;
                    text = text.slice(1);
                }
                let col = alphabet.indexOf(text[0]);
                if (col == -1) {
                    return null;
                }

                let isRowFixed = false;
                if (text[1] == '$') {
                    isRowFixed = true;
                    text = text.slice(1);
                }
                let row = parseInt(text.slice(1));
                if (isNaN(row) || row < 1) {
                    return null;
                }

                return {
                    isRange: false,
                    col: col,
                    row: row,
                    isColFixed: isColFixed,
                    isRowFixed: isRowFixed
                };
            }
        }

        let sheet = null;
        const index = text.indexOf('!');
        if (index != -1) {
            sheet = text.slice(0, index);
            text = text.slice(index + 1);
        }

        if (text.indexOf('-') != -1 || text.indexOf(':') != -1) {
            const splited = text.split(/:|-/);
            const start = parse(splited[0]);
            const end = parse(splited[1]);
            if (end && start) {
                return {
                    start: start,
                    end: end,
                    isRange: true,
                    sheet: sheet
                }
            } else {
                return null;
            }
        } else {
            let selector = parse(text);
            if (selector) {
                selector.sheet = sheet;
            }
            return selector;
        }
    }

    export function cellSelectorToString(selector: CellSelector) {
        const toStringSimple = (selector: SimpleCellSelector): string => {
            return ((selector.isColFixed) ? "$" : "") + alphabet[selector.col] +
                ((selector.isRowFixed) ? "$" : "") + selector.row;
        }


        if (selector.isRange) {
            return (selector.sheet ? selector.sheet + '!' : "") +
                toStringSimple(selector.start) + ":" + toStringSimple(selector.end);
        } else {
            return (selector.sheet ? selector.sheet + '!' : "") +
                toStringSimple(<SimpleCellSelector>selector);
        }
    }

    export interface CellCoards {
        col: number;
        row: number;
        offsetX: number;
        offsetY: number;
        sheet: string | null;
    }

    export function getCellCoards(cellSelector: SimpleCellSelector | RangeCellSelector, offsetX = 0, offsetY = 0): CellCoards[] {
        if (cellSelector.isRange) {
            let rv: CellCoards[] = [];

            let startX = Math.min(cellSelector.start.col, cellSelector.end.col);
            let startY = Math.min(cellSelector.start.row, cellSelector.end.row);
            let endX = Math.max(cellSelector.start.col, cellSelector.end.col);
            let endY = Math.max(cellSelector.start.row, cellSelector.end.row);
            startX = (cellSelector.start.isColFixed) ? startX : startX + offsetX;
            startY = (cellSelector.start.isRowFixed) ? startY : startY + offsetY;
            endX = (cellSelector.end.isColFixed) ? endX : endX + offsetX;
            endY = (cellSelector.end.isRowFixed) ? endY : endY + offsetY;
            for (let oy = 0; oy <= endY - startY; oy++) {
                for (let ox = 0; ox <= endX - startX; ox++) {
                    rv.push({
                        col: startX + ox,
                        row: startY + oy,
                        offsetX: ox,
                        offsetY: oy,
                        sheet: cellSelector.sheet
                    })
                }
            }

            return rv;
        } else {
            cellSelector = <SimpleCellSelector>cellSelector;
            return [
                {
                    col: cellSelector.col,
                    row: cellSelector.row,
                    offsetX: 0,
                    offsetY: 0,
                    sheet: cellSelector.sheet
                }
            ];
        }
    }
}