namespace Core {
    export interface ExpressionTableCell {
        expression: Operator;
        offsetX: number;
        offsetY: number;
        value?: boolean | number | string;
        was?: boolean;
        isExpressionCell: true;
        text: string;
    }

    function buildExpressionTable(tree: ITreeItem[]) {
        const table: Table<ExpressionTableCell> = new Table();
        const formulas: Table<string> = new Table();
        const styles: Table<IStyle> = new Table();

        for (const item of tree) {
            const coards = getCellCoards(item.selector);

            for (const cell of coards) {
                let scanOffsetY = 0;

                for (let scanOffsetX = 0; scanOffsetX < item.values.length; scanOffsetX++) {
                    const value = item.values[scanOffsetX];
                    let newValue: boolean | number | string | Operator | IStyle = value.value;

                    if (value.type == TreeValueType.Style) {
                        const style = <IStyle>styles.get(cell.col + scanOffsetX, cell.row + scanOffsetY);
                        if (style) {
                            styles.set(cell.col + scanOffsetX, cell.row + scanOffsetY,
                                parseStyle(<string>value.value, style));
                        } else {
                            styles.set(cell.col + scanOffsetX, cell.row + scanOffsetY,
                                parseStyle(<string>value.value, {}));
                        }
                    } else {
                        if (value.type == TreeValueType.Number) {
                            newValue = { type: "number", value: <number>value.value };
                        } else if (value.type == TreeValueType.Text) {
                            newValue = { type: "text", value: <string>value.value };
                        }

                        const x = cell.col + scanOffsetX;
                        const y = cell.row + scanOffsetY;
                        table.set(x, y, <ExpressionTableCell>{
                            expression: newValue,
                            offsetX: cell.offsetX,
                            offsetY: cell.offsetY,
                            isExpressionCell: true,
                        });

                        if (typeof (value.src) == "string") {
                            formulas.set(x, y, value.src);
                        } else {
                            let text = "=";
                            for (const item of <Token[]>value.src) {
                                const cellSelector = parseCellSelector(item.value);
                                if (cellSelector) {
                                    if (cellSelector.isRange) {
                                        if (!(cellSelector).start.isColFixed) {
                                            (cellSelector).start.col += cell.offsetX;
                                        }
                                        if (!(cellSelector).start.isRowFixed) {
                                            (cellSelector).start.row += cell.offsetY;
                                        }
                                        if (!(cellSelector).end.isColFixed) {
                                            (cellSelector).end.col += cell.offsetX;
                                        }
                                        if (!(cellSelector).end.isRowFixed) {
                                            (cellSelector).end.row += cell.offsetY;
                                        }
                                        text += cellSelectorToString(cellSelector);
                                    } else {
                                        if (!(<SimpleCellSelector>cellSelector).isColFixed) {
                                            (<SimpleCellSelector>cellSelector).col += cell.offsetX;
                                        }
                                        if (!(<SimpleCellSelector>cellSelector).isRowFixed) {
                                            (<SimpleCellSelector>cellSelector).row += cell.offsetY;
                                        }
                                        text += cellSelectorToString(cellSelector) + ' ';
                                    }
                                } else {
                                    if (item.subtype == SubTokenType.Text) {
                                        text += '"' + item.value + '"';
                                    } else {
                                        text += item.value;
                                    }

                                    if (item.subtype == SubTokenType.Start) {
                                        text += '(';
                                    }
                                    if (item.subtype == SubTokenType.Stop) {
                                        text += ')';
                                    }
                                    if (item.type == FormulaTokenType.WSpace) {
                                        text += ' ';
                                    }
                                    text += ' ';
                                }
                            }
                            formulas.set(x, y, text);
                        }
                    }
                }
            }
        }

        return {
            expressions: table,
            formulas: formulas,
            styles: styles
        }
    }

    export interface CalculatedTable {
        tables: {
            [key: string]: {
                values: Table<string | number | boolean>;
                formulas: Table<string>;
                styles: Table<IStyle>;
            }
        };
        viewbox: RangeCellSelector | null;
        errors: IError[];
    }

    export function calc(tree: Tree): CalculatedTable {
        const rv: CalculatedTable = {
            tables: {},
            viewbox: tree.viewbox,
            errors: errors
        }

        const expressions: { [key: string]: Table<ExpressionTableCell> } = {};
        const formulas: { [key: string]: Table<string> } = {};
        const styles: { [key: string]: Table<IStyle> } = {};

        for (const key in tree.sheets) {
            const expressionTable = buildExpressionTable(tree.sheets[key]);

            expressions[key] = expressionTable.expressions;
            formulas[key] = expressionTable.formulas;
            styles[key] = expressionTable.styles;
        }

        for (const page in tree.sheets) {
            const table = new Table<string | number | boolean>();

            const data: ExpressionTableCell[][] = expressions[page].data;

            for (let y = 0; y < data.length; y++) {
                for (let x = 0; x < data[y].length; x++) {
                    const cell: ExpressionTableCell = data[y][x];
                    if (cell != null) {
                        let value;
                        try {
                            value = calcFormula(cell.expression, page, expressions, cell.offsetX, cell.offsetY);
                        } catch (ex) {
                            value = ex.short || "";
                            errors.push({
                                type: ex.message
                            });
                        }
                        if (value != null) {
                            table.set(x, y, value);
                        }
                    }
                }
            }

            rv.tables[page] = {
                values: table,
                formulas: formulas[page],
                styles: styles[page]
            };
        }

        return rv;
    }
}