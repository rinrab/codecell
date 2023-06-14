type ValueType = string | number | boolean | Date | Error | (string | number | boolean | Date)[];

interface FormulaCalcData {
    tables: {
        [key: string]: Core.Table<ValueType | Core.ExpressionTableCell>;
    };
    curTable: string;
    offsetX: number;
    offsetY: number;
}

function calcFormula(astTree: Operator, curTable = "NONE", tables = {},
    offsetX: number = 0, offsetY: number = 0): string | number | boolean | null {
    let calcData: FormulaCalcData = { offsetX, offsetY, tables, curTable };

    let rv = getValue(astTree, calcData);
    if (Array.isArray(rv)) {
        return null;
    } else {
        return <string | number | boolean>rv;
    }
}

function calcItem(operator: Operator, calcData: FormulaCalcData): ValueType {
    return calcBinaryExpression(operator.left, operator.operator, operator.right, calcData);
}

function getValue(operator: Operator, calcData: FormulaCalcData): ValueType {
    switch (operator.type) {
        case "text":
        case "number":
        case "logical":
            return operator.value;
        case "cell":
            let cellSelector = <Core.SimpleCellSelector>Core.parseCellSelector(operator.key);
            if (cellSelector) {
                let x = (cellSelector.isColFixed) ? cellSelector.col : cellSelector.col + calcData.offsetX;
                let y = (cellSelector.isRowFixed) ? cellSelector.row : cellSelector.row + calcData.offsetY;
                const tableName = cellSelector.sheet || calcData.curTable;
                const cell = calcData.tables[tableName].get(x, y);

                if (cell && (<Core.ExpressionTableCell>cell).isExpressionCell) {
                    let expressionCell = <Core.ExpressionTableCell>cell;
                    if (expressionCell.value) {
                        return expressionCell.value;
                    } else if (expressionCell.was) {
                        throw error.ref;
                    }
                    expressionCell.was = true;
                    const val = calcFormula(expressionCell.expression, tableName,
                        calcData.tables, expressionCell.offsetX, expressionCell.offsetY);
                    expressionCell.value = val;
                    expressionCell.was = false;
                    return val;
                } else {
                    return <ValueType>cell;
                }
            } else {
                throw {
                    message: "Can't parse cell selector '" + operator.key + "'",
                    short: error.name.message
                }
            }
        case "cell-range":
            let cellRangeSelector: Core.RangeCellSelector = {
                start: <Core.SimpleCellSelector>Core.parseCellSelector(operator.left.key),
                end: <Core.SimpleCellSelector>Core.parseCellSelector(operator.right.key),
                isRange: true
            };
            if (!cellRangeSelector.start) {
                throw {
                    message: "Can't parse left part of cell selector '" + operator.left.key + "'",
                    short: error.name.message
                }
            }
            if (!cellRangeSelector.end) {
                throw {
                    message: "Can't parse right part of cell selector '" + operator.right.key + "'",
                    short: error.name.message
                }
            }

            let values: (string | number | boolean)[] = [];
            const coards = Core.getCellCoards(cellRangeSelector, calcData.offsetX, calcData.offsetY);
            const tableName = cellRangeSelector.start.sheet || calcData.curTable;
            for (const coard of coards) {
                const cell = calcData.tables[tableName].get(coard.col, coard.row);

                if (cell && (<Core.ExpressionTableCell>cell).isExpressionCell) {
                    let expressionCell = <Core.ExpressionTableCell>cell;
                    if (expressionCell.value) {
                        values.push(expressionCell.value);
                    } else if (expressionCell.was) {
                        throw error.ref;
                    } else {
                        expressionCell.was = true;
                        const val = calcFormula(expressionCell.expression, tableName, calcData.tables,
                            expressionCell.offsetX, expressionCell.offsetY);
                        expressionCell.value = val;
                        expressionCell.was = false;
                        values.push(val);
                    }
                } else {
                    values.push(<string | number | boolean>cell);
                }
            }
            return values;
        case "binary-expression":
            return calcItem(operator, calcData);
        case "function":
            return calcFunction(operator, calcData);
        case "unary-expression":
            const operand = getValue(operator.operand, calcData);
            switch (operator.operator) {
                case '-':
                    return 0 - <number>utils.parseNumber(operand);
                default:
                    return operand;
            }
    }
}

function calcBinaryExpression(left: Operator, operator: string, right: Operator, calcData: FormulaCalcData): ValueType {
    let valueLeft: ValueType = getValue(left, calcData);
    let valueRight: ValueType = getValue(right, calcData);

    if (operator == '+') {
        return Number(valueLeft) + Number(valueRight);
    } else if (operator == '-') {
        return Number(valueLeft) - Number(valueRight);
    } else if (operator == '/') {
        if (valueRight == 0) {
            throw {
                short: error.div0.message,
                message: "Can't div number to 0"
            }
        }
        return Number(valueLeft) / Number(valueRight);
    } else if (operator == '*') {
        return Number(valueLeft) * Number(valueRight);
    } else if (operator == '^') {
        return Math.pow(Number(valueLeft), Number(valueRight));
    } else if (operator == '=') {
        return valueLeft == valueRight;
    } else if (operator == '<>') {
        return valueLeft != valueRight;
    } else if (operator == '<') {
        return Number(valueLeft) < Number(valueRight);
    } else if (operator == '>') {
        return Number(valueLeft) > Number(valueRight);
    } else if (operator == '<=') {
        return Number(valueLeft) <= Number(valueRight);
    } else if (operator == '>=') {
        return Number(valueLeft) >= Number(valueRight);
    } else if (operator == '&') {
        return valueLeft.toString() + valueRight.toString();
    }
}

function calcFunction(operator: Operator, calcData: FormulaCalcData): ValueType {
    function runFormula(name: string, values: ValueType[]): ValueType {
        const curFormula = formulas[name];
        if (curFormula) {
            if (values.length == 0) {
                return (<NoArgFunction>curFormula)();
            } else if (values.length == 1) {
                return (<ArgsFunction>curFormula)(values[0]);
            } else if (values.length == 2) {
                return (<ArgsFunction>curFormula)(values[0], values[1]);
            } else if (values.length == 3) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2]);
            } else if (values.length == 4) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3]);
            } else if (values.length == 5) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3], values[4]);
            } else if (values.length == 6) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3], values[4], values[5]);
            } else if (values.length == 7) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3], values[4], values[5], values[6]);
            } else if (values.length == 8) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3], values[4], values[5], values[6], values[7]);
            } else if (values.length == 9) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3], values[4], values[5], values[6], values[7], values[8]);
            } else if (values.length == 10) {
                return (<ArgsFunction>curFormula)(values[0], values[1], values[2], values[3], values[4], values[5], values[6], values[7], values[8], values[9]);
            } else {
                throw {
                    short: error.na.message,
                    message: "Unsuported argument count " + values.length
                };
            }
        } else {
            throw {
                short: error.name.message,
                message: "Can't find function " + name
            }
        }
    }

    let values: ValueType[] = [];
    for (let value of operator.arguments) {
        values.push(getValue(value, calcData));
    }

    const rv = runFormula(operator.name, values);

    if (rv instanceof Error) {
        throw rv;
    } else {
        return rv;
    }
}
