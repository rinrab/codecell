class builder {
    static cell(key: string, refType: CellRefType): Operator {
        return {
            type: 'cell',
            refType: refType,
            key: key
        };
    }

    static cellRange(leftCell: Operator, rightCell: Operator): Operator {
        if (!leftCell) {
            throw error.na;
        }
        if (!rightCell) {
            throw error.na;
        }
        return {
            type: 'cell-range',
            left: leftCell,
            right: rightCell
        };
    }

    static functionCall(name: string, args: Operator[]): Operator {
        return {
            type: "function",
            name,
            arguments: args
        };
    }

    static number(value: number): Operator {
        return {
            type: 'number',
            value: value
        };
    }

    static text(value: string): Operator {
        return {
            type: 'text',
            value: value
        };
    }

    static logical(value: boolean): Operator {
        return {
            type: 'logical',
            value: value
        };
    }

    static binaryExpression(operator: string, left: Operator, right: Operator): Operator {
        if (!left) {
            throw error.na;
        }
        if (!right) {
            throw error.na;
        }
        return {
            type: 'binary-expression',
            operator,
            left,
            right
        };
    }

    static unaryExpression(operator: string, expression: Operator): Operator {
        if (!expression) {
            throw error.na;
        }
        return {
            type: 'unary-expression',
            operator: operator,
            operand: expression
        };
    }
}