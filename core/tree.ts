namespace Core {
    export const enum TreeValueType {
        Number,
        Text,
        Expression,
        Style
    }

    export interface ITreeValue {
        type: TreeValueType
        value: number | string | Operator;
        src: string | Token[];
    }

    export interface ITreeItem {
        selector: CellSelector,
        values: ITreeValue[]
    }

    export type Tree = {
        sheets: {
            [key: string]: ITreeItem[];
        },
        viewbox: RangeCellSelector | null;
    };

    export function buildTree(tokens: Array<IToken>): Tree {
        const sheets: {
            [key: string]: ITreeItem[];
        } = {};
        let lastCol: number | null = null;
        let lastEndCol: number | null = null;
        let lastRow: number | null = null;
        let lastEndRow: number | null = null;
        let page = "UNTITLED";
        let viewbox: RangeCellSelector = null;
        let i = 0;

        if (tokens[0] && tokens[0].type == TokenType.cell) {
            const splited = tokens[0].value.split(/=/);
            if (splited[0] == "VIEWBOX") {
                viewbox = <RangeCellSelector>parseCellSelector(splited[1] || "") || null;
                i++;
            }
        }

        for (; i < tokens.length; i++) {
            if (tokens[i].type == TokenType.space) {
                i++;
            } else if (tokens[i].type == TokenType.page) {
                const id = tokens[i].value.trim().slice(1);
                page = id;
                i++;
            } else if (tokens[i].type == TokenType.cell) {
                let selector = parseCellSelector(tokens[i].value);
                if (selector) {
                    if (!selector.isRange) {
                        lastCol = (<SimpleCellSelector>selector).col;
                        lastRow = (<SimpleCellSelector>selector).row;
                        lastEndCol = null;
                        lastEndRow = null;
                    } else {
                        lastCol = selector.start.col;
                        lastRow = selector.start.row;
                        lastEndCol = selector.end.col;
                        lastEndRow = selector.end.row;
                    }
                } else {
                    let ok = true;
                    if (tokens[i].value.length == 0) {
                        ok = false;
                    }
                    for (let j = 0; j < tokens[i].value.length; j++) {
                        if (tokens[i].value[j] != '-') {
                            ok = false;
                        }
                    }
                    if (ok && lastCol != null && lastRow != null) {
                        lastRow++;
                        if (lastEndCol == null) {
                            selector = <SimpleCellSelector>{
                                col: lastCol,
                                row: lastRow,
                                isColFixed: false,
                                isRowFixed: false,
                                isRange: false,
                                sheet: null
                            }
                        } else {
                            lastEndRow++;
                            selector = <RangeCellSelector>{
                                start: {
                                    col: lastCol,
                                    row: lastRow,
                                    isColFixed: false,
                                    isRowFixed: false,
                                    isRange: false
                                },
                                end: {
                                    col: lastEndCol,
                                    row: lastEndRow,
                                    isColFixed: false,
                                    isRowFixed: false,
                                    isRange: false
                                },
                                isRange: true,
                                sheet: null
                            }
                        }
                    } else {
                        errors.push({
                            type: "Cell selector is incorrect " + tokens[i].value
                        });
                        lastCol = null;
                        lastEndCol = null;
                        lastRow = null;
                        lastEndRow = null;
                    }
                }

                let values: Array<ITreeValue> = [];
                if (selector == null) {
                    continue;
                }

                i++;

                i++;
                if (i < tokens.length && tokens[i].type == TokenType.space) {
                    i++;
                }
                while (i < tokens.length && tokens[i].type != TokenType.end) {
                    if (tokens[i].type == TokenType.cell) {
                        if (!isNaN(parseFloat(tokens[i].value))) {
                            values.push({
                                type: TreeValueType.Number,
                                value: parseFloat(tokens[i].value),
                                src: tokens[i].value
                            });
                        } else if (tokens[i].value[0] == '=') {
                            if (tokens[i].value[1] == '!') {
                                values.push({
                                    type: TreeValueType.Style,
                                    value: tokens[i].value.slice(2),
                                    src: null
                                });
                            } else {
                                try {
                                    const formulaTokens = tokenizeFormula(tokens[i].value.substring(1),
                                        defaultLanguage);
                                    const astTree = parseFormula(formulaTokens);
                                    values.push({
                                        type: TreeValueType.Expression,
                                        value: astTree,
                                        src: formulaTokens
                                    });
                                } catch (e) {
                                    values.push({
                                        type: TreeValueType.Text,
                                        value: e.message,
                                        src: e.message
                                    });
                                    errors.push({
                                        type: e.message
                                    });
                                }
                            }
                        } else {
                            values.push({
                                type: TreeValueType.Text,
                                value: tokens[i].value,
                                src: tokens[i].value
                            });
                        }
                    } else if (tokens[i].type == TokenType.text) {
                        values.push({
                            type: TreeValueType.Text,
                            value: tokens[i].value,
                            src: tokens[i].value
                        });
                    }
                    i++;
                }

                if (!sheets[page]) {
                    sheets[page] = [];
                }
                sheets[page].push({ selector: selector, values: values });
            }
        }

        return {
            sheets,
            viewbox
        }
    }
}